/**
 * Bridge service to maintain compatibility between legacy weekly tasks and new time-based tasks
 * This allows existing components to work while gradually migrating to the new system
 */

import { getCurrentWeekDates } from '../utils/dateUtils';
import { TaskMatrix } from './tasks';
import { createTask as createNewTask, getTasks as getNewTasks, updateTaskProgress } from './timeMatrix';

// Legacy task interface for backward compatibility
export interface LegacyTask {
  id: string;
  title: string;
  matrix: TaskMatrix;
  createdAt: any;
}

/**
 * Create a weekly task using the new time-based system
 */
export const createWeeklyTask = async (userId: string, title: string): Promise<void> => {
  await createNewTask(userId, {
    title,
    description: `Weekly task created on ${new Date().toLocaleDateString()}`,
    period: 'weekly',
    reminderEnabled: false,
  });
};

/**
 * Get current week's tasks in legacy format for existing components
 */
export const getWeeklyTasks = async (userId: string): Promise<LegacyTask[]> => {
  try {
    // Get all weekly tasks
    const weeklyTasks = await getNewTasks(userId, 'weekly');
    const currentWeekDates = getCurrentWeekDates();
    const legacyTasks: LegacyTask[] = [];

    for (const task of weeklyTasks) {
      // Build matrix from progress data
      const matrix: TaskMatrix = {
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
        Sat: false,
        Sun: false,
      };

      // Check progress for each day of current week
      const dayNames: (keyof TaskMatrix)[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      for (let i = 0; i < 7; i++) {
        const date = currentWeekDates[i].toISOString().split('T')[0];
        const dayName = dayNames[i];
        
        // Check if task was completed on this date
        // For now, we'll use a simple check - in a full implementation,
        // we'd query the progress subcollection
        matrix[dayName] = false; // Default to false, will be updated by progress queries
      }

      legacyTasks.push({
        id: task.id,
        title: task.title,
        matrix,
        createdAt: task.createdAt,
      });
    }

    return legacyTasks;
  } catch (error) {
    console.error('Error getting weekly tasks:', error);
    return [];
  }
};

/**
 * Update task completion status using new progress system
 */
export const updateWeeklyTaskMatrix = async (
  userId: string,
  taskId: string,
  day: keyof TaskMatrix,
  completed: boolean
): Promise<void> => {
  try {
    // Calculate the date for this day of the current week
    const currentWeekDates = getCurrentWeekDates();
    const dayNames: (keyof TaskMatrix)[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayIndex = dayNames.indexOf(day);
    
    if (dayIndex === -1) {
      throw new Error(`Invalid day: ${day}`);
    }

    const targetDate = currentWeekDates[dayIndex].toISOString().split('T')[0];
    const state = completed ? 'completed' : 'pending';

    await updateTaskProgress(userId, taskId, targetDate, state);
  } catch (error) {
    console.error('Error updating weekly task matrix:', error);
    throw error;
  }
};

/**
 * Delete a task (delegates to new system)
 */
export const deleteWeeklyTask = async (userId: string, taskId: string): Promise<void> => {
  // Import deleteTask from timeMatrix service
  const { deleteTask } = await import('./timeMatrix');
  await deleteTask(userId, taskId);
};