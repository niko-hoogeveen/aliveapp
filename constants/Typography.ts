/**
 * Typography Scale for I'm Okay App
 * 
 * Based on the design system: docs/design-system.md
 * Uses system fonts: SF Pro (iOS) and Roboto (Android)
 */

import { StyleSheet } from 'react-native';

export const Typography = StyleSheet.create({
  /**
   * Display - 48pt Bold
   * Usage: "I'm Okay" button text
   */
  display: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  },
  
  /**
   * H1 - 32pt Bold
   * Usage: Screen titles
   */
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  
  /**
   * H2 - 24pt SemiBold
   * Usage: Section headers
   */
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  
  /**
   * H3 - 20pt SemiBold
   * Usage: Card titles
   */
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  
  /**
   * Body - 16pt Regular
   * Usage: Main content
   */
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  
  /**
   * Body Small - 14pt Regular
   * Usage: Secondary content
   */
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  
  /**
   * Caption - 12pt Regular
   * Usage: Timestamps, metadata
   */
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  
  /**
   * Button - 16pt SemiBold
   * Usage: Button labels
   */
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
});

export type TypographyStyle = keyof typeof Typography;
