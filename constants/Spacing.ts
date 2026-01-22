/**
 * Spacing scale for the I'm Okay app.
 * Uses an 8pt grid system for consistency.
 * Follows the design system defined in docs/design-system.md
 */

export const Spacing = {
  /**
   * 4pt - Tight spacing
   * Usage: Icon padding, compact layouts
   */
  xs: 4,

  /**
   * 8pt - Small spacing
   * Usage: Related elements
   */
  sm: 8,

  /**
   * 16pt - Medium spacing
   * Usage: Standard gaps between elements
   */
  md: 16,

  /**
   * 24pt - Large spacing
   * Usage: Section spacing
   */
  lg: 24,

  /**
   * 32pt - Extra large spacing
   * Usage: Major sections
   */
  xl: 32,

  /**
   * 48pt - 2x Extra large spacing
   * Usage: Screen padding (dependent app)
   */
  '2xl': 48,

  /**
   * 64pt - 3x Extra large spacing
   * Usage: Large visual spacing
   */
  '3xl': 64,
} as const;

export type SpacingKey = keyof typeof Spacing;
