
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  input,
  model,
  output,
  signal
} from '@angular/core';
import { CalendarCell, CalendarEvent, CalendarLocale, CalendarViewType } from '../calendar.types';
import { CalendarUtil } from '../calendar.util';
import { ElementRef, ViewChildren, QueryList, AfterViewInit, effect } from '@angular/core';

const VI_LOCALE: CalendarLocale = {
  days: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  months: [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ],
  today: 'Hôm nay',
  clear: 'Xóa'
};

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[tabindex]': '0',
    'role': 'grid',
    '[attr.aria-label]': 'headerTitle()',
    '(mouseleave)': 'cellHover.emit(null)'
  }
})
export class CalendarComponent {
  /** The currently selected date (model for two-way binding) */
  value = model<Date | null>(null);

  /** Minimum selectable date */
  min = input<Date | null>(null);

  /** Maximum selectable date */
  max = input<Date | null>(null);

  /** Custom events to display on the calendar */
  events = input<CalendarEvent[]>([]);

  /** Range start date for range selection mode */
  rangeStart = input<Date | null>(null);

  /** Range end date for range selection mode */
  rangeEnd = input<Date | null>(null);

  /** Currently hovered date for range selection preview */
  rangeHover = input<Date | null>(null);

  /** Emitted when a cell is hovered */
  cellHover = output<Date | null>();

  /** Locale configuration for localization */
  locale = input<CalendarLocale>(VI_LOCALE);

  /** The current view type */
  viewType = signal<CalendarViewType>('month');

  /** The date being used to determine which month/year is shown (model for external sync) */
  viewDate = model<Date>(new Date());

  /** Whether to show the calendar header */
  showHeader = input<boolean>(true);

  /** Whether to show the calendar footer */
  showFooter = input<boolean>(true);

  /** Mode of the calendar: date only, time only, or both */
  mode = input<'date' | 'time' | 'datetime'>('date');

  /** Time options */
  hours = Array.from({ length: 24 }, (_, i) => i);
  minutes = Array.from({ length: 60 }, (_, i) => i);

  /** Names of the days of the week */
  weekDays = computed(() => this.locale().days);

  /** Month names */
  months = computed(() => this.locale().months);

  /** Computed grid for the month view */
  monthGrid = computed(() => {
    return CalendarUtil.generateMonthGrid(
      this.viewDate(),
      this.value(),
      this.rangeStart(),
      this.rangeEnd(),
      this.events(),
      this.rangeHover()
    );
  });

  /** Computed grid for the year view */
  yearGrid = computed(() => {
    return CalendarUtil.generateYearGrid(
      this.viewDate(),
      this.value(),
      this.months()
    );
  });

  /** Computed grid for the decade view (12 years) */
  decadeGrid = computed(() => {
    return CalendarUtil.generateDecadeGrid(
      this.viewDate(),
      this.value()
    );
  });

  /** Header title based on current view */
  headerTitle = computed(() => {
    const date = this.viewDate();
    const type = this.viewType();

    if (this.mode() === 'time') {
       return 'Select Time';
    }

    if (type === 'month') {
      return `${this.months()[date.getMonth()]} ${date.getFullYear()}`;
    } else if (type === 'year') {
      return `${date.getFullYear()}`;
    } else {
      const startYear = Math.floor(date.getFullYear() / 10) * 10;
      return `${startYear} - ${startYear + 9}`;
    }
  });

  get currentHour(): number {
    return this.value()?.getHours() || 0;
  }

  get currentMinute(): number {
    return this.value()?.getMinutes() || 0;
  }

  @ViewChildren('timeParams') timeParams!: QueryList<ElementRef>;
  
  constructor(private elementRef: ElementRef) {
    effect(() => {
        // When value changes, scroll to time if in time mode
        const val = this.value();
        if (val && (this.mode() === 'time' || this.mode() === 'datetime')) {
            // Small timeout to allow render
            setTimeout(() => this.scrollToTime(), 0);
        }
    });
  }

  scrollToTime() {
    const el = this.elementRef.nativeElement;
    const hoursEl = el.querySelector('.hours-column');
    const minutesEl = el.querySelector('.minutes-column');
    
    if (hoursEl) {
        const selectedHour = hoursEl.querySelector(`.time-item[data-value="${this.currentHour}"]`);
        if (selectedHour) {
            this.scrollToElement(hoursEl, selectedHour);
        }
    }
    
    if (minutesEl) {
        const selectedMinute = minutesEl.querySelector(`.time-item[data-value="${this.currentMinute}"]`);
        if (selectedMinute) {
             this.scrollToElement(minutesEl, selectedMinute);
        }
    }
  }

  private scrollToElement(container: HTMLElement, target: HTMLElement) {
      // Calculate position to center the target
      const containerHeight = container.clientHeight;
      const targetHeight = target.clientHeight;
      const targetTop = target.offsetTop;
      
      const scrollTop = targetTop - (containerHeight / 2) + (targetHeight / 2);
      
      container.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
      });
  }

  updateTime(type: 'hour' | 'minute', val: number) {
    const date = new Date(this.value() || new Date());
    if (!this.value()) {
         // If no date selected yet, start with today
         this.viewDate.set(date);
    }
    
    if (type === 'hour') date.setHours(val);
    else date.setMinutes(val);
    
    this.value.set(date);
    this.viewDate.set(date);
  }

  prev() {
    const type = this.viewType();
    const date = this.viewDate();
    if (type === 'month') {
      this.viewDate.set(CalendarUtil.addMonths(date, -1));
    } else if (type === 'year') {
      this.viewDate.set(CalendarUtil.addYears(date, -1));
    } else {
      this.viewDate.set(CalendarUtil.addYears(date, -10));
    }
  }

  next() {
    const type = this.viewType();
    const date = this.viewDate();
    if (type === 'month') {
      this.viewDate.set(CalendarUtil.addMonths(date, 1));
    } else if (type === 'year') {
      this.viewDate.set(CalendarUtil.addYears(date, 1));
    } else {
      this.viewDate.set(CalendarUtil.addYears(date, 10));
    }
  }

  toggleView() {
    const current = this.viewType();
    if (current === 'month') {
      this.viewType.set('year');
    } else if (current === 'year') {
      this.viewType.set('decade');
    }
  }

  selectCell(cell: CalendarCell) {
    const type = this.viewType();

    if (type === 'month') {
      this.value.set(cell.date);
      this.viewDate.set(cell.date);
    } else if (type === 'year') {
      this.viewDate.set(cell.date);
      this.viewType.set('month');
    } else if (type === 'decade') {
      this.viewDate.set(cell.date);
      this.viewType.set('year');
    }
  }

  selectToday() {
    const today = new Date();
    this.value.set(today);
    this.viewDate.set(today);
    this.viewType.set('month');
  }

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const date = new Date(this.viewDate());
    const type = this.viewType();

    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case 'ArrowLeft':
        if (type === 'month') date.setDate(date.getDate() - 1);
        else if (type === 'year') date.setMonth(date.getMonth() - 1);
        else date.setFullYear(date.getFullYear() - 1);
        this.viewDate.set(date);
        break;
      case 'ArrowRight':
        if (type === 'month') date.setDate(date.getDate() + 1);
        else if (type === 'year') date.setMonth(date.getMonth() + 1);
        else date.setFullYear(date.getFullYear() + 1);
        this.viewDate.set(date);
        break;
      case 'ArrowUp':
        if (type === 'month') date.setDate(date.getDate() - 7);
        else if (type === 'year') date.setMonth(date.getMonth() - 3);
        else date.setFullYear(date.getFullYear() - 3);
        this.viewDate.set(date);
        break;
      case 'ArrowDown':
        if (type === 'month') date.setDate(date.getDate() + 7);
        else if (type === 'year') date.setMonth(date.getMonth() + 3);
        else date.setFullYear(date.getFullYear() + 3);
        this.viewDate.set(date);
        break;
      case 'Enter':
        if (type === 'month') {
          this.value.set(new Date(this.viewDate()));
        } else {
          this.selectCell({ date: this.viewDate(), label: '' });
        }
        break;
      case 'Escape':
        if (type === 'year') this.viewType.set('month');
        else if (type === 'decade') this.viewType.set('year');
        break;
    }
  }
}
