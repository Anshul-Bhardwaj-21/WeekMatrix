import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { TasksProvider } from '@/contexts/TasksContext';
import { ThemePreferenceProvider, useTheme } from '@/contexts/ThemeContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Safe to ignore if called multiple times during Fast Refresh.
});

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontError) {
      console.warn("Failed to load fonts", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (loaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore: the splash may already be hidden depending on platform/state.
      });
    }
  }, [loaded, fontError]);

  if (!loaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <ThemePreferenceProvider>
        <RootLayoutInner />
      </ThemePreferenceProvider>
    </ErrorBoundary>
  );
}

function RootLayoutInner() {
  const { colorScheme } = useTheme();

  return (
    <AuthProvider>
      <TasksProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </TasksProvider>
    </AuthProvider>
  );
}
