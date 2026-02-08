import { DEFAULT_TASK_MATRIX, isTask, isTaskMatrix, isTaskState, isTimePeriod, Task, TaskMatrix, TaskState, TimePeriod } from "@/types";
import { readJSON, removeKey, writeJSON } from "@/services/localStorage";

const TASKS_STORAGE_KEY_LEGACY = "timematrix.tasks.v1";
const TASKS_STORAGE_KEY_PREFIX = "timematrix.tasks.v2";

const getTasksStorageKey = (userId: string): string => {
  return `${TASKS_STORAGE_KEY_PREFIX}.${userId}`;
};

const coerceISODate = (value: unknown): string | null => {
  if (typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
    return null;
  }
  if (typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toISOString();
    return null;
  }
  if (value && typeof value === "object") {
    // Firestore Timestamp-like { seconds, nanoseconds }
    const record = value as Record<string, unknown>;
    if (typeof record.seconds === "number") {
      return new Date(record.seconds * 1000).toISOString();
    }
  }
  return null;
};

const coerceMatrix = (value: unknown): TaskMatrix => {
  if (isTaskMatrix(value)) return value;
  return { ...DEFAULT_TASK_MATRIX };
};

const coerceState = (value: unknown): TaskState => {
  if (isTaskState(value)) return value;
  // Back-compat: old progress states -> treat "completed" as completed, everything else active
  if (value === "completed") return "completed";
  return "active";
};

const coerceTimePeriod = (value: unknown): TimePeriod => {
  // Back-compat: old field name `period`
  if (isTimePeriod(value)) return value;
  return "weekly";
};

const coerceTasks = (raw: unknown): Task[] => {
  if (!Array.isArray(raw)) {
    return [];
  }

  const tasks: Task[] = [];

  for (const item of raw) {
    if (isTask(item)) {
      tasks.push(item);
      continue;
    }

    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;

    const id = typeof record.id === "string" ? record.id : null;
    const title =
      typeof record.title === "string" ? record.title.trim() : null;

    if (!id || !title) continue;

    const createdAt =
      coerceISODate(record.createdAt) ?? new Date().toISOString();

    // Back-compat mappings:
    // - `timePeriod` (current) or `period` (legacy)
    // - `state` (current) or progress-style `status`
    const timePeriod = coerceTimePeriod(record.timePeriod ?? record.period);
    const state = coerceState(record.state ?? record.status);

    const matrix = coerceMatrix(record.matrix);

    tasks.push({
      id,
      title,
      state,
      timePeriod,
      matrix,
      createdAt,
    });
  }

  return tasks;
};

export const loadTasks = async (userId: string): Promise<Task[]> => {
  const storageKey = getTasksStorageKey(userId);

  const raw = await readJSON<unknown>(storageKey);
  if (raw) {
    if (!Array.isArray(raw)) {
      console.warn("Stored tasks were not an array. Clearing corrupted data.");
      await removeKey(storageKey);
      return [];
    }

    return coerceTasks(raw);
  }

  // Migration: if we don't have user-scoped tasks yet, fall back to the legacy
  // global key and migrate that data into the current user.
  const legacyRaw = await readJSON<unknown>(TASKS_STORAGE_KEY_LEGACY);
  if (!legacyRaw) return [];

  if (!Array.isArray(legacyRaw)) {
    console.warn("Legacy stored tasks were not an array. Clearing corrupted data.");
    await removeKey(TASKS_STORAGE_KEY_LEGACY);
    return [];
  }

  const tasks = coerceTasks(legacyRaw);
  await writeJSON(storageKey, tasks);
  await removeKey(TASKS_STORAGE_KEY_LEGACY);
  return tasks;
};

export const saveTasks = async (userId: string, tasks: Task[]): Promise<void> => {
  const storageKey = getTasksStorageKey(userId);

  // Defensive: only persist valid tasks. This protects against accidental UI
  // writes during refactors and keeps storage compatible across versions.
  const sanitized = tasks.filter(isTask);
  if (sanitized.length !== tasks.length) {
    console.warn("Some tasks were invalid and were not persisted.");
  }

  await writeJSON(storageKey, sanitized);
};

export const clearTasks = async (userId: string): Promise<void> => {
  const storageKey = getTasksStorageKey(userId);
  await removeKey(storageKey);
};

export const getDemoTasks = (): Task[] => {
  const now = new Date().toISOString();
  return [
    {
      id: "demo_exercise",
      title: "Exercise",
      state: "active",
      timePeriod: "daily",
      matrix: { ...DEFAULT_TASK_MATRIX, Mon: true, Wed: true, Fri: true },
      createdAt: now,
    },
    {
      id: "demo_reading",
      title: "Read 10 pages",
      state: "active",
      timePeriod: "daily",
      matrix: { ...DEFAULT_TASK_MATRIX, Tue: true, Thu: true, Sat: true },
      createdAt: now,
    },
    {
      id: "demo_review",
      title: "Weekly review",
      state: "active",
      timePeriod: "weekly",
      matrix: { ...DEFAULT_TASK_MATRIX, Sun: true },
      createdAt: now,
    },
  ];
};
