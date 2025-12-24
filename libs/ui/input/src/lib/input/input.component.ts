import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  booleanAttribute,
  forwardRef,
  signal
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import { Eye, EyeOff, LucideAngularModule, X } from 'lucide-angular';
import { AppDateInputDirective } from './date-input.directive';
import { AppFormattedInputDirective } from './formatted-input.directive';
import { AppInputDirective } from './input.directive';
import { AppMaskedInputDirective } from './masked-input.directive';
import { AppPasswordInputDirective } from './password-input.directive';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
    AppInputDirective,
    AppPasswordInputDirective,
    AppMaskedInputDirective,
    AppFormattedInputDirective,
    AppDateInputDirective
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppInputComponent),
      multi: true
    }
  ],
  template: `
<div class="app-input-container" [class.has-error]="isInvalid">
  @if (label) {
    <label [for]="id" class="app-input-label">
      {{ label }}
      @if (required) {
        <span class="required-star">*</span>
      }
    </label>
  }

  <div class="input-wrapper" [class.has-prefix]="hasPrefix" [class.has-suffix]="hasSuffix" 
       [class.is-disabled]="disabled || control.disabled" [class.is-readonly]="readonly">
    @if (prefixIcon) {
       <div class="icon-prefix">
         <i-lucide [img]="prefixIcon" [size]="18"></i-lucide>
       </div>
    }

    @if (mask) {
      <input [id]="id" [type]="computedType" [formControl]="control" 
             [appMaskedInput]="mask" [placeholder]="placeholder" (blur)="onBlur()" 
             [disabled]="disabled" [readonly]="readonly"
             class="app-input" [class.with-prefix]="prefixIcon" [class.with-suffix]="hasSuffix" />
    } @else if (format) {
      <input [id]="id" [type]="computedType" [formControl]="control" 
             [appFormattedInput]="format" [placeholder]="placeholder" (blur)="onBlur()" 
             [disabled]="disabled" [readonly]="readonly"
             class="app-input" [class.with-prefix]="prefixIcon" [class.with-suffix]="hasSuffix" />
    } @else if (datePattern) {
      <input [id]="id" [type]="computedType" [formControl]="control" 
             [appDateInput]="datePattern" [placeholder]="placeholder" (blur)="onBlur()" 
             [disabled]="disabled" [readonly]="readonly"
             class="app-input" [class.with-prefix]="prefixIcon" [class.with-suffix]="hasSuffix" />
    } @else if (type === 'password') {
      <input [id]="id" [type]="computedType" [formControl]="control" 
             appPasswordInput [placeholder]="placeholder" (blur)="onBlur()" 
             [disabled]="disabled" [readonly]="readonly"
             class="app-input" [class.with-prefix]="prefixIcon" [class.with-suffix]="hasSuffix" />
    } @else {
      <input [id]="id" [type]="computedType" [formControl]="control" 
             appInput [placeholder]="placeholder" (blur)="onBlur()" 
             [disabled]="disabled" [readonly]="readonly"
             class="app-input" [class.with-prefix]="prefixIcon" [class.with-suffix]="hasSuffix" />
    }

    <div class="input-actions">
      @if (clearable && control.value && !disabled && !control.disabled && !readonly) {
        <span class="input-action-btn clear-btn" (click)="clearValue($event)">
          <i-lucide [img]="X" [size]="16"></i-lucide>
        </span>
      }

      @if (type === 'password') {
        <span class="input-action-btn toggle-password" (click)="togglePasswordVisibility()">
          <i-lucide [img]="isPasswordVisible() ? EyeOff : Eye" [size]="20"></i-lucide>
        </span>
      } @else if (suffixIcon) {
        <div class="icon-suffix">
          <i-lucide [img]="suffixIcon" [size]="18"></i-lucide>
        </div>
      }
    </div>
  </div>

  @if (hint) {
    <p class="app-input-hint">{{ hint }}</p>
  }

  @if (errorText && isInvalid) {
    <p class="app-input-error">{{ errorText }}</p>
  }
</div>
`,
  styleUrl: './input.scss'
})
export class AppInputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() hint: string = '';
  @Input() errorText: string = '';
  @Input({ transform: booleanAttribute }) required: boolean = false;
  private _disabled = false;
  @Input({ transform: booleanAttribute })
  set disabled(value: boolean) {
    this._disabled = value;
    if (value) {
      this.control.disable({ emitEvent: false });
    } else {
      this.control.enable({ emitEvent: false });
    }
  }
  get disabled(): boolean {
    return this._disabled;
  }
  @Input({ transform: booleanAttribute }) readonly: boolean = false;
  @Input({ transform: booleanAttribute }) clearable: boolean = false;

  @Input() prefixIcon: any;
  @Input() suffixIcon: any;

  @Input() mask?: string;
  @Input() format?: string;
  @Input() datePattern?: string;

  @Input() set value(v: any) {
    this.control.setValue(v, { emitEvent: false });
  }

  isTouched = signal(false);
  isPasswordVisible = signal(false);
  control = new FormControl();

  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly X = X;

  static nextId = 0;
  id = `app-input-${AppInputComponent.nextId++}`;

  get computedType(): string {
    if (this.type === 'password') {
      return this.isPasswordVisible() ? 'text' : 'password';
    }
    return this.type;
  }

  get isInvalid(): boolean {
    return this.isTouched() && this.required && !this.control.value;
  }

  get hasPrefix(): boolean {
    return !!this.prefixIcon;
  }

  get hasSuffix(): boolean {
    return !!this.suffixIcon || this.type === 'password' || this.clearable;
  }

  onChange: any = () => { };
  onTouched: any = () => { };

  constructor() {
    this.control.valueChanges.subscribe(val => {
      this.onChange(val);
    });
  }

  writeValue(value: any): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable({ emitEvent: false });
    } else {
      this.control.enable({ emitEvent: false });
    }
  }

  onBlur() {
    this.isTouched.set(true);
    this.onTouched();
  }

  togglePasswordVisibility() {
    this.isPasswordVisible.update(v => !v);
  }

  clearValue(event: MouseEvent) {
    event.stopPropagation();
    this.control.setValue('');
    this.onChange('');
  }
}
