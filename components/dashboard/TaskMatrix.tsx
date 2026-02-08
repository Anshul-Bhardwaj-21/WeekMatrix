import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Task, WeekDay } from '@/types';
import { formatDate, getCurrentWeekDates } from '@/utils/dateUtils';
import { calculateTaskProgress } from '@/utils/progressUtils';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedText } from '../themed-text';

interface TaskMatrixProps {
  tasks: Task[];
  onToggleTask: (taskId: string, day: WeekDay, completed: boolean) => void;
}

export const TaskMatrix: React.FC<TaskMatrixProps> = ({ tasks, onToggleTask }) => {
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');
  const mutedColor = useThemeColor({}, 'muted');

  const weekDates = getCurrentWeekDates();
  const dayNames: WeekDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  if (tasks.length === 0) {
    return (
      <View style={[styles.emptyState, { backgroundColor: surfaceColor }]}>
        <ThemedText type="subtitle" style={{ color: mutedColor }}>
          No tasks yet
        </ThemedText>
        <ThemedText type="caption" style={{ color: mutedColor, textAlign: 'center' }}>
          Add your first task to start tracking your progress
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.container, { backgroundColor: surfaceColor }]}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={[styles.taskNameHeader, { borderColor }]}>
            <ThemedText type="defaultSemiBold">Tasks</ThemedText>
          </View>
          {dayNames.map((day, index) => (
            <View key={day} style={[styles.dayHeader, { borderColor }]}>
              <ThemedText type="defaultSemiBold" style={styles.dayText}>
                {day}
              </ThemedText>
              <ThemedText type="caption" style={{ color: mutedColor }}>
                {formatDate(weekDates[index])}
              </ThemedText>
            </View>
          ))}
          <View style={[styles.progressHeader, { borderColor }]}>
            <ThemedText type="defaultSemiBold">%</ThemedText>
          </View>
        </View>

        {/* Task Rows */}
        {tasks.map((task) => {
          const isCompleted = task.state === 'completed';

          return (
            <View key={task.id} style={styles.taskRow}>
              <View style={[styles.taskNameCell, { borderColor }]}>
                <ThemedText numberOfLines={2} style={styles.taskTitle}>
                  {task.title}
                </ThemedText>
                {isCompleted && (
                  <ThemedText type="caption" style={{ color: mutedColor }}>
                    Completed
                  </ThemedText>
                )}
              </View>
              {dayNames.map((day) => (
                <TouchableOpacity
                  key={`${task.id}-${day}`}
                  style={[styles.dayCell, { borderColor, opacity: isCompleted ? 0.4 : 1 }]}
                  onPress={() => onToggleTask(task.id, day, !task.matrix[day])}
                  disabled={isCompleted}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: task.matrix[day] ? successColor : 'transparent',
                        borderColor: task.matrix[day] ? successColor : borderColor,
                      },
                    ]}
                  >
                    {task.matrix[day] && (
                      <ThemedText style={[styles.checkmark, { color: 'white' }]}>
                        ✓
                      </ThemedText>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
              <View style={[styles.progressCell, { borderColor }]}>
                <ThemedText type="defaultSemiBold" style={{ color: tintColor }}>
                  {calculateTaskProgress(task.matrix)}%
                </ThemedText>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    margin: Spacing.md,
  },
  emptyState: {
    padding: Spacing.xxl,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    margin: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
  },
  taskNameHeader: {
    width: 120,
    padding: Spacing.md,
    borderBottomWidth: 2,
    borderRightWidth: 1,
    justifyContent: 'center',
  },
  dayHeader: {
    width: 60,
    padding: Spacing.sm,
    borderBottomWidth: 2,
    borderRightWidth: 1,
    alignItems: 'center',
  },
  progressHeader: {
    width: 50,
    padding: Spacing.md,
    borderBottomWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: Typography.sizes.sm,
  },
  taskRow: {
    flexDirection: 'row',
  },
  taskNameCell: {
    width: 120,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: Typography.sizes.sm,
    lineHeight: 18,
  },
  dayCell: {
    width: 60,
    padding: Spacing.sm,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCell: {
    width: 50,
    padding: Spacing.sm,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
