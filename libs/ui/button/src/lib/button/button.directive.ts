import { Directive, Input, booleanAttribute } from '@angular/core';
import { ButtonSize, ButtonVariant } from './button.types';

@Directive({
    selector: 'button[appButton], a[appButton]',
    standalone: true,
    host: {
        '[class.lib-button]': 'true',
        '[class.variant-primary]': 'variant === "primary"',
        '[class.variant-secondary]': 'variant === "secondary"',
        '[class.variant-outline]': 'variant === "outline"',
        '[class.variant-ghost]': 'variant === "ghost"',
        '[class.variant-danger]': 'variant === "danger"',
        '[class.variant-link]': 'variant === "link"',
        '[class.size-sm]': 'size === "sm"',
        '[class.size-md]': 'size === "md"',
        '[class.size-lg]': 'size === "lg"',
        '[class.size-icon]': 'size === "icon"',
        '[class.is-loading]': 'loading',
        '[class.is-disabled]': 'disabled',
        '[attr.disabled]': 'disabled || loading ? true : null'
    }
})
export class AppButtonDirective {
    @Input() variant: ButtonVariant = 'primary';
    @Input() size: ButtonSize = 'md';
    @Input({ transform: booleanAttribute }) loading = false;
    @Input({ transform: booleanAttribute }) disabled = false;
}
