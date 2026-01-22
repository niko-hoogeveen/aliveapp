/**
 * Shadow Definitions for I'm Okay App
 * 
 * Based on the design system: docs/design-system.md
 * Platform-specific shadows (iOS shadowX, Android elevation)
 */

import { Platform, ViewStyle } from 'react-native';

type ShadowStyle = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

export const Shadows: Record<'sm' | 'md' | 'lg', ShadowStyle> = {
  /**
   * Small shadow
   * Usage: Subtle elevation for chips, tags
   */
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }) as ShadowStyle,

  /**
   * Medium shadow
   * Usage: Cards, modals
   */
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }) as ShadowStyle,

  /**
   * Large shadow
   * Usage: Floating action buttons, prominent elements
   */
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }) as ShadowStyle,
};

export type ShadowSize = keyof typeof Shadows;
