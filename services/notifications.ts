import { Task } from '../types';
import { getTimeUntilEnd } from '../utils/dateUtils';

export class NotificationService {
  private static instance: NotificationService;
  private notificationTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private permissionGranted: boolean = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    }

    return false;
  }

  scheduleTaskReminder(task: Task, onComplete: (taskId: string, completed: boolean) => void): void {
    if (!task.reminderEnabled || !task.endTime || !this.permissionGranted) {
      return;
    }

    const timeUntilEnd = getTimeUntilEnd(task.endTime);
    
    if (timeUntilEnd <= 0) {
      return; // Task already ended
    }

    // Clear existing timeout for this task
    this.clearTaskReminder(task.id);

    // Schedule notification
    const timeout = setTimeout(() => {
      this.showTaskCompletionPrompt(task, onComplete);
    }, timeUntilEnd);

    this.notificationTimeouts.set(task.id, timeout);
  }

  private showTaskCompletionPrompt(task: Task, onComplete: (taskId: string, completed: boolean) => void): void {
    const notification = new Notification(`Time's up: ${task.title}`, {
      body: 'Did you complete this task?',
      icon: '/icon.png',
      requireInteraction: true,
      actions: [
        { action: 'complete', title: 'Completed' },
        { action: 'skip', title: 'Skip' },
      ],
    });

    // Handle notification click
    notification.onclick = () => {
      const response = confirm(`Did you complete "${task.title}"?`);
      onComplete(task.id, response);
      notification.close();
    };

    // Auto-close after 30 seconds
    setTimeout(() => {
      notification.close();
    }, 30000);
  }

  clearTaskReminder(taskId: string): void {
    const timeout = this.notificationTimeouts.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.notificationTimeouts.delete(taskId);
    }
  }

  clearAllReminders(): void {
    this.notificationTimeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.notificationTimeouts.clear();
  }

  scheduleAllTaskReminders(tasks: Task[], onComplete: (taskId: string, completed: boolean) => void): void {
    this.clearAllReminders();
    
    tasks.forEach(task => {
      this.scheduleTaskReminder(task, onComplete);
    });
  }
}

export const notificationService = NotificationService.getInstance();