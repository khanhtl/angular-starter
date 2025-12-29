import { CalendarComponent, CalendarUtil } from '@angular-starter/ui/calendar';
import { AppDateInputDirective } from '@angular-starter/ui/input';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  HostListener,
  input,
  signal,
  ViewChild
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import { Calendar as CalendarIcon, LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-date-range',
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
      useExisting: forwardRef(() => DateRangeComponent),
      multi: true
    }
  ],
  templateUrl: './date-range.html',
  styleUrl: './date-range.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateRangeComponent implements ControlValueAccessor {
  /** Label for the date range picker */
  label = input<string>('');

  /** Placeholder for start date */
  startPlaceholder = input<string>('Từ ngày');

  /** Placeholder for end date */
  endPlaceholder = input<string>('Đến ngày');

  /** Whether the popover is open */
  isOpen = signal(false);

  /** Internal controls for text input */
  startControl = new FormControl('');
  endControl = new FormControl('');

  /** Current date range values */
  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);

  /** Hovered date for range preview */
  hoverDate = signal<Date | null>(null);

  /** The months currently being viewed in the two calendars */
  leftViewDate = signal<Date>(new Date());
  rightViewDate = computed(() => CalendarUtil.addMonths(this.leftViewDate(), 1));

  /** Icons */
  readonly CalendarIcon = CalendarIcon;
  readonly XIcon = X;
  readonly months = signal([
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ]);

  @ViewChild('container') container?: ElementRef;

  private onChange: (value: [Date | null, Date | null]) => void = () => { };
  private onTouched: () => void = () => { };

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (this.isOpen() && this.container && !this.container.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggleCalendar(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.isOpen.update(v => !v);

    // Reset view to start date if exists
    if (this.isOpen() && this.startDate()) {
      this.leftViewDate.set(new Date(this.startDate()!));
    }
  }

  onDateSelect(date: Date) {
    const start = this.startDate();
    const end = this.endDate();

    if (!start || (start && end)) {
      this.startDate.set(date);
      this.endDate.set(null);
      this.startControl.setValue(CalendarUtil.formatDate(date));
      this.endControl.setValue('');
    } else {
      if (date < start) {
        this.endDate.set(start);
        this.startDate.set(date);
        this.startControl.setValue(CalendarUtil.formatDate(date));
        this.endControl.setValue(CalendarUtil.formatDate(start));
      } else {
        this.endDate.set(date);
        this.endControl.setValue(CalendarUtil.formatDate(date));
      }
      this.hoverDate.set(null);
      this.emitValue();
    }
  }

  onHover(date: Date | null) {
    if (this.startDate() && !this.endDate()) {
      this.hoverDate.set(date);
    } else {
      this.hoverDate.set(null);
    }
  }

  clearValue(event: MouseEvent) {
    event.stopPropagation();
    this.startDate.set(null);
    this.endDate.set(null);
    this.startControl.setValue('');
    this.endControl.setValue('');
    this.emitValue();
  }

  prevMonth() {
    this.leftViewDate.set(CalendarUtil.addMonths(this.leftViewDate(), -1));
  }

  nextMonth() {
    this.leftViewDate.set(CalendarUtil.addMonths(this.leftViewDate(), 1));
  }

  onInputBlur() {
    this.onTouched();
    const start = CalendarUtil.parseDate(this.startControl.value);
    const end = CalendarUtil.parseDate(this.endControl.value);

    if (this.startDate()?.getTime() !== start?.getTime() ||
      this.endDate()?.getTime() !== end?.getTime()) {
      this.startDate.set(start);
      this.endDate.set(end);
      this.emitValue();
    }
  }

  private emitValue() {
    this.onChange([this.startDate(), this.endDate()]);
  }

  // ControlValueAccessor methods
  writeValue(value: [Date | null, Date | null] | any): void {
    const [start, end] = Array.isArray(value) ? value : [null, null];
    this.startDate.set(start);
    this.endDate.set(end);
    this.startControl.setValue(CalendarUtil.formatDate(start));
    this.endControl.setValue(CalendarUtil.formatDate(end));
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.startControl.disable();
      this.endControl.disable();
    } else {
      this.startControl.enable();
      this.endControl.enable();
    }
  }
}
