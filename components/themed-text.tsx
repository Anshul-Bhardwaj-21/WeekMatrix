import { Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { StyleSheet, Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'caption' ? styles.caption : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.normal,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    lineHeight: 24,
  },
  title: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    lineHeight: 28,
  },
  link: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    lineHeight: 24,
  },
  caption: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.normal,
    lineHeight: 20,
  },
});