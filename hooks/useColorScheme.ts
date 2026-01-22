/**
 * useColorScheme Hook
 * 
 * Returns the current color scheme and corresponding color palette.
 * Respects system preferences for light/dark mode.
 */

import { useColorScheme as useRNColorScheme } from 'react-native';
import { Colors, ColorScheme } from '@/constants/Colors';

interface UseColorSchemeResult {
  /** Current color scheme: 'light' or 'dark' */
  colorScheme: ColorScheme;
  /** Color palette for the current scheme */
  colors: typeof Colors.light | typeof Colors.dark;
  /** Whether dark mode is active */
  isDark: boolean;
}

/**
 * Hook to get the current color scheme and colors
 * 
 * Usage:
 * ```ts
 * const { colors, isDark } = useColorScheme();
 * 
 * <View style={{ backgroundColor: colors.background }}>
 *   <Text style={{ color: colors.text }}>Hello</Text>
 * </View>
 * ```
 */
export function useColorScheme(): UseColorSchemeResult {
  const systemColorScheme = useRNColorScheme();
  const colorScheme: ColorScheme = systemColorScheme === 'dark' ? 'dark' : 'light';
  
  return {
    colorScheme,
    colors: Colors[colorScheme],
    isDark: colorScheme === 'dark',
  };
}
