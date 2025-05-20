export type ThemeMode = 'light' | 'dark';

interface ColorPalette {
  primary: string;
  secondary: string;
  background: {
    main: string;
    card: string;
    input: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    accent: string;
  };
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

interface FontSizes {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

interface BorderRadius {
  sm: string;
  md: string;
  lg: string;
  pill: string;
  circle: string;
}

interface Shadows {
  sm: string;
  md: string;
  lg: string;
}

interface ZIndex {
  modal: number;
  dropdown: number;
  tooltip: number;
  header: number;
}

export interface Theme {
  mode: ThemeMode;
  colors: ColorPalette;
  spacing: Spacing;
  fontSizes: FontSizes;
  borderRadius: BorderRadius;
  shadows: Shadows;
  zIndex: ZIndex;
  transitions: {
    default: string;
    fast: string;
    slow: string;
  };
}

// Default spacing used across the application
const spacing: Spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

// Default font sizes
const fontSizes: FontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.5rem',
  xxl: '2rem',
};

// Default border radius
const borderRadius: BorderRadius = {
  sm: '4px',
  md: '8px',
  lg: '16px',
  pill: '9999px',
  circle: '50%',
};

// Default z-index values
const zIndex: ZIndex = {
  modal: 1000,
  dropdown: 100,
  tooltip: 500,
  header: 50,
};

// Dark theme colors
const darkColors: ColorPalette = {
  primary: '#6D5AFF',
  secondary: '#FF7C7C',
  background: {
    main: '#121212',
    card: '#1E1E1E',
    input: '#2A2A2A',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#AAAAAA',
    muted: '#777777',
    accent: '#6D5AFF',
  },
  border: '#333333',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

// Light theme colors
const lightColors: ColorPalette = {
  primary: '#5046E4',
  secondary: '#E4466A',
  background: {
    main: '#F7F7F7',
    card: '#FFFFFF',
    input: '#F0F0F0',
  },
  text: {
    primary: '#222222',
    secondary: '#555555',
    muted: '#999999',
    accent: '#5046E4',
  },
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
};

// Default shadows
const darkShadows: Shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
  md: '0 4px 8px rgba(0, 0, 0, 0.4)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
};

const lightShadows: Shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.05)',
  md: '0 4px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.15)',
};

// Export dark theme
export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
  spacing,
  fontSizes,
  borderRadius,
  shadows: darkShadows,
  zIndex,
  transitions: {
    default: '0.3s ease',
    fast: '0.15s ease',
    slow: '0.5s ease',
  },
};

// Export light theme
export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
  spacing,
  fontSizes,
  borderRadius,
  shadows: lightShadows,
  zIndex,
  transitions: {
    default: '0.3s ease',
    fast: '0.15s ease',
    slow: '0.5s ease',
  },
};

// CSS variables generator from theme
export const generateCssVariables = (theme: Theme): string => {
  return `
    --primary-color: ${theme.colors.primary};
    --secondary-color: ${theme.colors.secondary};
    --background-color: ${theme.colors.background.main};
    --card-background: ${theme.colors.background.card};
    --input-background: ${theme.colors.background.input};
    --text-color: ${theme.colors.text.primary};
    --text-secondary: ${theme.colors.text.secondary};
    --text-muted: ${theme.colors.text.muted};
    --text-accent: ${theme.colors.text.accent};
    --border-color: ${theme.colors.border};
    --success-color: ${theme.colors.success};
    --warning-color: ${theme.colors.warning};
    --error-color: ${theme.colors.error};
    --info-color: ${theme.colors.info};
    
    --spacing-xs: ${theme.spacing.xs};
    --spacing-sm: ${theme.spacing.sm};
    --spacing-md: ${theme.spacing.md};
    --spacing-lg: ${theme.spacing.lg};
    --spacing-xl: ${theme.spacing.xl};
    --spacing-xxl: ${theme.spacing.xxl};
    
    --font-size-xs: ${theme.fontSizes.xs};
    --font-size-sm: ${theme.fontSizes.sm};
    --font-size-md: ${theme.fontSizes.md};
    --font-size-lg: ${theme.fontSizes.lg};
    --font-size-xl: ${theme.fontSizes.xl};
    --font-size-xxl: ${theme.fontSizes.xxl};
    
    --border-radius-sm: ${theme.borderRadius.sm};
    --border-radius-md: ${theme.borderRadius.md};
    --border-radius-lg: ${theme.borderRadius.lg};
    --border-radius-pill: ${theme.borderRadius.pill};
    
    --shadow-sm: ${theme.shadows.sm};
    --shadow-md: ${theme.shadows.md};
    --shadow-lg: ${theme.shadows.lg};
    
    --transition-default: ${theme.transitions.default};
    --transition-fast: ${theme.transitions.fast};
    --transition-slow: ${theme.transitions.slow};
  `;
};

export default {
  dark: darkTheme,
  light: lightTheme,
}; 