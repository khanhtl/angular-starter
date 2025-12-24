import { Directive, HostListener, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputBaseDirective } from './input-base.directive';

@Directive({
    selector: 'input[appFormattedInput]',
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AppFormattedInputDirective),
            multi: true
        }
    ],
    host: {
        '[class.app-input]': 'true'
    }
})
export class AppFormattedInputDirective extends InputBaseDirective {
    formatPattern = input<string | undefined>(undefined, { alias: 'appFormattedInput' });
    formatter = input<(value: any) => string>();
    parser = input<(value: string) => any>();

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        const value = inputElement.value;

        const formatted = this.applyFormat(value);
        this.renderer.setProperty(this.elementRef.nativeElement, 'value', formatted);

        const parsed = this.parseValue(formatted);
        this.onChange(parsed);
    }

    @HostListener('blur')
    _onBlur(): void {
        this.onTouched();
        const value = this.elementRef.nativeElement.value;
        const formatted = this.applyFormat(value, true);
        this.renderer.setProperty(this.elementRef.nativeElement, 'value', formatted);
    }

    override writeValue(value: any): void {
        if (value === null || value === undefined || value === '') {
            this.renderer.setProperty(this.elementRef.nativeElement, 'value', '');
            return;
        }
        const formatted = this.applyFormat(value.toString(), true);
        this.renderer.setProperty(this.elementRef.nativeElement, 'value', formatted);
    }

    private applyFormat(value: string, isFinal = false): string {
        const customFormatter = this.formatter();
        if (customFormatter) return customFormatter(value);

        const pattern = this.formatPattern();
        if (!pattern || typeof pattern !== 'string') return value;

        if (pattern.includes('#') || pattern.includes('0')) {
            return this.formatNumeric(value, pattern, isFinal);
        }

        return value;
    }

    private formatNumeric(value: string, pattern: string, isFinal: boolean): string {
        // Clean value to absolute number string
        let cleanValue = value.replace(/[^\d.-]/g, '');
        if (!cleanValue || cleanValue === '-') return cleanValue;

        const num = parseFloat(cleanValue);
        if (isNaN(num)) return '';

        const parts = pattern.split('.');
        const hasDecimalInPattern = parts.length > 1;
        const decimalPart = hasDecimalInPattern ? parts[1] : '';
        const integerPart = parts[0];

        const hasThousandsSeparator = integerPart.includes(',');

        const decimalLength = decimalPart.length;

        // DevExtreme behavior for FixedPoint pattern usually means formatting the number, 
        // not ATM-style shifting. If pattern is ##.##, we round to 2 decimals.

        const options: Intl.NumberFormatOptions = {
            useGrouping: hasThousandsSeparator,
            minimumFractionDigits: isFinal ? (decimalPart.includes('0') ? decimalPart.split('0').length - 1 : 0) : 0,
            maximumFractionDigits: decimalLength || 0
        };

        return num.toLocaleString('en-US', options);
    }

    private parseValue(value: string): any {
        const customParser = this.parser();
        if (customParser) return customParser(value);

        const pattern = this.formatPattern();
        if (pattern && (pattern.includes('#') || pattern.includes('0'))) {
            const clean = value.replace(/[^\d.-]/g, '');
            if (!clean || clean === '-') return null;
            const num = parseFloat(clean);
            return isNaN(num) ? null : num;
        }
        return value;
    }
}
