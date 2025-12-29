
import { CalendarCell, CalendarEvent } from './calendar.types';

/**
 * Functional Core for Calendar Logic.
 * Contains only pure functions with no side effects.
 */
export class CalendarUtil {
    static isSameDate(d1: Date, d2: Date | null): boolean {
        if (!d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getDate() === d2.getDate();
    }

    static isSameMonth(d1: Date, d2: Date): boolean {
        return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
    }

    static getStartOfMonth(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    static addMonths(date: Date, months: number): Date {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }

    static addYears(date: Date, years: number): Date {
        const result = new Date(date);
        result.setFullYear(result.getFullYear() + years);
        return result;
    }

    /**
     * Core logic to generate a month grid with all relevant metadata.
     */
    static generateMonthGrid(
        viewDate: Date,
        selectedDate: Date | null,
        rangeStart: Date | null,
        rangeEnd: Date | null,
        events: CalendarEvent[] = [],
        rangeHover: Date | null = null
    ): CalendarCell[] {
        const startOfMonth = this.getStartOfMonth(viewDate);
        const startDay = startOfMonth.getDay();
        const startDate = new Date(startOfMonth);
        startDate.setDate(startDate.getDate() - startDay);

        const today = new Date();
        const grid: CalendarCell[] = [];

        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            const isStart = rangeStart ? this.isSameDate(date, rangeStart) : false;
            const isEnd = rangeEnd ? this.isSameDate(date, rangeEnd) : false;
            
            let inRange = false;
            if (rangeStart && rangeEnd) {
                inRange = date > rangeStart && date < rangeEnd;
            } else if (rangeStart && rangeHover) {
                const start = rangeStart < rangeHover ? rangeStart : rangeHover;
                const end = rangeStart < rangeHover ? rangeHover : rangeStart;
                inRange = date > start && date < end;
            }

            grid.push({
                date,
                label: date.getDate().toString(),
                isCurrentMonth: this.isSameMonth(date, viewDate),
                isToday: this.isSameDate(date, today),
                isSelected: this.isSameDate(date, selectedDate) || isStart || isEnd,
                isOtherView: !this.isSameMonth(date, viewDate),
                events: events.filter(e => this.isSameDate(e.date, date)),
                isRangeStart: isStart,
                isRangeEnd: isEnd,
                isInRange: inRange
            });
            startDate.setDate(startDate.getDate() + 1);
        }
        return grid;
    }

    /**
     * Generates a 12-month grid for a specific year.
     */
    static generateYearGrid(viewDate: Date, selectedDate: Date | null, months: string[]): CalendarCell[] {
        const year = viewDate.getFullYear();
        const today = new Date();

        return months.map((month, index) => {
            const date = new Date(year, index, 1);
            return {
                date,
                label: month.substring(0, 3),
                isSelected: selectedDate ? (selectedDate.getFullYear() === year && selectedDate.getMonth() === index) : false,
                isToday: today.getFullYear() === year && today.getMonth() === index,
            };
        });
    }

    /**
     * Generates a 12-year grid for a decade.
     */
    static generateDecadeGrid(viewDate: Date, selectedDate: Date | null): CalendarCell[] {
        const currentYear = viewDate.getFullYear();
        const startYear = Math.floor(currentYear / 10) * 10 - 1;
        const today = new Date();

        return Array.from({ length: 12 }, (_, i) => {
            const year = startYear + i;
            const date = new Date(year, 0, 1);
            return {
                date,
                label: year.toString(),
                isSelected: selectedDate?.getFullYear() === year,
                isToday: today.getFullYear() === year,
                isOtherView: i === 0 || i === 11
            };
        });
    }

    /**
     * Formats a date to dd/MM/yyyy string.
     */
    static formatDate(date: Date | null, includeTime = false): string {
        if (!date) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        if (includeTime) {
             const hours = date.getHours().toString().padStart(2, '0');
             const minutes = date.getMinutes().toString().padStart(2, '0');
             return `${day}/${month}/${year} ${hours}:${minutes}`;
        }
        return `${day}/${month}/${year}`;
    }

    /**
     * Parses a dd/MM/yyyy string into a Date object.
     */
    static parseDate(value: string | null): Date | null {
        if (!value || value.includes('_')) return null;

        // Split date and time (if present)
        const [datePart, timePart] = value.split(' ');
        const parts = datePart ? datePart.split('/') : [];
        
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const date = new Date(year, month, day);

            if (timePart) {
                const [hours, minutes] = timePart.split(':').map(Number);
                if (!isNaN(hours)) date.setHours(hours);
                if (!isNaN(minutes)) date.setMinutes(minutes);
            }

            return !isNaN(date.getTime()) ? date : null;
        }
        return null;
    }

    static formatTime(date: Date | null): string {
        if (!date) return '';
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
}
