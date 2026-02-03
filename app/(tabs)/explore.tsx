import { TimeMatrixAnalytics } from '@/components/dashboard/TimeMatrixAnalytics';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { logOut } from '@/services/auth';
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ExploreScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'analytics' | 'settings'>('analytics');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'error');
  const mutedColor = useThemeColor({}, 'muted');

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

  const openGitHub = () => {
    Linking.openURL('https://github.com/Anshul-Bhardwaj-21/TimeMatrix');
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Please sign in to access analytics and settings.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Analytics & Settings</ThemedText>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              { 
                backgroundColor: activeTab === 'analytics' ? tintColor : 'transparent',
                borderColor: tintColor 
              }
            ]}
            onPress={() => setActiveTab('analytics')}
          >
            <ThemedText style={{ 
              color: activeTab === 'analytics' ? 'white' : tintColor 
            }}>
              📊 Analytics
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              { 
                backgroundColor: activeTab === 'settings' ? tintColor : 'transparent',
                borderColor: tintColor 
              }
            ]}
            onPress={() => setActiveTab('settings')}
          >
            <ThemedText style={{ 
              color: activeTab === 'settings' ? 'white' : tintColor 
            }}>
              ⚙️ Settings
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'analytics' ? (
        <TimeMatrixAnalytics userId={user.uid} />
      ) : (
        <ScrollView style={styles.content}>
          {/* User Info */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <ThemedText type="subtitle">Account</ThemedText>
            <View style={styles.infoRow}>
              <ThemedText type="caption" style={{ color: mutedColor }}>
                Email
              </ThemedText>
              <ThemedText>{user.email}</ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText type="caption" style={{ color: mutedColor }}>
                User ID
              </ThemedText>
              <ThemedText type="caption" numberOfLines={1}>
                {user.uid}
              </ThemedText>
            </View>
          </View>

          {/* App Info */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <ThemedText type="subtitle">About TimeMatrix</ThemedText>
            <View style={styles.infoRow}>
              <ThemedText type="caption" style={{ color: mutedColor }}>
                Version
              </ThemedText>
              <ThemedText>1.0.0</ThemedText>
            </View>
            <TouchableOpacity style={styles.linkButton} onPress={openGitHub}>
              <ThemedText style={{ color: tintColor }}>View on GitHub</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Actions */}
          <View style={[styles.section, { backgroundColor: surfaceColor }]}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: errorColor }]}
              onPress={handleLogout}
            >
              <ThemedText style={[styles.actionButtonText, { color: 'white' }]}>
                Sign Out
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText type="caption" style={{ color: mutedColor, textAlign: 'center' }}>
              TimeMatrix helps you track your progress across different time periods.
              {'\n'}Built with React Native, Expo, and Firebase.
            </ThemedText>
          </View>
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  section: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  linkButton: {
    marginTop: Spacing.md,
    alignSelf: 'flex-start',
  },
  actionButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  actionButtonText: {
    fontWeight: '600',
  },
  footer: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
  },
});