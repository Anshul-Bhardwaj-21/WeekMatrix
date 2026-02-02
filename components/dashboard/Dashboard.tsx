import { BorderRadius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { logOut } from '@/services/auth';
import { Task, TaskMatrix, createTask, deleteTask, getTasks, updateTaskMatrix } from '@/services/tasks';
import { getCurrentWeekId } from '@/utils/dateUtils';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { AddTaskForm } from './AddTaskForm';
import { ProgressChart } from './ProgressChart';
import { TaskList } from './TaskList';
import { TaskMatrix as TaskMatrixComponent } from './TaskMatrix';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({}, 'muted');

  const loadTasks = async () => {
    if (!user) return;
    
    try {
      const userTasks = await getTasks(user.uid);
      setTasks(userTasks);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const handleAddTask = async (title: string) => {
    if (!user) return;
    
    await createTask(user.uid, title);
    await loadTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      await deleteTask(user.uid, taskId);
      await loadTasks();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete task');
    }
  };

  const handleToggleTask = async (taskId: string, day: keyof TaskMatrix, completed: boolean) => {
    if (!user) return;
    
    try {
      await updateTaskMatrix(user.uid, taskId, day, completed);
      // Optimistically update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, matrix: { ...task.matrix, [day]: completed } }
            : task
        )
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update task');
      // Reload tasks to revert optimistic update
      await loadTasks();
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logOut();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: surfaceColor }]}>
        <View>
          <ThemedText type="title">WeekMatrix</ThemedText>
          <ThemedText type="caption" style={{ color: mutedColor }}>
            Week {getCurrentWeekId()} • {user?.email}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: tintColor }]}
          onPress={handleLogout}
        >
          <ThemedText style={{ color: tintColor }}>Sign Out</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Add Task Form */}
        <AddTaskForm onAddTask={handleAddTask} />

        {/* Progress Chart */}
        <ProgressChart tasks={tasks} />

        {/* Task Matrix */}
        <TaskMatrixComponent tasks={tasks} onToggleTask={handleToggleTask} />

        {/* Task List */}
        <TaskList tasks={tasks} onDeleteTask={handleDeleteTask} />

        {/* Bottom Spacing */}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
});