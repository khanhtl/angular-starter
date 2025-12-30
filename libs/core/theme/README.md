# Theme System

A comprehensive theming system with design tokens, dark/light mode support, and 5 pre-configured color themes.

## Features

- 🎨 **5 Color Themes**: Purple, Green, Blue, Orange, Teal
- 🌓 **Dark/Light Mode**: Full support for both modes
- 🎯 **Design Tokens**: CSS custom properties for complete customization
- 🔧 **Framework-Agnostic Core**: Reusable across different frameworks
- 💾 **Persistence**: Theme preferences saved to localStorage
- ⚡ **Signal-Based**: Reactive theme updates using Angular signals

## Architecture

### Core Library (`libs/core/theme`)

The core theme logic is framework-agnostic and can be reused with other frameworks:

- **theme.types.ts**: TypeScript interfaces and types
- **theme-colors.ts**: Color palette definitions for all themes
- **design-tokens.ts**: Design token definitions and utilities

### Angular Integration (`src/app/services`)

- **theme.service.ts**: Angular service for theme management using signals

## Usage

### Basic Usage

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  // ...
})
export class MyComponent {
  readonly themeService = inject(ThemeService);

  // Toggle dark/light mode
  toggleMode() {
    this.themeService.toggleMode();
  }

  // Set specific color theme
  setTheme() {
    this.themeService.setColor('purple');
  }

  // Get current theme
  getCurrentTheme() {
    const config = this.themeService.getThemeConfig();
    console.log(config); // { mode: 'light', color: 'green' }
  }
}
```

### Template Usage

```html
<!-- Display current mode -->
<div>Current mode: {{ themeService.mode() }}</div>

<!-- Display current color theme -->
<div>Current theme: {{ themeService.color() }}</div>

<!-- Toggle button -->
<button (click)="themeService.toggleMode()">
  @if (themeService.mode() === 'light') {
    Switch to Dark
  } @else {
    Switch to Light
  }
</button>
```

## Design Tokens

### Spacing Tokens

- `--space-xs`: 8px
- `--space-sm`: 16px
- `--space-md`: 24px
- `--space-lg`: 32px
- `--space-xl`: 48px

### Sizing Tokens

- `--h-sm`: 28px
- `--h-md`: 36px
- `--h-lg`: 44px

### Border Radius Tokens

- `--w-radius-xs`: 4px
- `--w-radius-sm`: 6px
- `--w-radius`: 8px
- `--w-radius-lg`: 12px
- `--w-radius-xl`: 16px

### Color Tokens

#### Semantic Colors (Theme-Aware)

- `--c-brand`: Primary brand color
- `--c-primary`: Primary color
- `--c-primary-hover`: Primary hover state
- `--c-primary-active`: Primary active state
- `--c-secondary`: Secondary color
- `--c-bg`: Background color
- `--c-text`: Text color
- `--c-tips`: Hint/tip text color
- `--c-border`: Border color
- `--c-hover`: Hover color

#### Fixed Colors

- `--c-white`: #ffffff
- `--c-black`: #000000
- `--c-red`: #ef4444
- `--c-yellow`: #f59e0b
- `--c-gray`: #9ca3af

## Color Themes

### Purple Theme
- Primary: #8b5cf6
- Secondary: #a78bfa

### Green Theme (Default)
- Primary: #42b983
- Secondary: #52c993

### Blue Theme
- Primary: #3b82f6
- Secondary: #60a5fa

### Orange Theme
- Primary: #f97316
- Secondary: #fb923c

### Teal Theme
- Primary: #14b8a6
- Secondary: #2dd4bf

## Customization

### Adding a New Theme

1. Add the theme to `ColorTheme` type in `theme.types.ts`:
```typescript
export type ColorTheme = 'purple' | 'green' | 'blue' | 'orange' | 'teal' | 'custom';
```

2. Define the color palette in `theme-colors.ts`:
```typescript
const customTheme: ThemeColorDefinition = {
  name: 'custom',
  label: 'Custom',
  light: {
    primary: '#your-color',
    // ...
  },
  dark: {
    primary: '#your-dark-color',
    // ...
  },
};
```

3. Add to `THEME_COLORS` and `THEME_COLOR_LIST`.

4. Add CSS gradient in `app.scss`:
```scss
&[data-theme="custom"] .color-preview {
  background: linear-gradient(135deg, #your-color 0%, #your-secondary 100%);
}
```

### Using Design Tokens in Components

Always use design tokens instead of hard-coded values:

```scss
// ✅ Good
.my-component {
  padding: var(--space-md);
  border-radius: var(--w-radius);
  background-color: var(--c-bg);
  color: var(--c-text);
}

// ❌ Bad
.my-component {
  padding: 24px;
  border-radius: 8px;
  background-color: #f8f8f8;
  color: #374151;
}
```

## Framework-Agnostic Usage

The core theme library can be used with other frameworks:

```typescript
import { THEME_COLORS, getDesignTokens } from '@angular-starter/core/theme';

// Get theme colors
const greenTheme = THEME_COLORS.green;

// Get design tokens
const tokens = getDesignTokens('light', greenTheme.light.primary, greenTheme.light.primaryHover);

// Apply to your framework (React example)
document.documentElement.style.setProperty('--c-brand', tokens.colorBrand);
```

## Persistence

Theme preferences are automatically saved to localStorage with the key `angular-starter-theme`. The theme is restored on application initialization.

## Browser Support

The theme system uses CSS custom properties (CSS variables), which are supported in all modern browsers:
- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 15+
