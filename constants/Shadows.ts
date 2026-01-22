/**
 * Shadow tokens for the I'm Okay app.
 * Platform-specific implementation for iOS (shadow) and Android (elevation).
 * Follows the design system defined in docs/design-system.md
 */

import { Platform, ViewStyle } from 'react-native';

type ShadowStyle = ViewStyle;

/**
 * Small shadow - subtle depth
 * Usage: Subtle elevation, hover states
 */
export const shadowSm: ShadowStyle = Platform.select({
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
}) as ShadowStyle;

/**
 * Medium shadow - standard depth
 * Usage: Cards, floating elements
 */
export const shadowMd: ShadowStyle = Platform.select({
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
}) as ShadowStyle;

/**
 * Large shadow - prominent depth
 * Usage: Modals, important elements, "I'm Okay" button
 */
export const shadowLg: ShadowStyle = Platform.select({
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
}) as ShadowStyle;

export const Shadows = {
  sm: shadowSm,
  md: shadowMd,
  lg: shadowLg,
} as const;

export type ShadowKey = keyof typeof Shadows;
