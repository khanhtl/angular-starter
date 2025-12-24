import { Directive, ElementRef, inject, Renderer2 } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Directive({
    standalone: true
})
export abstract class InputBaseDirective implements ControlValueAccessor {
    protected elementRef = inject(ElementRef<HTMLInputElement>);
    protected renderer = inject(Renderer2);

    onChange: (value: any) => void = () => { };
    onTouched: () => void = () => { };

    writeValue(value: any): void {
        const normalizedValue = value == null ? '' : value;
        this.renderer.setProperty(this.elementRef.nativeElement, 'value', normalizedValue);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
    }
}
