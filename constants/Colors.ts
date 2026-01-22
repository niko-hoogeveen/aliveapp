/**
 * Color Palette for I'm Okay App
 * 
 * Based on the design system: docs/design-system.md
 * Includes both light and dark mode variants.
 */

export const Colors = {
  light: {
    // Primary colors - "I'm Okay" button, success states
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    primaryLight: '#C8E6C9',
    
    // Danger colors - Alerts, missed check-ins
    danger: '#E57373',
    dangerDark: '#D32F2F',
    
    // Warning colors - Reminders, pending states
    warning: '#FFB74D',
    
    // Accent colors - Links, interactive elements
    accent: '#7FBFF2',
    
    // Neutral colors
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    textDisabled: '#BDBDBD',
    border: '#E0E0E0',
  },
  dark: {
    // Primary colors
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    primaryLight: '#1B5E20',
    
    // Danger colors
    danger: '#EF5350',
    dangerDark: '#C62828',
    
    // Warning colors
    warning: '#FFA726',
    
    // Accent colors
    accent: '#64B5F6',
    
    // Neutral colors
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textDisabled: '#666666',
    border: '#404040',
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type ColorName = keyof typeof Colors.light;
