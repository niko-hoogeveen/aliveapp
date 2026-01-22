/**
 * Typography scale for the I'm Okay app.
 * Follows the design system defined in docs/design-system.md
 * 
 * Font families:
 * - iOS: SF Pro Display / SF Pro Text (system default)
 * - Android: Roboto (system default)
 */

import { StyleSheet, TextStyle } from 'react-native';

export const Typography = StyleSheet.create({
  /**
   * Display - 48pt Bold
   * Usage: "I'm Okay" button text
   */
  display: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  } as TextStyle,

  invitecode: {
    fontSize: 43,
    fontWeight: '700',
    lineHeight: 56,
  } as TextStyle,

  /**
   * H1 - 32pt Bold
   * Usage: Screen titles
   */
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  } as TextStyle,

  /**
   * H2 - 24pt SemiBold
   * Usage: Section headers
   */
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  } as TextStyle,

  /**
   * H3 - 20pt SemiBold
   * Usage: Card titles
   */
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  } as TextStyle,

  /**
   * Body - 16pt Regular
   * Usage: Main content
   */
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,

  /**
   * Body Small - 14pt Regular
   * Usage: Secondary content
   */
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,

  /**
   * Caption - 12pt Regular
   * Usage: Timestamps, metadata
   */
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TextStyle,

  /**
   * Button - 16pt SemiBold
   * Usage: Button labels
   */
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  } as TextStyle,
});

export type TypographyStyle = keyof typeof Typography;
