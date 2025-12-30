/**
 * Theme mode: light or dark
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Available color themes
 */
export type ColorTheme = 'purple' | 'green' | 'blue' | 'orange' | 'teal';

/**
 * Complete theme configuration
 */
export interface ThemeConfig {
    mode: ThemeMode;
    color: ColorTheme;
}

/**
 * Color palette for a single theme
 */
export interface ColorPalette {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
    secondaryActive: string;
}

/**
 * Theme color definition with light and dark variants
 */
export interface ThemeColorDefinition {
    name: ColorTheme;
    label: string;
    light: ColorPalette;
    dark: ColorPalette;
}

/**
 * Design token values
 */
export interface DesignTokens {
    // Spacing
    spaceXs: string;
    spaceSm: string;
    spaceMd: string;
    spaceLg: string;
    spaceXl: string;

    // Sizing
    heightSm: string;
    heightMd: string;
    heightLg: string;

    // Border radius
    radiusXs: string;
    radiusSm: string;
    radiusMd: string;
    radiusLg: string;
    radiusXl: string;

    // Colors (semantic)
    colorBrand: string;
    colorBg: string;
    colorText: string;
    colorTips: string;
    colorBorder: string;
    colorMask: string;
    colorHover: string;
    colorDisable: string;
    colorWhite: string;
    colorBlack: string;
    colorRed: string;
    colorYellow: string;
    colorGray: string;
    colorSurface: string;
}
