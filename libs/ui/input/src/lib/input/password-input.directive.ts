import { Directive, HostListener, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { InputBaseDirective } from './input-base.directive';

@Directive({
    selector: 'input[appPasswordInput]',
    standalone: true,
    exportAs: 'appPasswordInput',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AppPasswordInputDirective),
            multi: true
        }
    ],
    host: {
        '[class.app-input]': 'true',
        '[attr.type]': 'type'
    }
})
export class AppPasswordInputDirective extends InputBaseDirective {
    type = 'password';

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.onChange(value);
    }

    @HostListener('blur')
    _onBlur(): void {
        this.onTouched();
    }

    toggleVisibility(): void {
        this.type = this.type === 'password' ? 'text' : 'password';
    }
}
