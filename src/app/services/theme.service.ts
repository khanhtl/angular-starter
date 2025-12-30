import {
    ColorTheme,
    DEFAULT_THEME_CONFIG,
    getDesignTokens,
    THEME_COLORS,
    ThemeConfig,
    ThemeMode,
} from '@angular-starter/core/theme';
import { effect, Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'angular-starter-theme';

@Injectable({
    providedIn: 'root',
})
export class ThemeService {
    // Theme state signals
    private readonly _mode = signal<ThemeMode>(DEFAULT_THEME_CONFIG.mode);
    private readonly _color = signal<ColorTheme>(DEFAULT_THEME_CONFIG.color);

    // Public readonly signals
    readonly mode = this._mode.asReadonly();
    readonly color = this._color.asReadonly();

    constructor() {
        // Load theme from localStorage on initialization
        this.loadTheme();

        // Apply theme whenever it changes
        effect(() => {
            this.applyTheme();
        });
    }

    /**
     * Set the theme mode (light/dark)
     */
    setMode(mode: ThemeMode): void {
        this._mode.set(mode);
        this.saveTheme();
    }

    /**
     * Set the color theme
     */
    setColor(color: ColorTheme): void {
        this._color.set(color);
        this.saveTheme();
    }

    /**
     * Toggle between light and dark mode
     */
    toggleMode(): void {
        const newMode = this._mode() === 'light' ? 'dark' : 'light';
        this.setMode(newMode);
    }

    /**
     * Get current theme configuration
     */
    getThemeConfig(): ThemeConfig {
        return {
            mode: this._mode(),
            color: this._color(),
        };
    }

    /**
     * Load theme from localStorage
     */
    private loadTheme(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const config: ThemeConfig = JSON.parse(stored);
                this._mode.set(config.mode);
                this._color.set(config.color);
            }
        } catch (error) {
            console.warn('Failed to load theme from localStorage:', error);
        }
    }

    /**
     * Save theme to localStorage
     */
    private saveTheme(): void {
        try {
            const config = this.getThemeConfig();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch (error) {
            console.warn('Failed to save theme to localStorage:', error);
        }
    }

    /**
     * Apply theme by updating CSS custom properties
     */
    private applyTheme(): void {
        const mode = this._mode();
        const colorTheme = this._color();
        const themeDefinition = THEME_COLORS[colorTheme];
        const palette = themeDefinition[mode];

        // Get design tokens
        const tokens = getDesignTokens(mode, palette.primary, palette.primaryHover);

        // Apply to document root
        const root = document.documentElement;

        // Set data attributes for CSS selectors
        root.setAttribute('data-theme-mode', mode);
        root.setAttribute('data-theme-color', colorTheme);

        // Apply all design tokens as CSS custom properties
        root.style.setProperty('--space-xs', tokens.spaceXs);
        root.style.setProperty('--space-sm', tokens.spaceSm);
        root.style.setProperty('--space-md', tokens.spaceMd);
        root.style.setProperty('--space-lg', tokens.spaceLg);
        root.style.setProperty('--space-xl', tokens.spaceXl);

        root.style.setProperty('--h-sm', tokens.heightSm);
        root.style.setProperty('--h-md', tokens.heightMd);
        root.style.setProperty('--h-lg', tokens.heightLg);

        root.style.setProperty('--w-radius-xs', tokens.radiusXs);
        root.style.setProperty('--w-radius-sm', tokens.radiusSm);
        root.style.setProperty('--w-radius', tokens.radiusMd);
        root.style.setProperty('--w-radius-lg', tokens.radiusLg);
        root.style.setProperty('--w-radius-xl', tokens.radiusXl);

        root.style.setProperty('--c-brand', tokens.colorBrand);
        root.style.setProperty('--c-bg', tokens.colorBg);
        root.style.setProperty('--c-text', tokens.colorText);
        root.style.setProperty('--c-tips', tokens.colorTips);
        root.style.setProperty('--c-border', tokens.colorBorder);
        root.style.setProperty('--c-mask', tokens.colorMask);
        root.style.setProperty('--c-hover', tokens.colorHover);
        root.style.setProperty('--c-disable', tokens.colorDisable);
        root.style.setProperty('--c-white', tokens.colorWhite);
        root.style.setProperty('--c-black', tokens.colorBlack);
        root.style.setProperty('--c-red', tokens.colorRed);
        root.style.setProperty('--c-yellow', tokens.colorYellow);
        root.style.setProperty('--c-gray', tokens.colorGray);
        root.style.setProperty('--c-surface', tokens.colorSurface);

        // Apply theme-specific colors
        root.style.setProperty('--c-primary', palette.primary);
        root.style.setProperty('--c-primary-hover', palette.primaryHover);
        root.style.setProperty('--c-primary-active', palette.primaryActive);
        root.style.setProperty('--c-secondary', palette.secondary);
        root.style.setProperty('--c-secondary-hover', palette.secondaryHover);
        root.style.setProperty('--c-secondary-active', palette.secondaryActive);
    }
}
