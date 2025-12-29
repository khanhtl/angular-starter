import { BaseControl } from '@angular-starter/core/forms';
import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    contentChildren,
    EventEmitter,
    forwardRef,
    Input,
    Output,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { RadioGroupCore, RadioGroupLayout } from './radio-group-core';
import { ItemTemplateDirective } from './radio-group-templates';

@Component({
    selector: 'app-radio-group',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RadioGroupComponent),
            multi: true,
        },
    ],
    templateUrl: './radio-group.html',
    styleUrl: './radio-group.css',
})
export class RadioGroupComponent extends BaseControl<any> {
    // Inputs
    @Input() items: any[] = [];
    @Input() valueExpr = '';
    @Input() displayExpr = '';
    @Input() layout: RadioGroupLayout = 'vertical';

    // Events
    @Output() onValueChanged = new EventEmitter<any>();

    // Templates
    itemTemplates = contentChildren(ItemTemplateDirective);
    itemTemplate = computed(() => this.itemTemplates()[0]?.template);

    constructor() {
        super();
        this.id = `app-radiogroup-${RadioGroupComponent.nextId++}`;
    }

    selectItem(item: any) {
        if (this.disabled || this.control.disabled || this.readonly) return;

        const newValue = RadioGroupCore.getValue(item, this.valueExpr);
        if (newValue !== this.control.value) {
            this.control.setValue(newValue);
            this.onValueChanged.emit(newValue);
        }
    }

    // Helpers for template
    getItemDisplay(item: any) {
        return RadioGroupCore.getDisplayValue(item, this.displayExpr);
    }

    getItemValue(item: any) {
        return RadioGroupCore.getValue(item, this.valueExpr);
    }

    isSelected(item: any) {
        return RadioGroupCore.isSelected(item, this.control.value, this.valueExpr);
    }
}
