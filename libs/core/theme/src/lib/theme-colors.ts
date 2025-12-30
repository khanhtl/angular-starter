import { ColorTheme, ThemeColorDefinition } from './theme.types';

/**
 * Purple theme color palette
 */
const purpleTheme: ThemeColorDefinition = {
    name: 'purple',
    label: 'Purple',
    light: {
        primary: '#8b5cf6',
        primaryHover: '#7c3aed',
        primaryActive: '#6d28d9',
        secondary: '#a78bfa',
        secondaryHover: '#9333ea',
        secondaryActive: '#7e22ce',
    },
    dark: {
        primary: '#a78bfa',
        primaryHover: '#c4b5fd',
        primaryActive: '#ddd6fe',
        secondary: '#8b5cf6',
        secondaryHover: '#a78bfa',
        secondaryActive: '#c4b5fd',
    },
};

/**
 * Green theme color palette (current default)
 */
const greenTheme: ThemeColorDefinition = {
    name: 'green',
    label: 'Green',
    light: {
        primary: '#42b983',
        primaryHover: '#3aa876',
        primaryActive: '#339769',
        secondary: '#52c993',
        secondaryHover: '#42b983',
        secondaryActive: '#3aa876',
    },
    dark: {
        primary: '#52c993',
        primaryHover: '#6dd5a3',
        primaryActive: '#88e1b3',
        secondary: '#42b983',
        secondaryHover: '#52c993',
        secondaryActive: '#6dd5a3',
    },
};

/**
 * Blue theme color palette
 */
const blueTheme: ThemeColorDefinition = {
    name: 'blue',
    label: 'Blue',
    light: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        primaryActive: '#1d4ed8',
        secondary: '#60a5fa',
        secondaryHover: '#3b82f6',
        secondaryActive: '#2563eb',
    },
    dark: {
        primary: '#60a5fa',
        primaryHover: '#93c5fd',
        primaryActive: '#bfdbfe',
        secondary: '#3b82f6',
        secondaryHover: '#60a5fa',
        secondaryActive: '#93c5fd',
    },
};

/**
 * Orange theme color palette
 */
const orangeTheme: ThemeColorDefinition = {
    name: 'orange',
    label: 'Orange',
    light: {
        primary: '#f97316',
        primaryHover: '#ea580c',
        primaryActive: '#c2410c',
        secondary: '#fb923c',
        secondaryHover: '#f97316',
        secondaryActive: '#ea580c',
    },
    dark: {
        primary: '#fb923c',
        primaryHover: '#fdba74',
        primaryActive: '#fed7aa',
        secondary: '#f97316',
        secondaryHover: '#fb923c',
        secondaryActive: '#fdba74',
    },
};

/**
 * Teal theme color palette
 */
const tealTheme: ThemeColorDefinition = {
    name: 'teal',
    label: 'Teal',
    light: {
        primary: '#14b8a6',
        primaryHover: '#0d9488',
        primaryActive: '#0f766e',
        secondary: '#2dd4bf',
        secondaryHover: '#14b8a6',
        secondaryActive: '#0d9488',
    },
    dark: {
        primary: '#2dd4bf',
        primaryHover: '#5eead4',
        primaryActive: '#99f6e4',
        secondary: '#14b8a6',
        secondaryHover: '#2dd4bf',
        secondaryActive: '#5eead4',
    },
};

/**
 * All available theme color definitions
 */
export const THEME_COLORS: Record<ColorTheme, ThemeColorDefinition> = {
    purple: purpleTheme,
    green: greenTheme,
    blue: blueTheme,
    orange: orangeTheme,
    teal: tealTheme,
};

/**
 * Array of all theme color definitions for iteration
 */
export const THEME_COLOR_LIST: ThemeColorDefinition[] = [
    purpleTheme,
    greenTheme,
    blueTheme,
    orangeTheme,
    tealTheme,
];

/**
 * Default theme configuration
 */
export const DEFAULT_THEME_CONFIG = {
    mode: 'light' as const,
    color: 'green' as const,
};
