import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
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
    TouchableOpacity,
    View,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { ThemedText } from '../themed-text';

interface TimeMatrixAnalyticsProps {
  userId: string;
}

export const TimeMatrixAnalytics: React.FC<TimeMatrixAnalyticsProps> = ({ userId }) => {
  const [dailyStreak, setDailyStreak] = useState<DailyStreak | null>(null);
  const [weeklyConsistency, setWeeklyConsistency] = useState<WeeklyConsistency | null>(null);
  const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgress[]>([]);
  const [yearlyOverview, setYearlyOverview] = useState<YearlyOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'streak' | 'weekly' | 'monthly' | 'yearly'>('streak');

  const surfaceColor = useThemeColor({}, 'surface');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');

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
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: useThemeColor({}, 'border'),
      strokeWidth: 1,
    },
  };

  const renderTabButton = (
    view: typeof selectedView,
    title: string,
    icon: string
  ) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        {
          backgroundColor: selectedView === view ? tintColor : 'transparent',
          borderColor: tintColor,
        },
      ]}
      onPress={() => setSelectedView(view)}
    >
      <ThemedText style={[
        styles.tabButtonText,
        { color: selectedView === view ? 'white' : tintColor }
      ]}>
        {icon} {title}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderStreakView = () => (
    <View style={[styles.card, { backgroundColor: surfaceColor }]}>
      <ThemedText type="subtitle" style={styles.cardTitle}>Daily Streak</ThemedText>
      {dailyStreak ? (
        <>
          <View style={styles.streakContainer}>
            <View style={styles.streakItem}>
              <ThemedText type="title" style={{ color: successColor, fontSize: 48 }}>
                {dailyStreak.current}
              </ThemedText>
              <ThemedText type="caption" style={{ color: mutedColor }}>
                Current Streak
              </ThemedText>
            </View>
            <View style={styles.streakItem}>
              <ThemedText type="title" style={{ color: tintColor, fontSize: 32 }}>
                {dailyStreak.longest}
              </ThemedText>
              <ThemedText type="caption" style={{ color: mutedColor }}>
                Best Streak
              </ThemedText>
            </View>
          </View>
          {dailyStreak.lastCompletedDate && (
            <ThemedText type="caption" style={{ color: mutedColor, textAlign: 'center', marginTop: Spacing.md }}>
              Last completed: {new Date(dailyStreak.lastCompletedDate).toLocaleDateString()}
            </ThemedText>
          )}
          
          {/* Streak visualization */}
          <View style={styles.streakVisualization}>
            <ThemedText type="defaultSemiBold" style={{ marginBottom: Spacing.sm }}>
              Streak Progress
            </ThemedText>
            <View style={styles.streakBar}>
              <View 
                style={[
                  styles.streakFill,
                  { 
                    backgroundColor: successColor,
                    width: `${Math.min((dailyStreak.current / Math.max(dailyStreak.longest, 1)) * 100, 100)}%`
                  }
                ]}
              />
            </View>
            <ThemedText type="caption" style={{ color: mutedColor, textAlign: 'center', marginTop: Spacing.xs }}>
              {dailyStreak.current} / {dailyStreak.longest} days
            </ThemedText>
          </View>
        </>
      ) : (
        <ThemedText style={{ color: mutedColor }}>No streak data available</ThemedText>
      )}
    </View>
  );

  const renderWeeklyView = () => (
    <View style={[styles.card, { backgroundColor: surfaceColor }]}>
      <ThemedText type="subtitle" style={styles.cardTitle}>Weekly Consistency</ThemedText>
      {weeklyConsistency && weeklyConsistency.weeklyAverages.length > 0 ? (
        <>
          <View style={styles.consistencyHeader}>
            <ThemedText type="title" style={{ color: tintColor, fontSize: 36 }}>
              {weeklyConsistency.completionRate.toFixed(1)}%
            </ThemedText>
            <ThemedText type="caption" style={{ color: mutedColor }}>
              Average Completion Rate
            </ThemedText>
          </View>
          <LineChart
            data={{
              labels: weeklyConsistency.weeklyAverages.slice(-8).map((_, i) => `W${i + 1}`),
              datasets: [{ data: weeklyConsistency.weeklyAverages.slice(-8) }],
            }}
            width={chartWidth}
            height={200}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </>
      ) : (
        <ThemedText style={{ color: mutedColor }}>No weekly data available</ThemedText>
      )}
    </View>
  );

  const renderMonthlyView = () => (
    <View style={[styles.card, { backgroundColor: surfaceColor }]}>
      <ThemedText type="subtitle" style={styles.cardTitle}>Monthly Summary</ThemedText>
      {monthlyProgress.length > 0 ? (
        <>
          <BarChart
            data={{
              labels: monthlyProgress.slice(-6).map(m => {
                const month = new Date(m.month + '-01').toLocaleDateString('en', { month: 'short' });
                return month;
              }),
              datasets: [{ data: monthlyProgress.slice(-6).map(m => m.completionRate) }],
            }}
            width={chartWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix="%"
            chartConfig={chartConfig}
            style={styles.chart}
          />
          
          {/* Monthly stats */}
          <View style={styles.monthlyStats}>
            {monthlyProgress.slice(-3).map((month, index) => (
              <View key={month.month} style={styles.monthStat}>
                <ThemedText type="defaultSemiBold">
                  {new Date(month.month + '-01').toLocaleDateString('en', { month: 'short' })}
                </ThemedText>
                <ThemedText style={{ color: tintColor }}>
                  {month.completionRate.toFixed(1)}%
                </ThemedText>
                <ThemedText type="caption" style={{ color: mutedColor }}>
                  {month.completedTasks}/{month.totalTasks} tasks
                </ThemedText>
              </View>
            ))}
          </View>
        </>
      ) : (
        <ThemedText style={{ color: mutedColor }}>No monthly data available</ThemedText>
      )}
    </View>
  );

  const renderYearlyView = () => (
    <View style={[styles.card, { backgroundColor: surfaceColor }]}>
      <ThemedText type="subtitle" style={styles.cardTitle}>
        Yearly Overview ({new Date().getFullYear()})
      </ThemedText>
      {yearlyOverview ? (
        <>
          <View style={styles.yearlyStats}>
            <View style={styles.yearStat}>
              <ThemedText type="title" style={{ color: tintColor, fontSize: 32 }}>
                {yearlyOverview.completedTasks}
              </ThemedText>
              <ThemedText type="caption" style={{ color: mutedColor }}>
                Completed Tasks
              </ThemedText>
            </View>
            <View style={styles.yearStat}>
              <ThemedText type="title" style={{ color: mutedColor, fontSize: 24 }}>
                {yearlyOverview.totalTasks}
              </ThemedText>
              <ThemedText type="caption" style={{ color: mutedColor }}>
                Total Tasks
              </ThemedText>
            </View>
            <View style={styles.yearStat}>
              <ThemedText type="title" style={{ color: successColor, fontSize: 28 }}>
                {yearlyOverview.totalTasks > 0 
                  ? ((yearlyOverview.completedTasks / yearlyOverview.totalTasks) * 100).toFixed(1)
                  : 0}%
              </ThemedText>
              <ThemedText type="caption" style={{ color: mutedColor }}>
                Success Rate
              </ThemedText>
            </View>
          </View>
          
          {/* Pie chart for completion breakdown */}
          {yearlyOverview.totalTasks > 0 && (
            <PieChart
              data={[
                {
                  name: 'Completed',
                  population: yearlyOverview.completedTasks,
                  color: successColor,
                  legendFontColor: textColor,
                  legendFontSize: 12,
                },
                {
                  name: 'Remaining',
                  population: yearlyOverview.totalTasks - yearlyOverview.completedTasks,
                  color: mutedColor,
                  legendFontColor: textColor,
                  legendFontSize: 12,
                },
              ]}
              width={chartWidth}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          )}
        </>
      ) : (
        <ThemedText style={{ color: mutedColor }}>No yearly data available</ThemedText>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: surfaceColor }]}>
        <ThemedText>Loading analytics...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {renderTabButton('streak', 'Streak', '🔥')}
        {renderTabButton('weekly', 'Weekly', '📊')}
        {renderTabButton('monthly', 'Monthly', '📈')}
        {renderTabButton('yearly', 'Yearly', '🎯')}
      </ScrollView>

      {/* Content */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {selectedView === 'streak' && renderStreakView()}
        {selectedView === 'weekly' && renderWeeklyView()}
        {selectedView === 'monthly' && renderMonthlyView()}
        {selectedView === 'yearly' && renderYearlyView()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  tabButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  tabButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
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
  cardTitle: {
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: Spacing.lg,
  },
  streakItem: {
    alignItems: 'center',
  },
  streakVisualization: {
    marginTop: Spacing.lg,
  },
  streakBar: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  streakFill: {
    height: '100%',
    borderRadius: 4,
  },
  consistencyHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  chart: {
    borderRadius: BorderRadius.md,
    marginVertical: Spacing.md,
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.lg,
  },
  monthStat: {
    alignItems: 'center',
  },
  yearlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  yearStat: {
    alignItems: 'center',
  },
});