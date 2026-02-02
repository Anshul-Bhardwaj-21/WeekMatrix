import { Task, TaskMatrix } from '../services/tasks';

export const calculateTaskProgress = (matrix: TaskMatrix): number => {
  const completed = Object.values(matrix).filter(Boolean).length;
  return Math.round((completed / 7) * 100);
};

export const calculateWeeklyProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  
  const totalCells = tasks.length * 7;
  const completedCells = tasks.reduce((total, task) => {
    return total + Object.values(task.matrix).filter(Boolean).length;
  }, 0);
  
  return Math.round((completedCells / totalCells) * 100);
};

export const getProgressData = (tasks: Task[]) => {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const progressByDay = dayNames.map(day => {
    const completed = tasks.filter(task => task.matrix[day as keyof TaskMatrix]).length;
    return {
      day,
      completed,
      total: tasks.length,
      percentage: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
    };
  });
  
  return progressByDay;
};