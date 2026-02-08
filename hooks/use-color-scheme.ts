import { useTheme } from "@/contexts/ThemeContext";

export const useColorScheme = () => {
  const { colorScheme } = useTheme();
  return colorScheme;
};
