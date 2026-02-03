import { BorderRadius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    calculateDailyStreak,
    calculateMonthlyProgress,
    calculateWeeklyConsistency,
    calculateYearlyOverview
} from '@/services/analytics';
import { DailyStreak, MonthlyProgress, WeeklyConsistency, YearlyOverview } from '@/types/index';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { ThemedText } from '../themed-text';

interface AnalyticsDashboardProps {
  userId: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId }) => {
  const [dailyStreak, setDailyStreak] = useState<DailyStreak | null>(null);
  const [weeklyConsistency, setWeeklyConsistency] = useState<WeeklyConsistency | null>(null);
  const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgress[]>([]);
  const [yearlyOverview, setYearlyOverview] = useState<YearlyOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const successColor = useThemeColor({}, 'success');

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - (Spacing.md * 4);

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const currentYear = new Date().getFullYear();
      
      const [streak, consistency, monthly, yearly] = await Promise.all([
        calculateDailyStreak(userId),
        calculateWeeklyConsistency(userId),
        calculateMonthlyProgress(userId, currentYear),
        calculateYearlyOverview(userId, currentYear),
      ]);

      setDailyStreak(streak);
      setWeeklyConsistency(consistency);
      setMonthlyProgress(monthly);
      setYearlyOverview(yearly);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
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
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: surfaceColor }]}>
        <ThemedText>Loading analytics...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Daily Streak */}
      {dailyStreak && (
        <View style={[styles.card, { backgroundColor: surfaceColor }]}>
          <ThemedText type="subtitle">Daily Streak</ThemedText>
          <View style={styles.streakContainer}>
            <View style={styles.streakItem}>
              <ThemedText type="title" style={{ color: successColor }}>
                {dailyStreak.current}
              </ThemedText>
              <ThemedText type="caption" style={{ color: mutedColor }}>
                Current
              </ThemedText>
            </View>
            <View style={styles.streakItem}>
              <ThemedText type="title" style={{ color: tintColor }}>
                {dailyStreak.longest}
              </ThemedText>
              <ThemedText type="caption" style={{ color: mutedColor }}>
                Best
              </ThemedText>
            </View>
          </View>
          {dailyStreak.lastCompletedDate && (
            <ThemedText type="caption" style={{ color: mutedColor, textAlign: 'center' }}>
              Last completed: {dailyStreak.lastCompletedDate}
            </ThemedText>
          )}
        </View>
      )}

      {/* Weekly Consistency */}
      {weeklyConsistency && weeklyConsistency.weeklyAverages.length > 0 && (
        <View style={[styles.card, { backgroundColor: surfaceColor }]}>
          <ThemedText type="subtitle">Weekly Consistency</ThemedText>
          <ThemedText type="title" style={{ color: tintColor, textAlign: 'center', marginVertical: Spacing.md }}>
            {weeklyConsistency.completionRate.toFixed(1)}%
          </ThemedText>
          <LineChart
            data={{
              labels: weeklyConsistency.weeklyAverages.map((_, i) => `W${i + 1}`),
              datasets: [{ data: weeklyConsistency.weeklyAverages }],
            }}
            width={chartWidth}
            height={200}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* Monthly Progress */}
      {monthlyProgress.length > 0 && (
        <View style={[styles.card, { backgroundColor: surfaceColor }]}>
          <ThemedText type="subtitle">Monthly Progress</ThemedText>
          <BarChart
            data={{
              labels: monthlyProgress.slice(-6).map(m => m.month.split('-')[1]),
              datasets: [{ data: monthlyProgress.slice(-6).map(m => m.completionRate) }],
            }}
            width={chartWidth}
            height={200}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>
      )}

      {/* Yearly Overview */}
      {yearlyOverview && (
        <View style={[styles.card, { backgroundColor: surfaceColor }]}>
          <ThemedText type="subtitle">Yearly Overview ({yearlyOverview.year})</ThemedText>
          <View style={styles.yearlyStats}>
            <View style={styles.statItem}>
              <ThemedText type="title" style={{ color: tintColor }}>
                {yearlyOverview.completedTasks}
              </ThemedText>
              <ThemedText type="caption" style={{ color: mutedColor }}>
                Completed
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title" style={{ color: mutedColor }}>
                {yearlyOverview.totalTasks}
              </ThemedText>
              <ThemedText type="caption" style={{ color: mutedColor }}>
                Total Tasks
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText type="title" style={{ color: successColor }}>
                {yearlyOverview.totalTasks > 0 
                  ? ((yearlyOverview.completedTasks / yearlyOverview.totalTasks) * 100).toFixed(1)
                  : 0}%
              </ThemedText>
              <ThemedText type="caption" style={{ color: mutedColor }}>
                Success Rate
              </ThemedText>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: Spacing.md,
    padding: Spacing.lg,
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
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: Spacing.lg,
  },
  streakItem: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.md,
  },
  yearlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
});