import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BorderRadius, Spacing } from "@/constants/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColor } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, Switch, View } from "react-native";

export default function SettingsScreen() {
  const { colorScheme, preference, setPreference } = useTheme();

  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "border");
  const tintColor = useThemeColor({}, "tint");
  const mutedColor = useThemeColor({}, "muted");

  const darkModeEnabled = colorScheme === "dark";

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Settings</ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <ThemedText type="defaultSemiBold">Dark Mode</ThemedText>
            <ThemedText type="caption" style={{ color: mutedColor }}>
              {preference === "system"
                ? "Following system theme (toggle to override)"
                : "Theme override is enabled"}
            </ThemedText>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={(next) => setPreference(next ? "dark" : "light")}
            trackColor={{ false: borderColor, true: tintColor }}
            thumbColor={"white"}
          />
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
  card: {
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  rowText: {
    flex: 1,
    gap: Spacing.xs,
  },
});

