import { CommonModule } from '@angular/common';
import { Component, TemplateRef, input } from '@angular/core';
import { ColumnConfig } from './data-grid.types';

/**
 * Component responsible for rendering the content of a single cell.
 * Supports custom templates via `cellTemplate`.
 */
@Component({
  selector: '[dataGridCell]',
  imports: [CommonModule],
  standalone: true,
  template: `
    @if (loading()) {
      <div class="skeleton-wrapper">
        <div class="skeleton"></div>
      </div>
    } @else {
      <ng-container *ngIf="cellTemplate(); else default">
        <ng-container
          [ngTemplateOutlet]="cellTemplate()"
          [ngTemplateOutletContext]="{
            row: row(),
            value: row()[column().key],
            column: column(),
            rowIndex: rowIndex()
          }"
        />
      </ng-container>

      <ng-template #default>
        {{ row()[column().key] }}
      </ng-template>
    }
  `,
  styles: [`
    .data-grid-cell {
      padding: calc(var(--w-space-sm) / 2) var(--w-space-sm);
      border-bottom: 1px solid var(--c-border);
      color: var(--c-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      position: relative;

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

    .skeleton-wrapper {
        display: flex;
        align-items: center;
        width: 100%;
        height: 100%;
        min-height: 20px;
    }

    .skeleton {
        width: 100%;
        height: 16px;
        border-radius: 4px;
        background: linear-gradient(90deg, 
            rgba(0, 0, 0, 0.1) 25%, 
            rgba(0, 0, 0, 0.2) 50%, 
            rgba(0, 0, 0, 0.1) 75%
        );
        background-size: 200% 100%;
        animation: skeleton-loading 1.5s infinite linear;
    }

    .dark .skeleton {
        background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0.1) 25%, 
            rgba(255, 255, 255, 0.2) 50%, 
            rgba(255, 255, 255, 0.1) 75%
        );
    }

    @keyframes skeleton-loading {
        0% {
            background-position: 200% 0;
        }
        100% {
            background-position: -200% 0;
        }
    }
  `]
})
export class DataGridCellComponent {
  /** The data object for the row this cell belongs to. */
  row = input.required<any>();

  /** The configuration for the column this cell belongs to. */
  column = input.required<ColumnConfig>();

  /** The index of the row. */
  rowIndex = input<number>();

  /** Whether the cell is in loading state. */
  loading = input<boolean>(false);

  /** 
   * Custom template to render for this cell. 
   * If provided, overrides default text rendering. 
   */
  cellTemplate = input<TemplateRef<any> | null>(null);
}
