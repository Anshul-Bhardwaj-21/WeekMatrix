import { BorderRadius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { logOut } from '@/services/auth';
import { checkMigrationNeeded, migrateLegacyTasks } from '@/services/migration';
import { createWeeklyTask, deleteWeeklyTask, getWeeklyTasks, LegacyTask, updateWeeklyTaskMatrix } from '@/services/taskBridge';
import { TaskMatrix } from '@/services/tasks';
import { updateTaskProgress } from '@/services/timeMatrix';
import { TaskState } from '@/types/index';
import { getCurrentWeekId } from '@/utils/dateUtils';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { AddTaskForm } from './AddTaskForm';
import { EnhancedTaskMatrix } from './EnhancedTaskMatrix';
import { JSONImport } from './JSONImport';
import { ProgressChart } from './ProgressChart';
import { TaskList } from './TaskList';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<LegacyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showJSONImport, setShowJSONImport] = useState(false);
  const [migrationNeeded, setMigrationNeeded] = useState(false);

  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({}, 'muted');

  const loadTasks = async () => {
    if (!user) return;
    
    try {
      // Check if migration is needed
      const needsMigration = await checkMigrationNeeded(user.uid);
      setMigrationNeeded(needsMigration);
      
      const userTasks = await getWeeklyTasks(user.uid);
      setTasks(userTasks);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMigration = async () => {
    if (!user) return;
    
    Alert.alert(
      'Migrate Legacy Data',
      'Would you like to migrate your existing weekly tasks to the new TimeMatrix format?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Migrate',
          onPress: async () => {
            try {
              await migrateLegacyTasks(user.uid);
              Alert.alert('Success', 'Legacy tasks migrated successfully!');
              await loadTasks();
            } catch (error: any) {
              Alert.alert('Migration Error', error.message || 'Failed to migrate tasks');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadTasks();
  }, [user]);

  const handleAddTask = async (title: string) => {
    if (!user) return;
    
    await createWeeklyTask(user.uid, title);
    await loadTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    
    try {
      await deleteWeeklyTask(user.uid, taskId);
      await loadTasks();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete task');
    }
  };

  const handleToggleTask = async (taskId: string, day: keyof TaskMatrix, completed: boolean) => {
    if (!user) return;
    
    try {
      await updateWeeklyTaskMatrix(user.uid, taskId, day, completed);
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

  const handleTaskStateChange = async (taskId: string, state: TaskState) => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      await updateTaskProgress(user.uid, taskId, today, state);
      await loadTasks(); // Refresh to show updated state
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update task state');
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
          <ThemedText type="title">TimeMatrix</ThemedText>
          <ThemedText type="caption" style={{ color: mutedColor }}>
            Period {getCurrentWeekId()} • {user?.email}
          </ThemedText>
        </View>
        <View style={styles.headerButtons}>
          {migrationNeeded && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: tintColor }]}
              onPress={handleMigration}
            >
              <ThemedText style={{ color: 'white', fontSize: 12 }}>Migrate</ThemedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: tintColor }]}
            onPress={() => setShowJSONImport(true)}
          >
            <ThemedText style={{ color: tintColor, fontSize: 12 }}>Import</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: tintColor }]}
            onPress={handleLogout}
          >
            <ThemedText style={{ color: tintColor }}>Sign Out</ThemedText>
          </TouchableOpacity>
        </View>
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

        {/* Enhanced Task Matrix */}
        <EnhancedTaskMatrix 
          tasks={tasks} 
          userId={user?.uid || ''}
          onToggleTask={handleToggleTask}
          onTaskStateChange={handleTaskStateChange}
        />

        {/* Task List */}
        <TaskList tasks={tasks} onDeleteTask={handleDeleteTask} />

        {/* Bottom Spacing */}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* JSON Import Modal */}
      <Modal
        visible={showJSONImport}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowJSONImport(false)}
      >
        <JSONImport
          userId={user?.uid || ''}
          onImportComplete={loadTasks}
          onClose={() => setShowJSONImport(false)}
        />
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
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