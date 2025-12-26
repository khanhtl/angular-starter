import { Directive, booleanAttribute, input } from '@angular/core';
import { ButtonColor, ButtonSize, ButtonVariant } from './button.types';

@Directive({
    selector: 'button[appButton], a[appButton]',
    standalone: true,
    host: {
        '[class.lib-button]': 'true',
        '[class.variant-solid]': 'variant() === "solid"',
        '[class.variant-outline]': 'variant() === "outline"',
        '[class.variant-ghost]': 'variant() === "ghost"',
        '[class.variant-link]': 'variant() === "link"',
        '[class.color-primary]': 'color() === "primary"',
        '[class.color-secondary]': 'color() === "secondary"',
        '[class.color-success]': 'color() === "success"',
        '[class.color-warning]': 'color() === "warning"',
        '[class.color-danger]': 'color() === "danger"',
        '[class.color-info]': 'color() === "info"',
        '[class.color-neutral]': 'color() === "neutral"',
        '[class.size-sm]': 'size() === "sm"',
        '[class.size-md]': 'size() === "md"',
        '[class.size-lg]': 'size() === "lg"',
        '[class.size-icon]': 'size() === "icon"',
        '[class.is-loading]': 'loading()',
        '[class.is-disabled]': 'disabled()',
        '[attr.disabled]': 'disabled() || loading() ? true : null'
    }
})
export class AppButtonDirective {
    variant = input<ButtonVariant>('solid');
    color = input<ButtonColor>('primary');
    size = input<ButtonSize>('md');
    loading = input(false, { transform: booleanAttribute });
    disabled = input(false, { transform: booleanAttribute });
}
