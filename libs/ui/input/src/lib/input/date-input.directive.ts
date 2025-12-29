import { Directive, HostListener, OnInit, forwardRef, input, effect } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputBaseDirective } from './input-base.directive';

@Directive({
    selector: 'input[appDateInput]',
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AppDateInputDirective),
            multi: true
        }
    ],
    host: {
        '[class.app-input]': 'true'
    }
})
export class AppDateInputDirective extends InputBaseDirective implements OnInit {
    format = input<string>('dd/MM/yyyy', { alias: 'appDateInput' });
    maskChar = input<string>('_');

    private mask = '';

    ngOnInit(): void {
        this.updateMask();
    }
    
    constructor() {
        super();
        effect(() => {
            // Re-calculate mask when format changes
            this.updateMask();
            // Also attempt to re-mask current value if it exists
            const val = this.elementRef.nativeElement.value;
            if (val) {
                 const digits = val.replace(/[^\d]/g, '');
                 if (digits.length > 0) {
                     const newValue = this.formatDigitsToMask(digits);
                     this.renderer.setProperty(this.elementRef.nativeElement, 'value', newValue);
                 } else {
                     this.renderer.setProperty(this.elementRef.nativeElement, 'value', this.mask);
                 }
            }
        });
    }

    private updateMask(): void {
        this.mask = this.format()
            .replace(/[dMyHm]/g, this.maskChar());
    }

    @HostListener('focus')
    onFocus(): void {
        if (!this.elementRef.nativeElement.value) {
            this.renderer.setProperty(this.elementRef.nativeElement, 'value', this.mask);
            this.setCursorPosition(0);
        }
    }

    @HostListener('click')
    onClick(): void {
        const input = this.elementRef.nativeElement;
        if (input.value === this.mask) {
            this.setCursorPosition(0);
        }
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {
        const input = this.elementRef.nativeElement;
        const key = event.key;
        const pos = input.selectionStart || 0;

        if (key === 'Backspace' || key === 'Delete') {
            event.preventDefault();
            const start = key === 'Backspace' ? Math.max(0, pos - 1) : pos;
            const end = key === 'Backspace' ? pos : pos + 1;
            this.handleDelete(start, end);
            return;
        }

        if (/^\d$/.test(key)) {
            event.preventDefault();
            this.handleInput(key, pos);
        } else if (!['ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(key)) {
            if (!event.ctrlKey && !event.metaKey) {
                event.preventDefault();
            }
        }
    }

    @HostListener('input', ['$event'])
    onInputEvent(event: Event): void {
        this.emitValue();
    }

    override writeValue(value: any): void {
        if (!value) {
            this.renderer.setProperty(this.elementRef.nativeElement, 'value', '');
            return;
        }

        let displayValue = this.mask;
        if (typeof value === 'string') {
            // Try to handle various input formats (ISO or digits)
            const digits = value.replace(/[^\d]/g, '');
            if (digits.length === 8) {
                displayValue = this.formatDigitsToMask(digits);
            } else {
                displayValue = this.formatValue(value);
            }
        }

        this.renderer.setProperty(this.elementRef.nativeElement, 'value', displayValue);
    }

    private formatDigitsToMask(digits: string): string {
        // Logic to try and map digits to format
        // This is a simple version
        let formatted = this.mask.split('');
        let digitIdx = 0;
        for (let i = 0; i < this.mask.length && digitIdx < digits.length; i++) {
            if (this.format()[i].match(/[dMyHm]/)) {
                formatted[i] = digits[digitIdx++];
            }
        }
        return formatted.join('');
    }

    private handleInput(key: string, pos: number): void {
        const input = this.elementRef.nativeElement;
        let currentPos = pos;

        while (currentPos < this.mask.length && this.format()[currentPos].match(/[^dMyHm]/)) {
            currentPos++;
        }

        if (currentPos >= this.mask.length) return;

        const currentValue = input.value.split('');
        currentValue[currentPos] = key;

        const newValue = currentValue.join('');
        this.renderer.setProperty(input, 'value', this.validateInput(newValue, currentPos));

        let nextPos = currentPos + 1;
        while (nextPos < this.mask.length && this.format()[nextPos].match(/[^dMyHm]/)) {
            nextPos++;
        }
        this.setCursorPosition(nextPos);
        this.emitValue();
    }

    private handleDelete(start: number, end: number): void {
        const input = this.elementRef.nativeElement;
        const currentValue = input.value.split('');

        for (let i = start; i < end && i < this.mask.length; i++) {
            if (this.format()[i].match(/[dMyHm]/)) {
                currentValue[i] = this.maskChar();
            }
        }

        this.renderer.setProperty(input, 'value', currentValue.join(''));
        this.setCursorPosition(start);
        this.emitValue();
    }

    private validateInput(value: string, lastPos: number): string {
        const parts = value.split('');
        const format = this.format();
        const chars = this.maskChar();

        const dIdx = format.indexOf('dd');
        if (dIdx !== -1 && !parts.slice(dIdx, dIdx + 2).includes(chars)) {
            const day = parseInt(parts.slice(dIdx, dIdx + 2).join(''), 10);
            if (day > 31) { parts[dIdx] = '3'; parts[dIdx + 1] = '1'; }
            else if (day === 0) { parts[dIdx] = '0'; parts[dIdx + 1] = '1'; }
        }

        const mIdx = format.indexOf('MM');
        if (mIdx !== -1 && !parts.slice(mIdx, mIdx + 2).includes(chars)) {
            const month = parseInt(parts.slice(mIdx, mIdx + 2).join(''), 10);
            if (month > 12) { parts[mIdx] = '1'; parts[mIdx + 1] = '2'; }
            else if (month === 0) { parts[mIdx] = '0'; parts[mIdx + 1] = '1'; }
        }

        const hIdx = format.indexOf('HH');
        if (hIdx !== -1 && !parts.slice(hIdx, hIdx + 2).includes(chars)) {
            const hour = parseInt(parts.slice(hIdx, hIdx + 2).join(''), 10);
            if (hour > 23) { parts[hIdx] = '2'; parts[hIdx + 1] = '3'; }
        }

        const mnIdx = format.indexOf('mm');
        if (mnIdx !== -1 && !parts.slice(mnIdx, mnIdx + 2).includes(chars)) {
            const minute = parseInt(parts.slice(mnIdx, mnIdx + 2).join(''), 10);
            if (minute > 59) { parts[mnIdx] = '5'; parts[mnIdx + 1] = '9'; }
        }

        return parts.join('');
    }

    private formatValue(value: any): string {
        const digits = value.toString().replace(/[^\d]/g, '');
        return this.formatDigitsToMask(digits);
    }

    private emitValue(): void {
        const val = this.elementRef.nativeElement.value;
        // Return full string or empty if completely empty/mask-only
        if (val === this.mask || !val) {
            this.onChange('');
        } else {
            this.onChange(val);
        }
    }

    private setCursorPosition(pos: number): void {
        setTimeout(() => {
            this.elementRef.nativeElement.setSelectionRange(pos, pos);
        }, 0);
    }
}
