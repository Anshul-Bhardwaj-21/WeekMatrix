import { DEFAULT_TASK_MATRIX, Task, TaskState, TimePeriod, WeekDay } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { clearTasks, getDemoTasks, loadTasks, saveTasks } from "@/services/taskStore";
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";

type TasksAction =
  | { type: "reset"; userId: string | null }
  | { type: "hydrate"; userId: string; tasks: Task[] }
  | { type: "add"; task: Task }
  | { type: "update"; taskId: string; updates: Partial<Omit<Task, "id" | "createdAt">> }
  | { type: "delete"; taskId: string }
  | { type: "toggleDay"; taskId: string; day: WeekDay; value?: boolean }
  | { type: "replaceAll"; tasks: Task[] };

type TasksState = {
  hydrated: boolean;
  userId: string | null;
  tasks: Task[];
};

const initialState: TasksState = {
  hydrated: false,
  userId: null,
  tasks: [],
};

const tasksReducer = (state: TasksState, action: TasksAction): TasksState => {
  switch (action.type) {
    case "reset":
      return { hydrated: false, userId: action.userId, tasks: [] };
    case "hydrate":
      return { hydrated: true, userId: action.userId, tasks: action.tasks };
    case "replaceAll":
      return { ...state, tasks: action.tasks };
    case "add":
      return { ...state, tasks: [...state.tasks, action.task] };
    case "update":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.taskId ? { ...task, ...action.updates } : task,
        ),
      };
    case "toggleDay":
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id !== action.taskId) return task;
          const current = task.matrix[action.day];
          const next = action.value ?? !current;
          return { ...task, matrix: { ...task.matrix, [action.day]: next } };
        }),
      };
    case "delete":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.taskId) };
    default:
      return state;
  }
};

export type TaskFilter = "all" | TaskState;

type TasksContextValue = {
  loading: boolean;
  tasks: Task[];
  addTask: (title: string, timePeriod: TimePeriod) => void;
  updateTask: (taskId: string, updates: { title?: string; timePeriod?: TimePeriod }) => void;
  deleteTask: (taskId: string) => void;
  setTaskState: (taskId: string, state: TaskState) => void;
  toggleTaskDay: (taskId: string, day: WeekDay, value?: boolean) => void;
  loadDemoData: () => void;
  resetAllTasks: () => Promise<void>;
};

const TasksContext = createContext<TasksContextValue | null>(null);

const createTaskId = (): string => {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading: authLoading } = useAuth();
  const activeUserId = authLoading ? null : user?.uid ?? null;

  const [{ hydrated, userId, tasks }, dispatch] = useReducer(tasksReducer, initialState);
  const latestSaveRef = useRef<{ userId: string; tasks: Task[] } | null>(null);
  const saveLoopRunningRef = useRef(false);
  const saveQueuedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      dispatch({ type: "reset", userId: activeUserId });

      if (!activeUserId) return;

      const loaded = await loadTasks(activeUserId);
      if (cancelled) return;
      dispatch({ type: "hydrate", userId: activeUserId, tasks: loaded });
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [activeUserId]);

  useEffect(() => {
    // Persist changes after initial hydration.
    // This save loop avoids dropping updates if tasks change while a save is in-flight.
    if (!hydrated) return;
    if (!activeUserId) return;
    if (userId !== activeUserId) return;

    latestSaveRef.current = { userId: activeUserId, tasks };
    saveQueuedRef.current = true;

    if (saveLoopRunningRef.current) return;
    saveLoopRunningRef.current = true;

    const flush = async () => {
      while (saveQueuedRef.current) {
        saveQueuedRef.current = false;
        const snapshot = latestSaveRef.current;
        if (!snapshot) continue;
        await saveTasks(snapshot.userId, snapshot.tasks);
      }
      saveLoopRunningRef.current = false;
    };

    flush();
  }, [activeUserId, hydrated, tasks, userId]);

  const value = useMemo<TasksContextValue>(() => {
    const requireReadyUser = (): string => {
      if (!activeUserId) {
        throw new Error("Not signed in");
      }
      if (!hydrated || userId !== activeUserId) {
        throw new Error("Tasks are still loading");
      }
      return activeUserId;
    };

    const addTask = (title: string, timePeriod: TimePeriod) => {
      requireReadyUser();
      const cleanTitle = title.trim();
      if (!cleanTitle) {
        throw new Error("Title is required");
      }

      const now = new Date().toISOString();

      // Critical: Task shape is enforced here, so UI components can trust it.
      dispatch({
        type: "add",
        task: {
          id: createTaskId(),
          title: cleanTitle,
          state: "active",
          timePeriod,
          matrix: { ...DEFAULT_TASK_MATRIX },
          createdAt: now,
        },
      });
    };

    const updateTask = (
      taskId: string,
      updates: { title?: string; timePeriod?: TimePeriod },
    ) => {
      requireReadyUser();
      const next: Partial<Omit<Task, "id" | "createdAt">> = {};

      if (updates.title !== undefined) {
        const cleanTitle = updates.title.trim();
        if (!cleanTitle) throw new Error("Title is required");
        next.title = cleanTitle;
      }

      if (updates.timePeriod !== undefined) {
        next.timePeriod = updates.timePeriod;
      }

      dispatch({ type: "update", taskId, updates: next });
    };

    const deleteTask = (taskId: string) => {
      requireReadyUser();
      dispatch({ type: "delete", taskId });
    };

    const setTaskState = (taskId: string, state: TaskState) => {
      requireReadyUser();
      dispatch({ type: "update", taskId, updates: { state } });
    };

    const toggleTaskDay = (taskId: string, day: WeekDay, value?: boolean) => {
      requireReadyUser();
      dispatch({ type: "toggleDay", taskId, day, value });
    };

    const loadDemoData = () => {
      requireReadyUser();
      if (tasks.length > 0) return;
      dispatch({ type: "replaceAll", tasks: getDemoTasks() });
    };

    const resetAllTasks = async () => {
      const readyUserId = requireReadyUser();
      dispatch({ type: "replaceAll", tasks: [] });
      await clearTasks(readyUserId);
    };

    return {
      loading: !hydrated,
      tasks,
      addTask,
      updateTask,
      deleteTask,
      setTaskState,
      toggleTaskDay,
      loadDemoData,
      resetAllTasks,
    };
  }, [activeUserId, hydrated, tasks, userId]);

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = (): TasksContextValue => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
};
