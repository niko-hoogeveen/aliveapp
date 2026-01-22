/**
 * Color palette for the I'm Okay app.
 * Follows the design system defined in docs/design-system.md
 */

export const Colors = {
  light: {
    // Primary - "I'm Okay" button, success states
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    primaryLight: '#C8E6C9',
    
    // Danger - Alerts, missed check-ins
    danger: '#E57373',
    dangerDark: '#D32F2F',
    
    // Warning - Reminders, pending states
    warning: '#FFB74D',
    
    // Accent - Links, interactive elements
    accent: '#7FBFF2',
    
    // Neutrals
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    textDisabled: '#BDBDBD',
    border: '#E0E0E0',
  },
  dark: {
    // Primary - Same green in dark mode
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    primaryLight: '#1B5E20',
    
    // Danger - Slightly brighter in dark mode
    danger: '#EF5350',
    dangerDark: '#C62828',
    
    // Warning
    warning: '#FFA726',
    
    // Accent
    accent: '#64B5F6',
    
    // Neutrals - Dark mode variants
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textDisabled: '#666666',
    border: '#404040',
  },
};

export type ColorScheme = keyof typeof Colors;
export type ColorName = keyof typeof Colors.light;
