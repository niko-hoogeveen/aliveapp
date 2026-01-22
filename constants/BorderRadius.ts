/**
 * Border Radius Scale for I'm Okay App
 * 
 * Based on the design system: docs/design-system.md
 */

export const BorderRadius = {
  /** 4pt - Small chips, tags */
  sm: 4,
  
  /** 8pt - Buttons, inputs */
  md: 8,
  
  /** 16pt - Cards */
  lg: 16,
  
  /** 24pt - Modals */
  xl: 24,
  
  /** 9999pt - Circular buttons, avatars */
  full: 9999,
} as const;

export type BorderRadiusSize = keyof typeof BorderRadius;
