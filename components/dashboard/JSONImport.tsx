import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { importTasksFromJSON, validateTaskImportSchema } from '@/services/timeMatrix';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedText } from '../themed-text';

interface JSONImportProps {
  userId: string;
  onImportComplete: () => void;
  onClose: () => void;
}

export const JSONImport: React.FC<JSONImportProps> = ({ userId, onImportComplete, onClose }) => {
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);

  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const errorColor = useThemeColor({}, 'error');

  const exampleJSON = {
    tasks: [
      {
        title: "Morning Exercise",
        description: "30 minutes of cardio",
        period: "daily",
        startTime: "07:00",
        endTime: "07:30",
        reminderEnabled: true
      },
      {
        title: "Weekly Review",
        description: "Review goals and progress",
        period: "weekly",
        startTime: "09:00",
        endTime: "10:00",
        reminderEnabled: false
      }
    ]
  };

  const handleImport = async () => {
    if (!jsonText.trim()) {
      Alert.alert('Error', 'Please enter JSON data');
      return;
    }

    setLoading(true);
    try {
      const parsedData = JSON.parse(jsonText);
      const validatedData = validateTaskImportSchema(parsedData);
      
      await importTasksFromJSON(userId, validatedData);
      
      Alert.alert('Success', `Imported ${validatedData.tasks.length} tasks successfully`);
      onImportComplete();
      onClose();
    } catch (error: any) {
      Alert.alert('Import Error', error.message || 'Failed to import tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setJsonText(JSON.stringify(exampleJSON, null, 2));
  };

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor }]}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Import Tasks from JSON</ThemedText>
        <TouchableOpacity onPress={onClose}>
          <ThemedText style={{ color: tintColor, fontSize: 18 }}>✕</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <ThemedText type="caption" style={{ color: mutedColor, marginBottom: Spacing.md }}>
          Paste your JSON data below or use the example format:
        </ThemedText>

        <TouchableOpacity
          style={[styles.exampleButton, { borderColor, backgroundColor: surfaceColor }]}
          onPress={loadExample}
        >
          <ThemedText style={{ color: tintColor }}>Load Example JSON</ThemedText>
        </TouchableOpacity>

        <TextInput
          style={[
            styles.textInput,
            { 
              borderColor, 
              color: textColor, 
              backgroundColor: surfaceColor,
              textAlignVertical: 'top'
            }
          ]}
          placeholder="Paste JSON here..."
          placeholderTextColor={mutedColor}
          value={jsonText}
          onChangeText={setJsonText}
          multiline
          numberOfLines={15}
        />

        <View style={styles.schema}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: Spacing.sm }}>
            Required Schema:
          </ThemedText>
          <ThemedText type="caption" style={{ color: mutedColor }}>
            • tasks: Array of task objects{'\n'}
            • title: string (required){'\n'}
            • description: string (optional){'\n'}
            • period: "daily" | "weekly" | "monthly" | "yearly"{'\n'}
            • startTime: "HH:MM" format (optional){'\n'}
            • endTime: "HH:MM" format (optional){'\n'}
            • reminderEnabled: boolean (optional)
          </ThemedText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor }]}
          onPress={onClose}
        >
          <ThemedText style={{ color: mutedColor }}>Cancel</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.importButton,
            { 
              backgroundColor: tintColor,
              opacity: loading || !jsonText.trim() ? 0.5 : 1 
            }
          ]}
          onPress={handleImport}
          disabled={loading || !jsonText.trim()}
        >
          <ThemedText style={[styles.importButtonText, { color: 'white' }]}>
            {loading ? 'Importing...' : 'Import Tasks'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    margin: Spacing.md,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  exampleButton: {
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.sizes.sm,
    fontFamily: 'monospace',
    minHeight: 200,
    marginBottom: Spacing.md,
  },
  schema: {
    padding: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  importButton: {
    flex: 2,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  importButtonText: {
    fontWeight: Typography.weights.semibold,
  },
});