# I'm Okay - Design System

This document defines the visual language and component patterns for the I'm Okay app. All UI implementations should follow these guidelines.

## Design Principles

1. **Radical Simplicity** - Every screen should be immediately understandable
2. **Calm Technology** - No anxiety-inducing patterns, gentle notifications
3. **Accessibility First** - Usable by elderly and visually impaired users
4. **Trust & Warmth** - Friendly, not clinical

---

## Color Palette

### Semantic Colors

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Primary** | `#4CAF50` | rgb(76, 175, 80) | "I'm Okay" button, success states |
| **Primary Dark** | `#388E3C` | rgb(56, 142, 60) | Pressed states, emphasis |
| **Primary Light** | `#C8E6C9` | rgb(200, 230, 201) | Backgrounds, highlights |
| **Danger** | `#E57373` | rgb(229, 115, 115) | Alerts, missed check-ins |
| **Danger Dark** | `#D32F2F` | rgb(211, 47, 47) | Critical alerts |
| **Warning** | `#FFB74D` | rgb(255, 183, 77) | Reminders, pending states |
| **Accent** | `#7FBFF2` | rgb(127, 191, 242) | Links, interactive elements |

### Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Background Light** | `#F5F5F5` | Main background (light mode) |
| **Background Dark** | `#1A1A1A` | Main background (dark mode) |
| **Surface Light** | `#FFFFFF` | Cards, modals (light mode) |
| **Surface Dark** | `#2D2D2D` | Cards, modals (dark mode) |
| **Text Primary** | `#212121` | Headlines, body text |
| **Text Secondary** | `#757575` | Captions, metadata |
| **Text Disabled** | `#BDBDBD` | Disabled states |
| **Border** | `#E0E0E0` | Dividers, input borders |

### Usage in Code

```typescript
// constants/Colors.ts
export const Colors = {
  light: {
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    primaryLight: '#C8E6C9',
    danger: '#E57373',
    dangerDark: '#D32F2F',
    warning: '#FFB74D',
    accent: '#7FBFF2',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    textDisabled: '#BDBDBD',
    border: '#E0E0E0',
  },
  dark: {
    primary: '#4CAF50',
    primaryDark: '#388E3C',
    primaryLight: '#1B5E20',
    danger: '#EF5350',
    dangerDark: '#C62828',
    warning: '#FFA726',
    accent: '#64B5F6',
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textDisabled: '#666666',
    border: '#404040',
  },
};
```

---

## Typography

### Font Families

| Platform | Primary | Secondary |
|----------|---------|-----------|
| iOS | SF Pro Display | SF Pro Text |
| Android | Roboto | Roboto |

### Type Scale

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| **Display** | 48pt | Bold (700) | 56pt | "I'm Okay" button text |
| **H1** | 32pt | Bold (700) | 40pt | Screen titles |
| **H2** | 24pt | SemiBold (600) | 32pt | Section headers |
| **H3** | 20pt | SemiBold (600) | 28pt | Card titles |
| **Body** | 16pt | Regular (400) | 24pt | Main content |
| **Body Small** | 14pt | Regular (400) | 20pt | Secondary content |
| **Caption** | 12pt | Regular (400) | 16pt | Timestamps, metadata |
| **Button** | 16pt | SemiBold (600) | 24pt | Button labels |

### Usage in Code

```typescript
// constants/Typography.ts
import { StyleSheet } from 'react-native';

export const Typography = StyleSheet.create({
  display: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  },
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
});
```

---

## Spacing

Use an 8pt grid system for consistency.

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4pt | Tight spacing, icon padding |
| `sm` | 8pt | Related elements |
| `md` | 16pt | Standard gaps |
| `lg` | 24pt | Section spacing |
| `xl` | 32pt | Major sections |
| `2xl` | 48pt | Screen padding (dependent) |
| `3xl` | 64pt | Large visual spacing |

```typescript
// constants/Spacing.ts
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};
```

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 4pt | Small chips, tags |
| `md` | 8pt | Buttons, inputs |
| `lg` | 16pt | Cards |
| `xl` | 24pt | Modals |
| `full` | 9999pt | Circular buttons, avatars |

```typescript
// constants/BorderRadius.ts
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
};
```

---

## Shadows

```typescript
// constants/Shadows.ts
import { Platform } from 'react-native';

export const Shadows = {
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
  }),
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
  }),
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
  }),
};
```

---

## Component Patterns

### Buttons

#### Primary Button (I'm Okay)

The main check-in button should be:
- Minimum 200x200pt on dependent home screen
- Circular with full border radius
- Primary green color with subtle shadow
- Text: "I'm Okay" in Display typography

```typescript
// Example implementation
const ImOkayButton = styled.TouchableOpacity`
  width: 200px;
  height: 200px;
  border-radius: 100px;
  background-color: ${Colors.light.primary};
  justify-content: center;
  align-items: center;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.2;
  shadow-radius: 8px;
  elevation: 8;
`;
```

#### Secondary Button

- Height: 48pt minimum
- Border radius: md (8pt)
- Outlined style with primary color border

#### Danger Button

- Same dimensions as secondary
- Danger color for destructive actions

### Cards

- Background: Surface color
- Border radius: lg (16pt)
- Padding: lg (24pt)
- Shadow: md

### Status Indicators

| Status | Color | Icon |
|--------|-------|------|
| Checked in | Primary Green | Checkmark |
| Pending | Warning Orange | Clock |
| Missed | Danger Red | Alert |
| Offline | Text Disabled | Offline |

### Touch Targets

**Minimum touch target size: 48x48pt**

This is critical for accessibility, especially for elderly users with reduced dexterity.

---

## Accessibility Requirements

### Color Contrast

- All text must meet WCAG 2.1 AA standards
- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text (24pt+)

### Screen Reader Support

- All interactive elements must have accessible labels
- Images must have alt text
- Status changes must be announced

### Motion

- Respect user's "Reduce Motion" preference
- Provide alternative to animations
- No auto-playing animations that could cause discomfort

---

## Lock Screen Widget Design

### iOS Widget

- Size: Small (circular) or Medium (rectangular)
- Shows: "I'm Okay" button + last check-in time
- Tap action: Check in or open app

### Android Widget

- Size: 2x2 cells minimum
- Shows: Large "I'm Okay" button
- Background: Semi-transparent with blur

---

## Dark Mode

The app must support both light and dark modes, respecting system preferences by default with an option to override.

### Key Differences

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | #F5F5F5 | #1A1A1A |
| Surface | #FFFFFF | #2D2D2D |
| Primary Light | #C8E6C9 | #1B5E20 |
| Text | #212121 | #FFFFFF |

---

## Animation Guidelines

### Timing

| Type | Duration | Easing |
|------|----------|--------|
| Micro (feedback) | 100ms | ease-out |
| Standard (transitions) | 200ms | ease-in-out |
| Emphasis (celebrations) | 300ms | spring |

### Check-in Success Animation

1. Button scales down slightly (95%) on press
2. On release, button pulses with primary light color
3. Checkmark appears with fade-in
4. Optional: Confetti for milestone check-ins

---

## Reference Implementations

See `/docs/designs/` for Figma exports of:
- Dependent home screen
- Guardian dashboard
- Lock screen widgets
- All button states
- Dark mode variants
