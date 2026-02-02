import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentWeekId } from '../utils/dateUtils';

export interface TaskMatrix {
  Mon: boolean;
  Tue: boolean;
  Wed: boolean;
  Thu: boolean;
  Fri: boolean;
  Sat: boolean;
  Sun: boolean;
}

export interface Task {
  id: string;
  title: string;
  matrix: TaskMatrix;
  createdAt: any;
}

export const createTask = async (userId: string, title: string): Promise<void> => {
  const weekId = getCurrentWeekId();
  const taskId = `task_${Date.now()}`;
  
  const defaultMatrix: TaskMatrix = {
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
    Sat: false,
    Sun: false,
  };
  
  await setDoc(doc(db, 'users', userId, 'weeks', weekId, 'tasks', taskId), {
    title,
    matrix: defaultMatrix,
    createdAt: serverTimestamp(),
  });
};

export const deleteTask = async (userId: string, taskId: string): Promise<void> => {
  const weekId = getCurrentWeekId();
  await deleteDoc(doc(db, 'users', userId, 'weeks', weekId, 'tasks', taskId));
};

export const updateTaskMatrix = async (
  userId: string, 
  taskId: string, 
  day: keyof TaskMatrix, 
  completed: boolean
): Promise<void> => {
  const weekId = getCurrentWeekId();
  await updateDoc(doc(db, 'users', userId, 'weeks', weekId, 'tasks', taskId), {
    [`matrix.${day}`]: completed,
  });
};

export const getTasks = async (userId: string): Promise<Task[]> => {
  const weekId = getCurrentWeekId();
  const tasksRef = collection(db, 'users', userId, 'weeks', weekId, 'tasks');
  const q = query(tasksRef, orderBy('createdAt', 'asc'));
  
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