import { Directive, HostListener, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputBaseDirective } from './input-base.directive';

@Directive({
    selector: 'input[appInput]',
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AppInputDirective),
            multi: true
        }
    ],
    host: {
        '[class.app-input]': 'true'
    }
})
export class AppInputDirective extends InputBaseDirective {
    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.onChange(value);
    }

    @HostListener('blur')
    _onBlur(): void {
        this.onTouched();
    }
}
