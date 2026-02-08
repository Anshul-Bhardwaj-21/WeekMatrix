import { BorderRadius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Task } from '@/types';
import { calculateWeeklyProgress, getProgressData } from '@/utils/progressUtils';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { ThemedText } from '../themed-text';

interface ProgressChartProps {
  tasks: Task[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ tasks }) => {
  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const borderColor = useThemeColor({}, 'border');

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - (Spacing.md * 4);

  const progressData = getProgressData(tasks);
  const weeklyProgress = calculateWeeklyProgress(tasks);

  if (tasks.length === 0) {
    return null;
  }

  const chartData = {
    labels: progressData.map(d => d.day),
    datasets: [
      {
        data: progressData.map(d => d.percentage),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: surfaceColor,
    backgroundGradientFrom: surfaceColor,
    backgroundGradientTo: surfaceColor,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => textColor,
    style: {
      borderRadius: BorderRadius.md,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: tintColor,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: borderColor,
      strokeWidth: 1,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: surfaceColor }]}>
      <View style={styles.header}>
        <ThemedText type="subtitle">Weekly Progress</ThemedText>
        <View style={styles.overallProgress}>
          <ThemedText type="title" style={{ color: tintColor }}>
            {weeklyProgress}%
          </ThemedText>
          <ThemedText type="caption" style={{ color: mutedColor }}>
            Overall
          </ThemedText>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <BarChart
          data={chartData}
          width={chartWidth}
          height={200}
          yAxisLabel=""
          yAxisSuffix="%"
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          showValuesOnTopOfBars
          fromZero
          segments={4}
          style={styles.chart}
        />
      </View>

      <View style={styles.legend}>
        <ThemedText type="caption" style={{ color: mutedColor, textAlign: 'center' }}>
          Daily completion percentage across all tasks
        </ThemedText>
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
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  overallProgress: {
    alignItems: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  chart: {
    borderRadius: BorderRadius.md,
  },
  legend: {
    marginTop: Spacing.sm,
  },
});
