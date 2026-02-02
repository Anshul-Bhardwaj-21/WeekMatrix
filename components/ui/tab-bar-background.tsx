import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export default function TabBarBackground() {
  const backgroundColor = useThemeColor({}, 'background');
  
  return (
    <BlurView
      tint="default"
      intensity={100}
      style={[StyleSheet.absoluteFillObject, { backgroundColor: backgroundColor + '80' }]}
    />
  );
}