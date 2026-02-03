import { DailyStreak, MonthlyProgress, TaskProgress, WeeklyConsistency, YearlyOverview } from '../types/index';
import { getTaskProgress, getTasks } from './timeMatrix';

export const calculateDailyStreak = async (userId: string): Promise<DailyStreak> => {
  const tasks = await getTasks(userId, 'daily');
  const today = new Date().toISOString().split('T')[0];
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastCompletedDate: string | undefined;
  
  // Get all progress for daily tasks
  const allProgress: TaskProgress[] = [];
  for (const task of tasks) {
    const progress = await getTaskProgress(userId, task.id);
    allProgress.push(...progress);
  }
  
  // Group by date and check completion
  const dateCompletions = new Map<string, boolean>();
  allProgress.forEach(progress => {
    if (progress.state === 'completed') {
      dateCompletions.set(progress.date, true);
      if (!lastCompletedDate || progress.date > lastCompletedDate) {
        lastCompletedDate = progress.date;
      }
    }
  });
  
  // Calculate streaks
  const sortedDates = Array.from(dateCompletions.keys()).sort().reverse();
  
  for (let i = 0; i < sortedDates.length; i++) {
    const date = sortedDates[i];
    if (dateCompletions.get(date)) {
      tempStreak++;
      if (i === 0 || isConsecutiveDay(sortedDates[i-1], date)) {
        if (date === today || (i === 0 && isYesterday(date))) {
          currentStreak = tempStreak;
        }
      } else {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  return {
    current: currentStreak,
    longest: longestStreak,
    lastCompletedDate,
  };
};

export const calculateWeeklyConsistency = async (userId: string): Promise<WeeklyConsistency> => {
  const tasks = await getTasks(userId, 'weekly');
  const weeklyAverages: number[] = [];
  
  // Get last 12 weeks of data
  const weeks = 12;
  let totalCompletionRate = 0;
  
  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const startDate = weekStart.toISOString().split('T')[0];
    const endDate = weekEnd.toISOString().split('T')[0];
    
    let weeklyCompletions = 0;
    let weeklyTotal = 0;
    
    for (const task of tasks) {
      const progress = await getTaskProgress(userId, task.id, { start: startDate, end: endDate });
      weeklyTotal++;
      if (progress.some(p => p.state === 'completed')) {
        weeklyCompletions++;
      }
    }
    
    const weekRate = weeklyTotal > 0 ? (weeklyCompletions / weeklyTotal) * 100 : 0;
    weeklyAverages.unshift(weekRate);
    totalCompletionRate += weekRate;
  }
  
  return {
    completionRate: totalCompletionRate / weeks,
    weeklyAverages,
  };
};

export const calculateMonthlyProgress = async (userId: string, year: number): Promise<MonthlyProgress[]> => {
  const monthlyProgress: MonthlyProgress[] = [];
  
  for (let month = 1; month <= 12; month++) {
    const monthStr = month.toString().padStart(2, '0');
    const monthStart = `${year}-${monthStr}-01`;
    const monthEnd = `${year}-${monthStr}-31`;
    
    const tasks = await getTasks(userId);
    let completedTasks = 0;
    let totalTasks = 0;
    
    for (const task of tasks) {
      const progress = await getTaskProgress(userId, task.id, { start: monthStart, end: monthEnd });
      if (progress.length > 0) {
        totalTasks++;
        if (progress.some(p => p.state === 'completed')) {
          completedTasks++;
        }
      }
    }
    
    monthlyProgress.push({
      month: `${year}-${monthStr}`,
      completedTasks,
      totalTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    });
  }
  
  return monthlyProgress;
};

export const calculateYearlyOverview = async (userId: string, year: number): Promise<YearlyOverview> => {
  const tasks = await getTasks(userId);
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  
  let totalTasks = 0;
  let completedTasks = 0;
  
  for (const task of tasks) {
    const progress = await getTaskProgress(userId, task.id, { start: yearStart, end: yearEnd });
    if (progress.length > 0) {
      totalTasks++;
      if (progress.some(p => p.state === 'completed')) {
        completedTasks++;
      }
    }
  }
  
  const monthlyBreakdown = await calculateMonthlyProgress(userId, year);
  const streaks = await calculateDailyStreak(userId);
  
  return {
    year,
    totalTasks,
    completedTasks,
    monthlyBreakdown,
    streaks,
  };
};

// Helper functions
function isConsecutiveDay(date1: string, date2: string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

function isYesterday(date: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date === yesterday.toISOString().split('T')[0];
}