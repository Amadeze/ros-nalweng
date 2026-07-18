export interface ColorVariant {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ColorPalette {
  primary: ColorVariant;
  secondary: ColorVariant;
  accent: ColorVariant;
  neutral: ColorVariant;
  success: ColorVariant;
  warning: ColorVariant;
  error: ColorVariant;
}

export const lightColors: ColorPalette = {
  primary: {
    50: '#fdf8f3',
    100: '#f5e6d3',
    200: '#e8cba5',
    300: '#d4a373',
    400: '#c49a6c',
    500: '#a0522d',
    600: '#8B4513',
    700: '#6d3610',
    800: '#5c3317',
    900: '#4a2a14',
    950: '#2d2218',
  },
  secondary: {
    50: '#f8f5f0',
    100: '#f0e8d8',
    200: '#e0d0b0',
    300: '#c9b08a',
    400: '#b8966a',
    500: '#a07d4d',
    600: '#8a6a3e',
    700: '#705432',
    800: '#5a4429',
    900: '#4a3822',
    950: '#2a1f12',
  },
  accent: {
    50: '#fef7ee',
    100: '#fde8d0',
    200: '#fbc99d',
    300: '#f9a25e',
    400: '#f67d2d',
    500: '#f46412',
    600: '#e54a08',
    700: '#be3609',
    800: '#952c10',
    900: '#772610',
    950: '#401006',
  },
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    300: '#d6d3d1',
    400: '#a8a29e',
    500: '#78716c',
    600: '#57534e',
    700: '#44403c',
    800: '#292524',
    900: '#1c1917',
    950: '#0c0a09',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
};

export const darkColors: ColorPalette = {
  primary: {
    50: '#2d2218',
    100: '#3d2e1e',
    200: '#4a3822',
    300: '#5c3317',
    400: '#6d3610',
    500: '#8B4513',
    600: '#a0522d',
    700: '#c49a6c',
    800: '#d4a373',
    900: '#e8cba5',
    950: '#f5e6d3',
  },
  secondary: {
    50: '#2a1f12',
    100: '#3a2e1a',
    200: '#4a3822',
    300: '#5a4429',
    400: '#705432',
    500: '#8a6a3e',
    600: '#a07d4d',
    700: '#b8966a',
    800: '#c9b08a',
    900: '#e0d0b0',
    950: '#f0e8d8',
  },
  accent: {
    50: '#401006',
    100: '#5a1a0a',
    200: '#772610',
    300: '#952c10',
    400: '#be3609',
    500: '#e54a08',
    600: '#f46412',
    700: '#f67d2d',
    800: '#f9a25e',
    900: '#fbc99d',
    950: '#fde8d0',
  },
  neutral: {
    50: '#0c0a09',
    100: '#1c1917',
    200: '#292524',
    300: '#44403c',
    400: '#57534e',
    500: '#78716c',
    600: '#a8a29e',
    700: '#d6d3d1',
    800: '#e7e5e4',
    900: '#f5f5f4',
    950: '#fafaf9',
  },
  success: {
    50: '#052e16',
    100: '#14532d',
    200: '#166534',
    300: '#15803d',
    400: '#16a34a',
    500: '#22c55e',
    600: '#4ade80',
    700: '#86efac',
    800: '#bbf7d0',
    900: '#dcfce7',
    950: '#f0fdf4',
  },
  warning: {
    50: '#451a03',
    100: '#78350f',
    200: '#92400e',
    300: '#b45309',
    400: '#d97706',
    500: '#f59e0b',
    600: '#fbbf24',
    700: '#fcd34d',
    800: '#fde68a',
    900: '#fef3c7',
    950: '#fffbeb',
  },
  error: {
    50: '#450a0a',
    100: '#7f1d1d',
    200: '#991b1b',
    300: '#b91c1c',
    400: '#dc2626',
    500: '#ef4444',
    600: '#f87171',
    700: '#fca5a5',
    800: '#fecaca',
    900: '#fee2e2',
    950: '#fef2f2',
  },
};

export const colors = {
  light: lightColors,
  dark: darkColors,
};
