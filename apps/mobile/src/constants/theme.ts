// ============================================================
// HEAR ME — Design System
// Love : rose, rouge, orange  |  Amitié : bleu, violet
// ============================================================

import { Platform } from 'react-native'

// --- Palette HearMe ---
export const Colors = {
  // Thème clair (défaut)
  light: {
    background: '#FAFAFA',
    backgroundElement: '#FFE4EF',
    backgroundSelected: '#FFB3D1',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    tint: '#FF6B9D',
    icon: '#6B7280',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#FF6B9D',
  },

  // Thème sombre
  dark: {
    background: '#1A1A2E',
    backgroundElement: '#2D1B3D',
    backgroundSelected: '#4A1942',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    tint: '#FF6B9D',
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: '#FF6B9D',
  },

  // --- Thème Amour ---
  love: {
    primary: '#FF6B9D',   // Rose
    secondary: '#FF4757', // Rouge
    accent: '#FFA94D',    // Orange
    light: '#FFF0F5',     // Fond rose très clair
    card: '#FFE4EF',      // Fond carte
    gradient: ['#FF6B9D', '#FF4757', '#FFA94D'] as string[],
  },

  // --- Thème Amitié ---
  friendship: {
    primary: '#5C7CFA',   // Bleu
    secondary: '#7950F2', // Violet
    accent: '#339AF0',    // Bleu clair
    light: '#F0F4FF',     // Fond bleu très clair
    card: '#E8EEFF',      // Fond carte
    gradient: ['#5C7CFA', '#7950F2', '#339AF0'] as string[],
  },

  // --- Couleurs communes ---
  white: '#FFFFFF',
  black: '#1A1A2E',
  background: '#FAFAFA',

  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // --- États ---
  success: '#2ED573',
  error: '#FF4757',
  warning: '#FFA94D',
  info: '#5C7CFA',

  // --- Abonnements ---
  plans: {
    free: '#9CA3AF',      // Gris — Disque d'Or
    platinum: '#818CF8',  // Violet clair — Disque de Platine
    diamond: '#38BDF8',   // Bleu diamant — Disque de Diamant
  },
} as const

// Type union des clés de couleurs de thème (utilisé par ThemedText / ThemedView)
export type ThemeColor = keyof typeof Colors.light

export const Typography = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 36,

  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
}

// Espacement — échelle numérique (one→six) + nommée (xs→5xl)
export const Spacing = {
  // Clés nommées (composants template)
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,

  // Clés sémantiques HearMe
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    ...Platform.select({ web: { boxShadow: '0px 1px 4px rgba(0,0,0,0.08)' } as any }),
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    ...Platform.select({ web: { boxShadow: '0px 4px 12px rgba(0,0,0,0.12)' } as any }),
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    ...Platform.select({ web: { boxShadow: '0px 8px 20px rgba(0,0,0,0.15)' } as any }),
  },
}

// Polices
export const Fonts = {
  mono: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    web: '"Courier New", Courier, monospace',
  }) as string,
}

export const MaxContentWidth = 560

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0
