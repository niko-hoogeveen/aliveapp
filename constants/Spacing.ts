/**
 * Spacing Scale for I'm Okay App
 * 
 * Based on the design system: docs/design-system.md
 * Uses an 8pt grid system for consistency.
 */

export const Spacing = {
  /** 4pt - Tight spacing, icon padding */
  xs: 4,
  
  /** 8pt - Related elements */
  sm: 8,
  
  /** 16pt - Standard gaps */
  md: 16,
  
  /** 24pt - Section spacing */
  lg: 24,
  
  /** 32pt - Major sections */
  xl: 32,
  
  /** 48pt - Screen padding (dependent) */
  '2xl': 48,
  
  /** 64pt - Large visual spacing */
  '3xl': 64,
} as const;

export type SpacingSize = keyof typeof Spacing;
