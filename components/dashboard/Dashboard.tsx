import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TasksContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Task, TIME_PERIODS, TimePeriod, WeekDay } from "@/types";
import { getCurrentWeekId } from "@/utils/dateUtils";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";
import { AddTaskForm } from "./AddTaskForm";
import { ProgressChart } from "./ProgressChart";
import { TaskList } from "./TaskList";
import { TaskMatrix } from "./TaskMatrix";

type TaskFilter = "all" | "active" | "completed";

const getPeriodLabel = (period: TimePeriod): string => {
  switch (period) {
    case "daily":
      return "Daily";
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "yearly":
      return "Yearly";
  }
};

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const {
    loading,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    setTaskState,
    toggleTaskDay,
    loadDemoData,
  } = useTasks();

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("weekly");
  const [filter, setFilter] = useState<TaskFilter>("all");

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPeriod, setEditPeriod] = useState<TimePeriod>("weekly");

  const surfaceColor = useThemeColor({}, "surface");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");

  const periodTasks = useMemo(() => {
    return tasks.filter((task) => task.timePeriod === selectedPeriod);
  }, [tasks, selectedPeriod]);

  const visibleTasks = useMemo(() => {
    if (filter === "all") return periodTasks;
    return periodTasks.filter((task) => task.state === filter);
  }, [filter, periodTasks]);

  const handleAddTask = async (title: string) => {
    try {
      addTask(title, selectedPeriod);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to add task");
    }
  };

  const handleToggleTaskDay = (taskId: string, day: WeekDay, completed: boolean) => {
    toggleTaskDay(taskId, day, completed);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to delete task");
    }
  };

  const handleToggleTaskState = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    setTaskState(taskId, task.state === "active" ? "completed" : "active");
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditPeriod(task.timePeriod);
  };

  const closeEdit = () => {
    setEditingTask(null);
    setEditTitle("");
    setEditPeriod(selectedPeriod);
  };

  const saveEdit = () => {
    if (!editingTask) return;
    try {
      updateTask(editingTask.id, { title: editTitle, timePeriod: editPeriod });
      closeEdit();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to update task");
    }
  };

  const handleLogout = async () => {
    if (!user) return;
    const title = user.isGuest ? "Exit Guest Mode" : "Sign Out";
    const message = user.isGuest
      ? "Return to the sign-in screen? Your tasks will remain on this device."
      : "Are you sure you want to sign out?";

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: user.isGuest ? "Exit" : "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch (error: any) {
            Alert.alert("Error", error?.message || "Failed to sign out");
          }
        },
      },
    ]);
  };

  const renderSegmentButton = (
    key: string,
    label: string,
    selected: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      key={key}
      style={[
        styles.segmentButton,
        {
          backgroundColor: selected ? tintColor : "transparent",
          borderColor: tintColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedText type="caption" style={{ color: selected ? "white" : tintColor }}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  const hasAnyTasks = tasks.length > 0;
  const hasAnyPeriodTasks = periodTasks.length > 0;
  const hasAnyVisibleTasks = visibleTasks.length > 0;

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: surfaceColor }]}>
        <View style={styles.headerLeft}>
          <ThemedText type="title">TimeMatrix</ThemedText>
          <ThemedText type="caption" style={{ color: mutedColor }}>
            Week {getCurrentWeekId()} • {user?.email || "Guest"}
          </ThemedText>
        </View>
        {user && (
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: tintColor }]}
            onPress={handleLogout}
          >
            <ThemedText style={{ color: tintColor }}>
              {user.isGuest ? "Exit" : "Sign Out"}
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period selection (matrix selection) */}
        <View style={[styles.controls, { backgroundColor: surfaceColor, borderColor }]}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: Spacing.sm }}>
            Time Period
          </ThemedText>
          <View style={styles.segmentRow}>
            {TIME_PERIODS.map((period) =>
              renderSegmentButton(
                period,
                getPeriodLabel(period),
                selectedPeriod === period,
                () => setSelectedPeriod(period),
              ),
            )}
          </View>

          <ThemedText
            type="defaultSemiBold"
            style={{ marginBottom: Spacing.sm, marginTop: Spacing.lg }}
          >
            Filter
          </ThemedText>
          <View style={styles.segmentRow}>
            {renderSegmentButton("all", "All", filter === "all", () => setFilter("all"))}
            {renderSegmentButton(
              "active",
              "Active",
              filter === "active",
              () => setFilter("active"),
            )}
            {renderSegmentButton(
              "completed",
              "Completed",
              filter === "completed",
              () => setFilter("completed"),
            )}
          </View>
        </View>

        <View style={styles.addTaskHeader}>
          <ThemedText type="subtitle">Add {getPeriodLabel(selectedPeriod)} Task</ThemedText>
        </View>
        <AddTaskForm onAddTask={handleAddTask} />

        {!hasAnyTasks && (
          <View style={[styles.emptyCard, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText type="subtitle" style={{ textAlign: "center" }}>
              No tasks yet
            </ThemedText>
            <ThemedText type="caption" style={{ color: mutedColor, textAlign: "center" }}>
              Load demo tasks to quickly verify the app, or add your own above.
            </ThemedText>
            <TouchableOpacity
              style={[styles.demoButton, { backgroundColor: tintColor }]}
              onPress={loadDemoData}
            >
              <ThemedText style={{ color: "white" }}>Load Demo Tasks</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {hasAnyTasks && !hasAnyPeriodTasks && (
          <View style={[styles.emptyCard, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText type="subtitle" style={{ textAlign: "center" }}>
              No {getPeriodLabel(selectedPeriod).toLowerCase()} tasks yet
            </ThemedText>
            <ThemedText type="caption" style={{ color: mutedColor, textAlign: "center" }}>
              Add a task above to start tracking this period.
            </ThemedText>
          </View>
        )}

        {hasAnyPeriodTasks && !hasAnyVisibleTasks && (
          <View style={[styles.emptyCard, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText type="subtitle" style={{ textAlign: "center" }}>
              No tasks match this filter
            </ThemedText>
            <ThemedText type="caption" style={{ color: mutedColor, textAlign: "center" }}>
              Try switching the filter to see your tasks.
            </ThemedText>
          </View>
        )}

        {hasAnyVisibleTasks && (
          <>
            {/* Progress + Matrix */}
            <ProgressChart tasks={visibleTasks} />
            <TaskMatrix tasks={visibleTasks} onToggleTask={handleToggleTaskDay} />

            {/* List view */}
            <TaskList
              tasks={visibleTasks}
              onDeleteTask={handleDeleteTask}
              onEditTask={openEdit}
              onToggleTaskState={handleToggleTaskState}
            />
          </>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={!!editingTask}
        animationType="slide"
        transparent
        onRequestClose={closeEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Edit Task</ThemedText>
              <TouchableOpacity onPress={closeEdit}>
                <ThemedText style={{ color: tintColor, fontSize: 18 }}>×</ThemedText>
              </TouchableOpacity>
            </View>

            <ThemedText type="caption" style={{ color: mutedColor, marginBottom: Spacing.sm }}>
              Title
            </ThemedText>
            <TextInput
              style={[
                styles.modalInput,
                { borderColor, color: textColor, backgroundColor: surfaceColor },
              ]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Task title"
              placeholderTextColor={mutedColor}
              maxLength={80}
              autoFocus
            />

            <ThemedText
              type="caption"
              style={{ color: mutedColor, marginBottom: Spacing.sm, marginTop: Spacing.md }}
            >
              Time Period
            </ThemedText>
            <View style={styles.segmentRow}>
              {TIME_PERIODS.map((period) =>
                renderSegmentButton(
                  `edit_${period}`,
                  getPeriodLabel(period),
                  editPeriod === period,
                  () => setEditPeriod(period),
                ),
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor }]}
                onPress={closeEdit}
              >
                <ThemedText style={{ color: mutedColor }}>Cancel</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: tintColor,
                    opacity: editTitle.trim().length === 0 ? 0.6 : 1,
                  },
                ]}
                onPress={saveEdit}
                disabled={editTitle.trim().length === 0}
              >
                <ThemedText style={{ color: "white" }}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerLeft: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  logoutButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  content: {
    flex: 1,
  },
  controls: {
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  segmentRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  segmentButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 88,
    alignItems: "center",
  },
  addTaskHeader: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  emptyCard: {
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  demoButton: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  modalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
  },
  modalFooter: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
});
