import { AuthScreen } from '@/components/auth/AuthScreen';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return user ? <Dashboard /> : <AuthScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});