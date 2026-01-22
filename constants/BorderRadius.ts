/**
 * Border radius tokens for the I'm Okay app.
 * Follows the design system defined in docs/design-system.md
 */

export const BorderRadius = {
  /**
   * 4pt - Small radius
   * Usage: Small chips, tags
   */
  sm: 4,

  /**
   * 8pt - Medium radius
   * Usage: Buttons, inputs
   */
  md: 8,

  /**
   * 16pt - Large radius
   * Usage: Cards
   */
  lg: 16,

  /**
   * 24pt - Extra large radius
   * Usage: Modals, large containers
   */
  xl: 24,

  /**
   * 9999pt - Full radius
   * Usage: Circular buttons, avatars
   */
  full: 9999,
} as const;

export type BorderRadiusKey = keyof typeof BorderRadius;
