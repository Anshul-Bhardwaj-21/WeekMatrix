import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { logOut } from '@/services/auth';
import React from 'react';
import { Alert, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ExploreScreen() {
  const { user } = useAuth();
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
    Linking.openURL('https://github.com/your-username/weekmatrix');
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Please sign in to access settings.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Settings</ThemedText>
      </View>

      <View style={styles.content}>
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
          <ThemedText type="subtitle">About</ThemedText>
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
            WeekMatrix helps you track your weekly progress across tasks.
            {'\n'}Built with React Native, Expo, and Firebase.
          </ThemedText>
        </View>
      </View>
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