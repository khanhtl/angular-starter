import { DesignTokens } from './theme.types';

/**
 * Base design tokens (theme-independent)
 */
export const BASE_DESIGN_TOKENS = {
    // Spacing
    spaceXs: '8px',
    spaceSm: '16px',
    spaceMd: '24px',
    spaceLg: '32px',
    spaceXl: '48px',

    // Sizing
    heightSm: '28px',
    heightMd: '36px',
    heightLg: '44px',

    // Border radius
    radiusXs: '4px',
    radiusSm: '6px',
    radiusMd: '8px',
    radiusLg: '12px',
    radiusXl: '16px',

    // Fixed colors
    colorWhite: '#ffffff',
    colorBlack: '#000000',
    colorRed: '#ef4444',
    colorYellow: '#f59e0b',
    colorGray: '#9ca3af',
    colorDisable: 'rgba(0, 0, 0, 0.25)',
} as const;

/**
 * Light mode semantic colors
 */
export const LIGHT_MODE_COLORS = {
    colorBg: '#f8f8f8',
    colorText: '#374151',
    colorTips: '#9ca3af',
    colorBorder: '#d1d5db',
    colorMask: 'rgba(0, 0, 0, 0.7)',
} as const;

/**
 * Dark mode semantic colors
 */
export const DARK_MODE_COLORS = {
    colorBg: '#181818',
    colorText: '#e5e7eb',
    colorTips: '#9ca3af',
    colorBorder: '#4b5563',
    colorMask: 'rgba(0, 0, 0, 0.85)',
} as const;

/**
 * Get complete design tokens for a specific theme mode
 */
export function getDesignTokens(
    mode: 'light' | 'dark',
    brandColor: string,
    hoverColor: string
): DesignTokens {
    const modeColors = mode === 'light' ? LIGHT_MODE_COLORS : DARK_MODE_COLORS;

    return {
        ...BASE_DESIGN_TOKENS,
        ...modeColors,
        colorBrand: brandColor,
        colorHover: hoverColor,
    };
}
