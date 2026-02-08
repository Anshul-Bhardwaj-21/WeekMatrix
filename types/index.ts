/**
 * TimeMatrix Task Model (single source of truth)
 *
 * Requirements:
 * - id (string)
 * - title (string)
 * - state ('active' | 'completed')
 * - timePeriod ('daily' | 'weekly' | 'monthly' | 'yearly')
 * - matrix (Mon–Sun boolean map)
 * - createdAt (ISO string)
 */

export const WEEK_DAYS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export type TaskState = "active" | "completed";
export type TimePeriod = "daily" | "weekly" | "monthly" | "yearly";

export type TaskMatrix = Record<WeekDay, boolean>;

export interface Task {
  id: string;
  title: string;
  state: TaskState;
  timePeriod: TimePeriod;
  matrix: TaskMatrix;
  createdAt: string; // ISO string
}

export const TIME_PERIODS: readonly TimePeriod[] = [
  "daily",
  "weekly",
  "monthly",
  "yearly",
] as const;

export const DEFAULT_TASK_MATRIX: TaskMatrix = {
  Mon: false,
  Tue: false,
  Wed: false,
  Thu: false,
  Fri: false,
  Sat: false,
  Sun: false,
};

export const isTimePeriod = (value: unknown): value is TimePeriod => {
  return typeof value === "string" && (TIME_PERIODS as readonly string[]).includes(value);
};

export const isTaskState = (value: unknown): value is TaskState => {
  return value === "active" || value === "completed";
};

export const isTaskMatrix = (value: unknown): value is TaskMatrix => {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return WEEK_DAYS.every((day) => typeof record[day] === "boolean");
};

export const isISODateString = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.toISOString() === value;
};

export const isTask = (value: unknown): value is Task => {
  if (!value || typeof value !== "object") return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    isTaskState(task.state) &&
    isTimePeriod(task.timePeriod) &&
    isTaskMatrix(task.matrix) &&
    isISODateString(task.createdAt)
  );
};
