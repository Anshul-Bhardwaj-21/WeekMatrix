import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedText } from '../themed-text';

interface AddTaskFormProps {
  onAddTask: (title: string) => Promise<void>;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setLoading(true);
    try {
      await onAddTask(title.trim());
      setTitle('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor }]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            { borderColor, color: textColor, backgroundColor: surfaceColor }
          ]}
          placeholder="Enter task title..."
          placeholderTextColor={mutedColor}
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
          maxLength={50}
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            { 
              backgroundColor: tintColor,
              opacity: loading || !title.trim() ? 0.5 : 1 
            }
          ]}
          onPress={handleSubmit}
          disabled={loading || !title.trim()}
        >
          <ThemedText style={[styles.addButtonText, { color: 'white' }]}>
            {loading ? '...' : '+'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.md,
    marginRight: Spacing.sm,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
});