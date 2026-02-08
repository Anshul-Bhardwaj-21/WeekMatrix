import { BorderRadius, Spacing, Typography } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Task } from "@/types";
import { calculateTaskProgress } from "@/utils/progressUtils";
import React from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../themed-text";

interface TaskListProps {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void | Promise<void>;
  onEditTask: (task: Task) => void;
  onToggleTaskState: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onDeleteTask,
  onEditTask,
  onToggleTaskState,
}) => {
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const errorColor = useThemeColor({}, "error");
  const mutedColor = useThemeColor({}, "muted");

  const confirmDelete = (task: Task) => {
    Alert.alert("Delete Task", `Are you sure you want to delete "${task.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => void onDeleteTask(task.id),
      },
    ]);
  };

  const renderTask = ({ item: task }: { item: Task }) => {
    const progress = calculateTaskProgress(task.matrix);
    const isCompleted = task.state === "completed";

    return (
      <View
        style={[
          styles.taskItem,
          {
            backgroundColor: surfaceColor,
            borderColor,
            opacity: isCompleted ? 0.75 : 1,
          },
        ]}
      >
        <View style={styles.taskContent}>
          <ThemedText type="defaultSemiBold" numberOfLines={2}>
            {task.title}
          </ThemedText>
          <ThemedText type="caption" style={{ color: mutedColor }}>
            {isCompleted ? "Completed" : "Active"} • {task.timePeriod}
          </ThemedText>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: borderColor }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: tintColor,
                    width: `${progress}%`,
                  },
                ]}
              />
            </View>
            <ThemedText type="caption" style={{ color: mutedColor }}>
              {progress}%
            </ThemedText>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.smallButton, { borderColor }]}
            onPress={() => onEditTask(task)}
          >
            <ThemedText type="caption" style={{ color: tintColor }}>
              Edit
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.smallButton,
              {
                borderColor: tintColor,
                backgroundColor: isCompleted ? "transparent" : tintColor,
              },
            ]}
            onPress={() => onToggleTaskState(task.id)}
          >
            <ThemedText
              type="caption"
              style={{ color: isCompleted ? tintColor : "white" }}
            >
              {isCompleted ? "Activate" : "Complete"}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: errorColor }]}
            onPress={() => confirmDelete(task)}
          >
            <ThemedText style={[styles.deleteButtonText, { color: "white" }]}>
              ×
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (tasks.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Tasks ({tasks.length})
      </ThemedText>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: Spacing.md,
  },
  title: {
    marginBottom: Spacing.md,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  taskContent: {
    flex: 1,
  },
  actions: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  smallButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    lineHeight: Typography.sizes.lg,
  },
});

