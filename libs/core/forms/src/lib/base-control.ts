import { Directive, EventEmitter, Input, Output, booleanAttribute, signal } from '@angular/core';
import { ControlValueAccessor, FormControl } from '@angular/forms';

@Directive()
export abstract class BaseControl<T> implements ControlValueAccessor {
    @Input() label = '';
    @Input() hint = '';
    @Input() errorText = '';
    @Input({ transform: booleanAttribute }) required = false;
    @Input({ transform: booleanAttribute }) disabled = false;
    @Input({ transform: booleanAttribute }) readonly = false;
    @Input() name = '';

    @Output() valueChanged = new EventEmitter<T>();

    control = new FormControl<T>(null as any);
    isTouched = signal(false);

    static nextId = 0;
    id = `app-control-${BaseControl.nextId++}`;

    onChange: (value: T) => void = () => { };
    onTouched: () => void = () => { };

    constructor() {
        this.control.valueChanges.subscribe(value => {
            this.onChange(value!);
            this.valueChanged.emit(value!);
            this.handleValueChanged(value!);
        });
    }

    /** Hook for subclasses to respond to value changes */
    protected handleValueChanged(value: T): void { }

    get isInvalid(): boolean {
        return this.isTouched() && this.required && !this.control.value;
    }

    writeValue(value: T): void {
        this.control.setValue(value, { emitEvent: false });
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
        if (isDisabled) {
            this.control.disable({ emitEvent: false });
        } else {
            this.control.enable({ emitEvent: false });
        }
    }

    handleBlur(): void {
        this.isTouched.set(true);
        this.onTouched();
    }

    handleFocus(): void {
        // Optional focus logic
    }

    clear(): void {
        this.control.setValue(null as any, { emitEvent: true });
    }

    reset(): void {
        this.clear();
        this.isTouched.set(false);
    }
}
