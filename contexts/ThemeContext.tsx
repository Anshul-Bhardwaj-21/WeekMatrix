import { readJSON, writeJSON } from "@/services/localStorage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

export type ThemePreference = "system" | "light" | "dark";

type ThemeContextValue = {
  loading: boolean;
  preference: ThemePreference;
  colorScheme: "light" | "dark";
  setPreference: (preference: ThemePreference) => void;
  toggleDarkMode: () => void;
};

const STORAGE_KEY = "timematrix.theme.v1";

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemePreferenceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [loading, setLoading] = useState(true);
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const stored = await readJSON<ThemePreference>(STORAGE_KEY);
      if (cancelled) return;
      if (stored === "system" || stored === "light" || stored === "dark") {
        setPreferenceState(stored);
      }
      setLoading(false);
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const colorScheme: "light" | "dark" =
      preference === "system" ? systemScheme : preference;

    const setPreference = (next: ThemePreference) => {
      setPreferenceState(next);
      writeJSON(STORAGE_KEY, next);
    };

    const toggleDarkMode = () => {
      setPreference(preference === "dark" ? "light" : "dark");
    };

    return {
      loading,
      preference,
      colorScheme,
      setPreference,
      toggleDarkMode,
    };
  }, [loading, preference, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
