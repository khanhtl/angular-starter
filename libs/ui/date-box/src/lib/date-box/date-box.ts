import { CalendarComponent, CalendarUtil } from '@angular-starter/calendar';
import { AppDateInputDirective } from '@angular-starter/ui/input';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  HostListener,
  input,
  computed,
  signal,
  effect,
  ViewChild
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import { Calendar as CalendarIcon, Clock, LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-date-box',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
    CalendarComponent,
    AppDateInputDirective
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateBoxComponent),
      multi: true
    }
  ],
  templateUrl: './date-box.html',
  styleUrl: './date-box.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateBoxComponent implements ControlValueAccessor {
  /** Label for the date box */
  label = input<string>('');

  /** Size of the input */
  size = input<'sm' | 'md' | 'lg'>('md');

  /** Type of picker: date, time, or datetime */
  type = input<'date' | 'time' | 'datetime'>('date');

  /** Computed format string based on type */
  format = computed(() => {
    switch (this.type()) {
      case 'time': return 'HH:mm';
      case 'datetime': return 'dd/MM/yyyy HH:mm';
      default: return 'dd/MM/yyyy';
    }
  });

  /** Placeholder for the input */
  placeholder = input<string>('');

  /** Computed placeholder to use */
  activePlaceholder = computed(() => {
     if (this.placeholder()) return this.placeholder();
     return this.format();
  });

  /** Whether the popover is open */
  isOpen = signal(false);

  /** Internal control for handling text input */
  inputControl = new FormControl('');

  /** Current date value */
  dateValue = signal<Date | null>(null);

  /** Icons */
  readonly CalendarIcon = CalendarIcon;
  readonly ClockIcon = Clock;
  readonly XIcon = X;

  @ViewChild('container') container?: ElementRef;

  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };

  constructor() {
    effect(() => {
        // Trigger re-format when type changes
        const t = this.type(); // dependency
        const date = this.dateValue();
        if (date) {
            this.updateInputFormat(date);
        }
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.isOpen() && this.container && !this.container.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleCalendar(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.isOpen.update(v => !v);
  }

  onDateSelect(date: Date | null) {
    this.dateValue.set(date);
    const includeTime = this.type() !== 'date';
    
    if (this.type() === 'time') {
       this.inputControl.setValue(CalendarUtil.formatTime(date));
    } else {
       this.inputControl.setValue(CalendarUtil.formatDate(date, includeTime));
    }
    
    this.onChange(date);
    // Only auto-close if in simple date mode. 
    // For time/datetime, keep open to allow scrolling/adjusting.
    if (this.type() === 'date') { 
        this.isOpen.set(false);
    }
  }

  onInputBlur() {
    this.onTouched();
    const date = CalendarUtil.parseDate(this.inputControl.value);
    if (this.dateValue()?.getTime() !== date?.getTime()) {
      this.dateValue.set(date);
      this.onChange(date);
    }
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    let date: Date | null = null;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'string' && value) {
      date = new Date(value);
      if (isNaN(date.getTime())) date = null;
    }

    this.dateValue.set(date);
    this.updateInputFormat(date);
  }

  private updateInputFormat(date: Date | null) {
      const includeTime = this.type() !== 'date';
      let val = '';
      if (this.type() === 'time') {
          val = CalendarUtil.formatTime(date);
      } else {
          val = CalendarUtil.formatDate(date, includeTime);
      }
      // Only update if value matches mask format to avoid overwriting partial inputs during typing?
      // Actually here we are setting the FULL value from the DATE object, so it's the source of truth.
      this.inputControl.setValue(val, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.inputControl.disable();
    } else {
      this.inputControl.enable();
    }
  }
}
