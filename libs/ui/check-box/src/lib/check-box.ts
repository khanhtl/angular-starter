import { BaseControl } from '@angular-starter/core/forms';
import { CommonModule } from '@angular/common';
import {
    booleanAttribute,
    Component,
    EventEmitter,
    forwardRef,
    Input,
    Output,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Check, LucideAngularModule, Minus } from 'lucide-angular';
import { CheckBoxCore, CheckBoxValue } from './check-box-core';

@Component({
    selector: 'app-check-box',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, FormsModule, ReactiveFormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CheckBoxComponent),
            multi: true,
        },
    ],
    templateUrl: './check-box.html',
    styleUrl: './check-box.css',
})
export class CheckBoxComponent extends BaseControl<CheckBoxValue> {
    @Input() text = '';
    @Input({ transform: booleanAttribute }) allowIndeterminate = false;

    @Output() onValueChanged = new EventEmitter<CheckBoxValue>();

    readonly CheckIcon = Check;
    readonly MinusIcon = Minus;

    constructor() {
        super();
        this.id = `app-checkbox-${CheckBoxComponent.nextId++}`;
    }

    toggle() {
        if (this.disabled || this.control.disabled || this.readonly) return;

        const newValue = CheckBoxCore.toggle(this.control.value, this.allowIndeterminate);
        this.control.setValue(newValue);
        this.onValueChanged.emit(newValue);
    }

    override writeValue(value: any): void {
        if (CheckBoxCore.isValidValue(value, this.allowIndeterminate)) {
            super.writeValue(value);
        } else {
            super.writeValue(false);
        }
    }
}
