import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task, TaskImportSchema, TaskProgress, TaskState, TimePeriod } from '../types';

// Enhanced task management
export const createTask = async (userId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const taskId = `task_${Date.now()}`;
  
  await setDoc(doc(db, 'users', userId, 'tasks', taskId), {
    ...taskData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateTask = async (userId: string, taskId: string, updates: Partial<Task>): Promise<void> => {
  await updateDoc(doc(db, 'users', userId, 'tasks', taskId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTask = async (userId: string, taskId: string): Promise<void> => {
  const batch = writeBatch(db);
  
  // Delete task
  batch.delete(doc(db, 'users', userId, 'tasks', taskId));
  
  // Delete all progress records for this task
  const progressRef = collection(db, 'users', userId, 'tasks', taskId, 'progress');
  const progressSnapshot = await getDocs(progressRef);
  
  progressSnapshot.forEach((progressDoc) => {
    batch.delete(progressDoc.ref);
  });
  
  await batch.commit();
};

export const getTasks = async (userId: string, period?: TimePeriod): Promise<Task[]> => {
  const tasksRef = collection(db, 'users', userId, 'tasks');
  let q = query(tasksRef, orderBy('createdAt', 'asc'));
  
  if (period) {
    q = query(tasksRef, where('period', '==', period), orderBy('createdAt', 'asc'));
  }
  
  const querySnapshot = await getDocs(q);
  const tasks: Task[] = [];
  
  querySnapshot.forEach((doc) => {
    tasks.push({
      id: doc.id,
      ...doc.data(),
    } as Task);
  });
  
  return tasks;
};

export const getTask = async (userId: string, taskId: string): Promise<Task | null> => {
  const taskDoc = await getDoc(doc(db, 'users', userId, 'tasks', taskId));
  
  if (!taskDoc.exists()) {
    return null;
  }
  
  return {
    id: taskDoc.id,
    ...taskDoc.data(),
  } as Task;
};

// Progress tracking
export const updateTaskProgress = async (
  userId: string,
  taskId: string,
  date: string,
  state: TaskState,
  notes?: string
): Promise<void> => {
  const progressId = `progress_${date}`;
  const progressData: Partial<TaskProgress> = {
    taskId,
    date,
    state,
    notes,
  };
  
  if (state === 'completed') {
    progressData.completedAt = serverTimestamp();
  } else if (state === 'skipped') {
    progressData.skippedAt = serverTimestamp();
  }
  
  await setDoc(doc(db, 'users', userId, 'tasks', taskId, 'progress', progressId), progressData);
};

export const getTaskProgress = async (userId: string, taskId: string, dateRange?: { start: string; end: string }): Promise<TaskProgress[]> => {
  const progressRef = collection(db, 'users', userId, 'tasks', taskId, 'progress');
  let q = query(progressRef, orderBy('date', 'desc'));
  
  if (dateRange) {
    q = query(progressRef, 
      where('date', '>=', dateRange.start),
      where('date', '<=', dateRange.end),
      orderBy('date', 'desc')
    );
  }
  
  const querySnapshot = await getDocs(q);
  const progress: TaskProgress[] = [];
  
  querySnapshot.forEach((doc) => {
    progress.push({
      id: doc.id,
      ...doc.data(),
    } as TaskProgress);
  });
  
  return progress;
};

// JSON import functionality
export const validateTaskImportSchema = (data: any): TaskImportSchema => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid JSON format');
  }
  
  if (!Array.isArray(data.tasks)) {
    throw new Error('Tasks must be an array');
  }
  
  const validPeriods: TimePeriod[] = ['daily', 'weekly', 'monthly', 'yearly'];
  
  data.tasks.forEach((task: any, index: number) => {
    if (!task.title || typeof task.title !== 'string') {
      throw new Error(`Task ${index + 1}: Title is required and must be a string`);
    }
    
    if (!task.period || !validPeriods.includes(task.period)) {
      throw new Error(`Task ${index + 1}: Period must be one of: ${validPeriods.join(', ')}`);
    }
    
    if (task.startTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(task.startTime)) {
      throw new Error(`Task ${index + 1}: Start time must be in HH:MM format`);
    }
    
    if (task.endTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(task.endTime)) {
      throw new Error(`Task ${index + 1}: End time must be in HH:MM format`);
    }
  });
  
  return data as TaskImportSchema;
};

export const importTasksFromJSON = async (userId: string, jsonData: TaskImportSchema): Promise<void> => {
  const batch = writeBatch(db);
  
  jsonData.tasks.forEach((taskData) => {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    
    batch.set(taskRef, {
      title: taskData.title,
      description: taskData.description || '',
      period: taskData.period,
      startTime: taskData.startTime,
      endTime: taskData.endTime,
      reminderEnabled: taskData.reminderEnabled || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
  
  await batch.commit();
};

// Get active tasks (for current time)
export const getActiveTasks = async (userId: string): Promise<Task[]> => {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const tasks = await getTasks(userId);
  
  return tasks.filter(task => {
    if (!task.startTime || !task.endTime) return false;
    return currentTime >= task.startTime && currentTime <= task.endTime;
  });
};