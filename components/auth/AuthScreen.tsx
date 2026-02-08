import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { signIn, signUp } from '@/services/auth';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ThemedText } from '../themed-text';

export const AuthScreen: React.FC = () => {
  const { continueAsGuest } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingAction, setLoadingAction] = useState<"auth" | "guest" | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoadingAction("auth");
    try {
      if (isLogin) {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleContinueAsGuest = async () => {
    setLoadingAction("guest");
    try {
      await continueAsGuest();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to continue as guest');
    } finally {
      setLoadingAction(null);
    }
  };

  const loading = loadingAction !== null;
  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title">TimeMatrix</ThemedText>
            <ThemedText type="caption" style={styles.subtitle}>
              Track your progress across time
            </ThemedText>
          </View>

          <View style={[styles.form, { backgroundColor: surfaceColor }]}>
            <TextInput
              style={[
                styles.input,
                { borderColor, color: textColor, backgroundColor: surfaceColor }
              ]}
              placeholder="Email"
              placeholderTextColor={mutedColor}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={[
                styles.input,
                { borderColor, color: textColor, backgroundColor: surfaceColor }
              ]}
              placeholder="Password"
              placeholderTextColor={mutedColor}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: tintColor, opacity: loading || !canSubmit ? 0.6 : 1 }]}
              onPress={handleAuth}
              disabled={loading || !canSubmit}
            >
              <ThemedText
                style={[styles.buttonText, { color: 'white' }]}
                type="defaultSemiBold"
              >
                {loadingAction === "auth"
                  ? 'Loading...'
                  : isLogin
                    ? 'Sign In'
                    : 'Sign Up'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <ThemedText type="link" style={{ color: tintColor }}>
                {isLogin
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </ThemedText>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: borderColor, opacity: 0.5 }]} />

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: tintColor }]}
              onPress={handleContinueAsGuest}
              disabled={loading}
            >
              <ThemedText type="defaultSemiBold" style={{ color: tintColor }}>
                {loadingAction === "guest" ? "Loading..." : "Continue as Guest"}
              </ThemedText>
              <ThemedText type="caption" style={{ color: mutedColor, textAlign: "center" }}>
                Tasks stay on this device (no cloud sync).
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  content: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  subtitle: {
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  form: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    fontSize: Typography.sizes.md,
  },
  button: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  buttonText: {
    fontSize: Typography.sizes.md,
  },
  switchButton: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  secondaryButton: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
