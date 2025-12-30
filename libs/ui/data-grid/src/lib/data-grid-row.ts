import {
  Component,
  input
} from '@angular/core';
import { DataGridCellComponent } from './data-grid-cell';
import { ColumnConfig } from './data-grid.types';

/**
 * Component responsible for rendering a single row in the data grid.
 */
@Component({
  selector: '[dataGridRow]',
  standalone: true,
  imports: [DataGridCellComponent],
  template: `
    @for (column of columns(); track column.key) {
      <td dataGridCell
        [style.min-width]="numberToString(column.width || 'auto')"
        [style.max-width]="numberToString(column.width || 'auto')"
        [style.width]="numberToString(column.width || 'auto')"
        [style.text-align]="column.align || 'left'"
        class="data-grid-cell"
        [class]="getCellClass(column, row())"
        [row]="row()"
        [column]="column"
        [rowIndex]="rowIndex()"
        [loading]="loading()"
        [cellTemplate]="getCellTemplate(column)">
      </td>
    }
  `,
  styles: [`
    .data-grid-cell {
        padding: calc(var(--w-space-sm) / 2) var(--w-space-sm);
        border-bottom: 1px solid var(--c-border);
        color: var(--c-text);
        overflow: hidden;
        text-overflow: ellipsis;
        position: relative;
        height: var(--h-md, 36px);
        box-sizing: border-box;

        &.pinned-left {
            background-color: var(--c-surface);
            position: sticky;
            z-index: 4;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        }

        &.pinned-right {
            background-color: var(--c-surface);
            position: sticky;
            z-index: 4;
            box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        }
    }

    .dark .data-grid-cell {
      color: var(--c-text);
      border-bottom-color: var(--c-border);

      &.pinned-left,
      &.pinned-right {
        background-color: var(--c-bg);
      }
    }
  `]
})
export class DataGridRowComponent {
  /** The data object for this row. */
  row = input<any>();

  /** The columns to render in this row. */
  columns = input<ColumnConfig[]>([]);

  /** The index of this row in the dataset. */
  rowIndex = input<number>();

  /** Whether the row is in loading state. */
  loading = input<boolean>(false);

  /** Map of cell templates. */
  cellTemplatesMap = input<Map<string, any>>(new Map());

  getCellTemplate(column: ColumnConfig) {
    if (column.cellTemplate) {
      return this.cellTemplatesMap().get(column.cellTemplate) || null;
    }
    return this.cellTemplatesMap().get(column.key) || this.cellTemplatesMap().get('cell-' + column.key) || null;
  }

  getCellClass(column: ColumnConfig, row: any): string {
    if (!column.cellClass) return '';
    if (typeof column.cellClass === 'function') {
      return column.cellClass(row);
    }
    return column.cellClass;
  }

  // Helper because styles expect strings with units usually, but logic handles it
  protected numberToString = (value: string | number) => typeof value === 'number' ? value + 'px' : value;

  trackByKey = (_: number, col: ColumnConfig) => col.key;
}
