import {
    collection,
    doc,
    getDocs,
    serverTimestamp,
    writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { LegacyTask, Task, TaskProgress } from '../types';

export const migrateLegacyTasks = async (userId: string): Promise<void> => {
  try {
    // Get all legacy weeks
    const weeksRef = collection(db, 'users', userId, 'weeks');
    const weeksSnapshot = await getDocs(weeksRef);
    
    const batch = writeBatch(db);
    let migrationCount = 0;
    
    for (const weekDoc of weeksSnapshot.docs) {
      const weekId = weekDoc.id;
      
      // Get tasks for this week
      const tasksRef = collection(db, 'users', userId, 'weeks', weekId, 'tasks');
      const tasksSnapshot = await getDocs(tasksRef);
      
      for (const taskDoc of tasksSnapshot.docs) {
        const legacyTask = { id: taskDoc.id, ...taskDoc.data() } as LegacyTask;
        
        // Create new task structure
        const newTaskId = `migrated_${legacyTask.id}`;
        const newTaskRef = doc(db, 'users', userId, 'tasks', newTaskId);
        
        const newTask: Omit<Task, 'id'> = {
          title: legacyTask.title,
          description: `Migrated from week ${weekId}`,
          period: 'weekly',
          startTime: undefined,
          endTime: undefined,
          reminderEnabled: false,
          createdAt: legacyTask.createdAt || serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        batch.set(newTaskRef, newTask);
        
        // Convert matrix to progress records
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const [year, week] = weekId.split('-');
        
        days.forEach((day, index) => {
          if (legacyTask.matrix[day as keyof typeof legacyTask.matrix]) {
            // Calculate approximate date for this day of the week
            const weekStart = getDateFromWeekNumber(parseInt(year), parseInt(week));
            const taskDate = new Date(weekStart);
            taskDate.setDate(weekStart.getDate() + index);
            
            const dateString = taskDate.toISOString().split('T')[0];
            const progressId = `progress_${dateString}`;
            const progressRef = doc(db, 'users', userId, 'tasks', newTaskId, 'progress', progressId);
            
            const progress: Omit<TaskProgress, 'id'> = {
              taskId: newTaskId,
              date: dateString,
              state: 'completed',
              completedAt: serverTimestamp(),
            };
            
            batch.set(progressRef, progress);
          }
        });
        
        migrationCount++;
      }
    }
    
    if (migrationCount > 0) {
      await batch.commit();
      console.log(`Migrated ${migrationCount} legacy tasks`);
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Helper function to get date from week number
function getDateFromWeekNumber(year: number, week: number): Date {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return ISOweekStart;
}

export const checkMigrationNeeded = async (userId: string): Promise<boolean> => {
  try {
    const weeksRef = collection(db, 'users', userId, 'weeks');
    const weeksSnapshot = await getDocs(weeksRef);
    return !weeksSnapshot.empty;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};