import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ActiveTask, requestNotificationPermission, startActiveTaskMonitoring } from '@/services/activeTaskManager';
import { LegacyTask } from '@/services/taskBridge';
import { TaskMatrix as TaskMatrixType } from '@/services/tasks';
import { TaskState } from '@/types/index';
import { formatDate, getCurrentWeekDates } from '@/utils/dateUtils';
import { calculateTaskProgress } from '@/utils/progressUtils';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedText } from '../themed-text';

interface EnhancedTaskMatrixProps {
  tasks: LegacyTask[];
  userId: string;
  onToggleTask: (taskId: string, day: keyof TaskMatrixType, completed: boolean) => void;
  onTaskStateChange: (taskId: string, state: TaskState) => void;
}

export const EnhancedTaskMatrix: React.FC<EnhancedTaskMatrixProps> = ({ 
  tasks, 
  userId, 
  onToggleTask,
  onTaskStateChange 
}) => {
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);
  const [notificationPermission, setNotificationPermission] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const mutedColor = useThemeColor({}, 'muted');

  const weekDates = getCurrentWeekDates();
  const dayNames: (keyof TaskMatrixType)[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    // Request notification permission
    requestNotificationPermission().then(setNotificationPermission);

    // Start monitoring active tasks
    const cleanup = startActiveTaskMonitoring(
      userId,
      setActiveTasks,
      onTaskStateChange
    );

    return cleanup;
  }, [userId, onTaskStateChange]);

  const getTaskActiveStatus = (taskId: string) => {
    const activeTask = activeTasks.find(t => t.id === taskId);
    return activeTask || null;
  };

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
    <View style={styles.container}>
      {/* Notification Status */}
      {!notificationPermission && (
        <View style={[styles.notificationBanner, { backgroundColor: warningColor }]}>
          <ThemedText style={{ color: 'white', fontSize: 12 }}>
            Enable notifications for task reminders
          </ThemedText>
        </View>
      )}

      {/* Active Tasks Summary */}
      {activeTasks.length > 0 && (
        <View style={[styles.activeTasksBanner, { backgroundColor: tintColor }]}>
          <ThemedText style={{ color: 'white', fontWeight: '600' }}>
            {activeTasks.length} active task{activeTasks.length !== 1 ? 's' : ''}
          </ThemedText>
          {activeTasks.map(task => (
            <ThemedText key={task.id} style={{ color: 'white', fontSize: 12 }}>
              {task.title} ({task.timeRemaining}min left)
            </ThemedText>
          ))}
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.matrix, { backgroundColor: surfaceColor }]}>
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
            const activeStatus = getTaskActiveStatus(task.id);
            const isActive = activeStatus?.isActive || false;
            
            return (
              <View key={task.id} style={styles.taskRow}>
                <View style={[
                  styles.taskNameCell, 
                  { 
                    borderColor,
                    backgroundColor: isActive ? tintColor + '20' : 'transparent'
                  }
                ]}>
                  <View style={styles.taskTitleContainer}>
                    <ThemedText numberOfLines={2} style={styles.taskTitle}>
                      {task.title}
                    </ThemedText>
                    {isActive && (
                      <View style={[styles.activeIndicator, { backgroundColor: tintColor }]}>
                        <ThemedText style={[styles.activeText, { color: 'white' }]}>
                          ACTIVE
                        </ThemedText>
                      </View>
                    )}
                    {activeStatus?.timeRemaining !== undefined && (
                      <ThemedText style={[styles.timeRemaining, { color: tintColor }]}>
                        {activeStatus.timeRemaining}min left
                      </ThemedText>
                    )}
                  </View>
                </View>
                {dayNames.map((day) => (
                  <TouchableOpacity
                    key={`${task.id}-${day}`}
                    style={[styles.dayCell, { borderColor }]}
                    onPress={() => onToggleTask(task.id, day, !task.matrix[day])}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: Spacing.md,
  },
  notificationBanner: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  activeTasksBanner: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  matrix: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
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
    width: 140,
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
    width: 140,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    justifyContent: 'center',
  },
  taskTitleContainer: {
    alignItems: 'flex-start',
  },
  taskTitle: {
    fontSize: Typography.sizes.sm,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  activeIndicator: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  timeRemaining: {
    fontSize: 10,
    fontWeight: '500',
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