/**
 * Active Task Manager - Handles time-based task execution and notifications
 */

import { Task, TaskState } from '../types/index';
import { getTasks } from './timeMatrix';

export interface ActiveTask extends Task {
  isActive: boolean;
  timeRemaining?: number; // minutes
  shouldNotify: boolean;
}

/**
 * Get currently active tasks based on system time
 */
export const getActiveTasks = async (userId: string): Promise<ActiveTask[]> => {
  const allTasks = await getTasks(userId);
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  return allTasks.map(task => {
    const isActive = isTaskActive(task, currentTime);
    const timeRemaining = isActive ? calculateTimeRemaining(task, currentTime) : undefined;
    const shouldNotify = isActive && task.reminderEnabled && timeRemaining !== undefined && timeRemaining <= 5;
    
    return {
      ...task,
      isActive,
      timeRemaining,
      shouldNotify,
    };
  });
};

/**
 * Check if a task is currently active based on time
 */
export const isTaskActive = (task: Task, currentTime: string): boolean => {
  if (!task.startTime || !task.endTime) return false;
  
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);
  const [startHour, startMinute] = task.startTime.split(':').map(Number);
  const [endHour, endMinute] = task.endTime.split(':').map(Number);
  
  const currentMinutes = currentHour * 60 + currentMinute;
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

/**
 * Calculate time remaining for an active task
 */
export const calculateTimeRemaining = (task: Task, currentTime: string): number => {
  if (!task.endTime) return 0;
  
  const [currentHour, currentMinute] = currentTime.split(':').map(Number);
  const [endHour, endMinute] = task.endTime.split(':').map(Number);
  
  const currentMinutes = currentHour * 60 + currentMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  return Math.max(0, endMinutes - currentMinutes);
};

/**
 * Handle task completion prompt when time ends
 */
export const promptTaskCompletion = async (
  userId: string,
  task: Task,
  onComplete: (taskId: string, state: TaskState) => void
): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  
  // Show notification or prompt
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(`Task Completed: ${task.title}`, {
      body: 'How did it go? Mark as completed or skipped.',
      icon: '/assets/images/icon.png',
      requireInteraction: true,
      actions: [
        { action: 'completed', title: 'Completed' },
        { action: 'skipped', title: 'Skipped' },
      ]
    });
    
    notification.onclick = () => {
      onComplete(task.id, 'completed');
      notification.close();
    };
    
    // Auto-close after 30 seconds
    setTimeout(() => {
      notification.close();
    }, 30000);
  } else {
    // Fallback to browser confirm
    const completed = confirm(`Task "${task.title}" time is up! Did you complete it?`);
    const state: TaskState = completed ? 'completed' : 'skipped';
    onComplete(task.id, state);
  }
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission === 'denied') {
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

/**
 * Show reminder notification
 */
export const showReminderNotification = (task: Task, timeRemaining: number): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`Reminder: ${task.title}`, {
      body: `${timeRemaining} minutes remaining`,
      icon: '/assets/images/icon.png',
    });
  }
};

/**
 * Start monitoring active tasks (call this in useEffect)
 */
export const startActiveTaskMonitoring = (
  userId: string,
  onTaskUpdate: (tasks: ActiveTask[]) => void,
  onTaskComplete: (taskId: string, state: TaskState) => void
): (() => void) => {
  let intervalId: NodeJS.Timeout;
  let lastNotifiedTasks = new Set<string>();
  
  const checkTasks = async () => {
    try {
      const activeTasks = await getActiveTasks(userId);
      onTaskUpdate(activeTasks);
      
      // Handle notifications and completion prompts
      activeTasks.forEach(task => {
        if (task.shouldNotify && !lastNotifiedTasks.has(task.id)) {
          showReminderNotification(task, task.timeRemaining || 0);
          lastNotifiedTasks.add(task.id);
        }
        
        if (task.timeRemaining === 0 && task.isActive) {
          promptTaskCompletion(userId, task, onTaskComplete);
        }
      });
      
      // Clean up notification tracking for inactive tasks
      activeTasks.forEach(task => {
        if (!task.isActive) {
          lastNotifiedTasks.delete(task.id);
        }
      });
      
    } catch (error) {
      console.error('Error checking active tasks:', error);
    }
  };
  
  // Check immediately
  checkTasks();
  
  // Check every minute
  intervalId = setInterval(checkTasks, 60000);
  
  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};