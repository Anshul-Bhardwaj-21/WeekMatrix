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
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TASKS_PER_IMPORT,
  MAX_TITLE_LENGTH,
  MIN_TITLE_LENGTH,
  Task,
  TaskImportData,
  TaskImportSchema,
  TaskProgress,
  TaskState,
  TimePeriod,
  VALID_PERIODS,
  VALID_TIME_REGEX,
} from "../types";

// Enhanced task management
export const createTask = async (
  userId: string,
  taskData: Omit<Task, "id" | "createdAt" | "updatedAt">,
): Promise<void> => {
  const taskId = `task_${Date.now()}`;

  await setDoc(doc(db, "users", userId, "tasks", taskId), {
    ...taskData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateTask = async (
  userId: string,
  taskId: string,
  updates: Partial<Task>,
): Promise<void> => {
  await updateDoc(doc(db, "users", userId, "tasks", taskId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTask = async (
  userId: string,
  taskId: string,
): Promise<void> => {
  const batch = writeBatch(db);

  // Delete task
  batch.delete(doc(db, "users", userId, "tasks", taskId));

  // Delete all progress records for this task
  const progressRef = collection(
    db,
    "users",
    userId,
    "tasks",
    taskId,
    "progress",
  );
  const progressSnapshot = await getDocs(progressRef);

  progressSnapshot.forEach((progressDoc) => {
    batch.delete(progressDoc.ref);
  });

  await batch.commit();
};

export const getTasks = async (
  userId: string,
  period?: TimePeriod,
): Promise<Task[]> => {
  const tasksRef = collection(db, "users", userId, "tasks");
  let q = query(tasksRef, orderBy("createdAt", "asc"));

  if (period) {
    q = query(
      tasksRef,
      where("period", "==", period),
      orderBy("createdAt", "asc"),
    );
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

export const getTask = async (
  userId: string,
  taskId: string,
): Promise<Task | null> => {
  const taskDoc = await getDoc(doc(db, "users", userId, "tasks", taskId));

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
  notes?: string,
): Promise<void> => {
  const progressId = `progress_${date}`;
  const progressData: Partial<TaskProgress> = {
    taskId,
    date,
    state,
    notes,
  };

  if (state === "completed") {
    progressData.completedAt = serverTimestamp();
  } else if (state === "skipped") {
    progressData.skippedAt = serverTimestamp();
  }

  await setDoc(
    doc(db, "users", userId, "tasks", taskId, "progress", progressId),
    progressData,
  );
};

export const getTaskProgress = async (
  userId: string,
  taskId: string,
  dateRange?: { start: string; end: string },
): Promise<TaskProgress[]> => {
  const progressRef = collection(
    db,
    "users",
    userId,
    "tasks",
    taskId,
    "progress",
  );
  let q = query(progressRef, orderBy("date", "desc"));

  if (dateRange) {
    q = query(
      progressRef,
      where("date", ">=", dateRange.start),
      where("date", "<=", dateRange.end),
      orderBy("date", "desc"),
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

// ========== HELPER VALIDATION FUNCTIONS ==========

/**
 * Validates and normalizes a title string
 * - Trims whitespace
 * - Checks length
 * - Returns clean title or throws error
 */
const validateTitle = (title: any, taskIndex: number): string => {
  // Check if title exists
  if (title === undefined || title === null) {
    throw new Error(`Task ${taskIndex + 1}: Title is required`);
  }

  // Check if it's a string
  if (typeof title !== "string") {
    throw new Error(
      `Task ${taskIndex + 1}: Title must be text (string), got ${typeof title}`,
    );
  }

  // Trim whitespace
  const cleanTitle = title.trim();

  // Check if empty after trimming
  if (cleanTitle.length === 0) {
    throw new Error(
      `Task ${taskIndex + 1}: Title cannot be empty or just spaces`,
    );
  }

  // Check length
  if (cleanTitle.length < MIN_TITLE_LENGTH) {
    throw new Error(
      `Task ${taskIndex + 1}: Title is too short (minimum 1 character)`,
    );
  }

  if (cleanTitle.length > MAX_TITLE_LENGTH) {
    throw new Error(
      `Task ${taskIndex + 1}: Title is too long (maximum ${MAX_TITLE_LENGTH} characters, got ${cleanTitle.length})`,
    );
  }

  return cleanTitle;
};

/**
 * Validates period is one of the allowed values
 */
const validatePeriod = (period: any, taskIndex: number): TimePeriod => {
  if (!period) {
    throw new Error(`Task ${taskIndex + 1}: Period is required`);
  }

  const validPeriodsArray = [...VALID_PERIODS];

  if (!validPeriodsArray.includes(period)) {
    throw new Error(
      `Task ${taskIndex + 1}: Period must be one of: ${validPeriodsArray.join(", ")}, got "${period}"`,
    );
  }

  return period as TimePeriod;
};

/**
 * Validates and normalizes time format (HH:MM)
 * Hours: 00-23
 * Minutes: 00-59
 */
const validateTime = (
  time: any,
  fieldName: string,
  taskIndex: number,
): string => {
  // If empty, that's OK (optional field)
  if (!time) {
    return "";
  }

  // Must be a string
  if (typeof time !== "string") {
    throw new Error(
      `Task ${taskIndex + 1}: ${fieldName} must be text (HH:MM format), got ${typeof time}`,
    );
  }

  // Check format with regex
  if (!VALID_TIME_REGEX.test(time)) {
    throw new Error(
      `Task ${taskIndex + 1}: ${fieldName} must be in HH:MM format (00:00 to 23:59), got "${time}"`,
    );
  }

  return time;
};

/**
 * Validates that startTime is not after endTime
 */
const validateTimeLogic = (
  startTime: string,
  endTime: string,
  taskIndex: number,
): void => {
  // Only check if both are provided
  if (!startTime || !endTime) return;

  // Convert to comparable numbers
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  const startTotalMinutes = startHour * 60 + startMin;
  const endTotalMinutes = endHour * 60 + endMin;

  if (startTotalMinutes > endTotalMinutes) {
    throw new Error(
      `Task ${taskIndex + 1}: Start time (${startTime}) cannot be after end time (${endTime})`,
    );
  }
};

/**
 * Validates description (optional)
 */
const validateDescription = (description: any, taskIndex: number): string => {
  // If not provided, return empty
  if (!description) {
    return "";
  }

  // Must be string if provided
  if (typeof description !== "string") {
    throw new Error(
      `Task ${taskIndex + 1}: Description must be text if provided`,
    );
  }

  const cleanDesc = description.trim();

  if (cleanDesc.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(
      `Task ${taskIndex + 1}: Description is too long (maximum ${MAX_DESCRIPTION_LENGTH} characters, got ${cleanDesc.length})`,
    );
  }

  return cleanDesc;
};

/**
 * Validates reminderEnabled is a boolean
 */
const validateReminderEnabled = (
  reminderEnabled: any,
  taskIndex: number,
): boolean => {
  // If not provided, default to false
  if (reminderEnabled === undefined || reminderEnabled === null) {
    return false;
  }

  // Must be boolean
  if (typeof reminderEnabled !== "boolean") {
    throw new Error(
      `Task ${taskIndex + 1}: reminderEnabled must be true or false, got ${typeof reminderEnabled}`,
    );
  }

  return reminderEnabled;
};

/**
 * Main validation function that checks the entire schema
 */
export const validateTaskImportSchema = (data: any): TaskImportSchema => {
  // ===== VALIDATE ROOT OBJECT =====

  if (!data || typeof data !== "object") {
    throw new Error("JSON must be an object");
  }

  if (!Array.isArray(data.tasks)) {
    throw new Error('JSON must have a "tasks" array');
  }

  const tasksArray = data.tasks;

  // ===== VALIDATE ARRAY SIZE =====

  if (tasksArray.length === 0) {
    throw new Error("Tasks array cannot be empty. At least 1 task is required");
  }

  if (tasksArray.length > MAX_TASKS_PER_IMPORT) {
    throw new Error(
      `Too many tasks (maximum ${MAX_TASKS_PER_IMPORT} per import, got ${tasksArray.length}). Please split into multiple imports`,
    );
  }

  // ===== VALIDATE EACH TASK =====

  const validatedTasks: TaskImportData[] = [];

  tasksArray.forEach((task: any, index: number) => {
    // Each task must be an object
    if (!task || typeof task !== "object") {
      throw new Error(`Task ${index + 1}: Must be an object`);
    }

    // Validate each field
    const title = validateTitle(task.title, index);
    const period = validatePeriod(task.period, index);
    const description = validateDescription(task.description, index);
    const startTime = validateTime(task.startTime, "Start time", index);
    const endTime = validateTime(task.endTime, "End time", index);
    const reminderEnabled = validateReminderEnabled(
      task.reminderEnabled,
      index,
    );

    // Validate time logic (start before end)
    validateTimeLogic(startTime, endTime, index);

    // Build cleaned task object
    const validatedTask: TaskImportData = {
      title,
      period,
      reminderEnabled,
    };

    // Add optional fields if provided
    if (description) {
      validatedTask.description = description;
    }
    if (startTime) {
      validatedTask.startTime = startTime;
    }
    if (endTime) {
      validatedTask.endTime = endTime;
    }

    validatedTasks.push(validatedTask);
  });

  return { tasks: validatedTasks };
};

export const importTasksFromJSON = async (
  userId: string,
  jsonData: TaskImportSchema,
): Promise<void> => {
  const batch = writeBatch(db);

  jsonData.tasks.forEach((taskData) => {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const taskRef = doc(db, "users", userId, "tasks", taskId);

    batch.set(taskRef, {
      title: taskData.title,
      description: taskData.description || "",
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
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const tasks = await getTasks(userId);

  return tasks.filter((task) => {
    if (!task.startTime || !task.endTime) return false;
    return currentTime >= task.startTime && currentTime <= task.endTime;
  });
};
