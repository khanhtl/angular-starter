import { Directive, HostListener, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputBaseDirective } from './input-base.directive';

export type MaskRule = {
    test: (char: string) => boolean;
    transform?: (char: string) => string;
};

export const DEFAULT_MASK_RULES: Record<string, MaskRule> = {
    '0': { test: (char) => /\d/.test(char) },
    '9': { test: (char) => /\d/.test(char) }, // Optional logic can be added
    'L': { test: (char) => /[a-zA-Z]/.test(char) },
    'A': { test: (char) => /[a-zA-Z0-9]/.test(char) },
};

@Directive({
    selector: 'input[appMaskedInput]',
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AppMaskedInputDirective),
            multi: true
        }
    ],
    host: {
        '[class.app-input]': 'true'
    }
})
export class AppMaskedInputDirective extends InputBaseDirective {
    /** Pattern like '(000) 000-0000' or '00/00/0000' */
    mask = input.required<string>({ alias: 'appMaskedInput' });
    maskChar = input<string>('_');

    private rules = DEFAULT_MASK_RULES;

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const value = input.value;
        const formatted = this.applyMask(value);

        this.renderer.setProperty(this.elementRef.nativeElement, 'value', formatted);

        const rawValue = this.getRawValue(formatted);
        this.onChange(rawValue);
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const input = this.elementRef.nativeElement;
        if (event.key === 'Backspace') {
            // Handle specialized backspace logic if needed
        }
    }

    override writeValue(value: any): void {
        const formatted = this.applyMask(value?.toString() || '');
        this.renderer.setProperty(this.elementRef.nativeElement, 'value', formatted);
    }

    private applyMask(value: string): string {
        const pattern = this.mask();
        if (!pattern) return value;

        // Specialized logic for currency (non-fixed masks)
        if (pattern === 'currency') {
            return this.formatCurrency(value);
        }

        // Specialized logic for date validation
        if (pattern === 'date') {
            return this.formatDate(value);
        }

        // Generic Pattern Mask (DevExtreme Style)
        return this.formatByPattern(value, pattern);
    }

    private formatByPattern(value: string, pattern: string): string {
        const cleanRaw = this.getRawValue(value);
        let formatted = '';
        let rawIdx = 0;

        for (let i = 0; i < pattern.length && rawIdx < cleanRaw.length; i++) {
            const maskChar = pattern[i];
            const rule = this.rules[maskChar];

            if (rule) {
                const char = cleanRaw[rawIdx];
                if (rule.test(char)) {
                    formatted += rule.transform ? rule.transform(char) : char;
                    rawIdx++;
                }
            } else {
                formatted += maskChar;
                // If the user typed the literal character, skip it in raw
                if (cleanRaw[rawIdx] === maskChar) {
                    rawIdx++;
                }
            }
        }

        // If it's a date mask, we might want to validate day/month ranges
        if (pattern === '00/00/0000') {
            formatted = this.validateNumericDate(formatted);
        }

        return formatted;
    }

    private validateNumericDate(value: string): string {
        const parts = value.split('/');
        if (parts[0] && parts[0].length === 2) {
            const d = parseInt(parts[0], 10);
            if (d === 0 || d > 31) parts[0] = '01';
        }
        if (parts[1] && parts[1].length === 2) {
            const m = parseInt(parts[1], 10);
            if (m === 0 || m > 12) parts[1] = '01';
        }
        return parts.join('/');
    }

    private formatCurrency(value: string): string {
        const digits = value.replace(/[^\d]/g, '');
        if (!digits) return '';
        return new Intl.NumberFormat('vi-VN').format(parseInt(digits, 10));
    }

    private formatDate(value: string): string {
        return this.formatByPattern(value, '00/00/0000');
    }

    private getRawValue(value: string): string {
        const pattern = this.mask();
        if (pattern === 'currency' || pattern === 'date') {
            return value.replace(/[^\d]/g, '');
        }

        let raw = '';
        let valIdx = 0;

        // We need to extract characters that match the mask tokens
        // Iterate through the pattern and see what the value has at each token position
        for (let i = 0; i < pattern.length && valIdx < value.length; i++) {
            const maskChar = pattern[i];
            const rule = this.rules[maskChar];

            if (rule) {
                // This is a placeholder position. If the char matches the rule, it's raw data.
                if (rule.test(value[valIdx])) {
                    raw += value[valIdx];
                }
                valIdx++;
            } else {
                // This is a literal position (+, 8, 4, space, etc.)
                // If the value has this literal, skip it.
                if (value[valIdx] === maskChar) {
                    valIdx++;
                }
            }
        }

        // If there are remaining characters in value that weren't matched by pattern, 
        // they might be part of an unformatted paste, so let's just return what we found or fallback
        if (raw === '' && value.length > 0) {
            // Fallback for completely unformatted input (e.g. typing first char)
            return value.replace(/[^\d]/g, '');
        }

        return raw;
    }
}
