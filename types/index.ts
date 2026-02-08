// Legacy task structure (for migration)
export interface LegacyTask {
  id: string;
  title: string;
  matrix: {
    Mon: boolean;
    Tue: boolean;
    Wed: boolean;
    Thu: boolean;
    Fri: boolean;
    Sat: boolean;
    Sun: boolean;
  };
  createdAt?: any;
}

// New task structure
export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type TaskState = 'pending' | 'completed' | 'skipped';

export interface Task {
  id: string;
  title: string;
  description?: string;
  period: TimePeriod;
  startTime?: string; // HH:MM format
  endTime?: string;   // HH:MM format
  reminderEnabled: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface TaskProgress {
  id: string;
  taskId: string;
  date: string; // YYYY-MM-DD format
  state: TaskState;
  notes?: string;
  completedAt?: any;
  skippedAt?: any;
}

// JSON import validation constants
export const VALID_PERIODS = ['daily', 'weekly', 'monthly', 'yearly'] as const;
export const VALID_TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
export const MIN_TITLE_LENGTH = 1;
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_TASKS_PER_IMPORT = 100;

// JSON import schema
export interface TaskImportData {
  title: string;
  description?: string;
  period: TimePeriod;
  startTime?: string;
  endTime?: string;
  reminderEnabled?: boolean;
}

export interface TaskImportSchema {
  tasks: TaskImportData[];
}

// Analytics types
export interface TaskAnalytics {
  taskId: string;
  title: string;
  totalDays: number;
  completedDays: number;
  skippedDays: number;
  completionRate: number;
  streak: number;
  longestStreak: number;
}

export interface PeriodAnalytics {
  period: string; // YYYY-MM-DD or YYYY-WW format
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  tasks: TaskAnalytics[];
}

export interface DailyStreak {
  current: number;
  longest: number;
  lastCompletedDate?: string;
}

export interface WeeklyConsistency {
  completionRate: number;
  weeklyAverages: number[];
}

export interface MonthlyProgress {
  month: string; // YYYY-MM format
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
}

export interface YearlyOverview {
  year: number;
  totalTasks: number;
  completedTasks: number;
  monthlyBreakdown: MonthlyProgress[];
  streaks: DailyStreak;
}