import {
  AfterViewInit,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  input,
  OnDestroy,
  output,
  signal,
  viewChild
} from '@angular/core';
import { DataGridBodyComponent } from './data-grid-body';
import { CellTemplateDirective } from './data-grid-cell-template';
import { DataGridHeaderComponent } from './data-grid-header';
import { ColumnConfig } from './data-grid.types';

/**
 * A highly customizable, performant Data Grid component for Angular.
 * Supports column pinning, nested headers, custom templates, and dynamic row heights.
 *
 * @example
 * <app-data-grid
 *   [data]="users"
 *   [columns]="columns"
 *   rowKey="id"
 *   height="500px">
 *   <ng-template cellTemplate="status" let-value="value">
 *     <span class="badge">{{ value }}</span>
 *   </ng-template>
 * </app-data-grid>
 */
@Component({
  selector: 'app-data-grid',
  standalone: true,
  imports: [DataGridHeaderComponent, DataGridBodyComponent],
  template: `
    <div class="data-grid" [style.height]="height()" #dataGrid>
      <div class="data-grid-container">
        <div class="data-grid-table-wrapper">

          @if (leftPinnedColumns().length > 0) {
            <table class="data-grid-table data-grid-table-left box-shadow-right" [class.loading]="loading()">
              <thead dataGridHeader class="data-grid-header"
                     [columns]="leftHeaderColumns()"
                     [maxHeaderDepth]="maxHeaderDepth()"
                     (columnPinChange)="handleColumnPinChange($event)">
              </thead>

              <tbody dataGridBody class="data-grid-body"
                     [data]="data()"
                     [columns]="leftPinnedColumns()"
                     [rowKey]="rowKey()"
                     [loading]="loading()"
                     [skeletonRows]="skeletonRows()"
                     [cellTemplatesMap]="cellTemplateMap()">
              </tbody>
            </table>
          }

          @if (regularColumns().length > 0) {
            <table class="data-grid-table data-grid-table-regular" [class.loading]="loading()">
              <thead dataGridHeader class="data-grid-header"
                     [columns]="regularHeaderColumns()"
                     [maxHeaderDepth]="maxHeaderDepth()"
                     (columnPinChange)="handleColumnPinChange($event)">
              </thead>

              <tbody dataGridBody class="data-grid-body"
                     [data]="data()"
                     [columns]="regularColumns()"
                     [rowKey]="rowKey()"
                     [loading]="loading()"
                     [skeletonRows]="skeletonRows()"
                     [cellTemplatesMap]="cellTemplateMap()">
              </tbody>
            </table>
          }

          @if (rightPinnedColumns().length > 0) {
            <table class="data-grid-table data-grid-table-right box-shadow-left" [class.loading]="loading()">
              <thead dataGridHeader class="data-grid-header"
                     [columns]="rightHeaderColumns()"
                     [maxHeaderDepth]="maxHeaderDepth()"
                     (columnPinChange)="handleColumnPinChange($event)">
              </thead>

              <tbody dataGridBody class="data-grid-body"
                     [data]="data()"
                     [columns]="rightPinnedColumns()"
                     [rowKey]="rowKey()"
                     [loading]="loading()"
                     [skeletonRows]="skeletonRows()"
                     [cellTemplatesMap]="cellTemplateMap()">
              </tbody>
            </table>
          }

        </div>
      </div>
    </div>
  `,
  styles: [`
    .data-grid {
      width: 100%;
      border: 1px solid var(--c-border);
      border-radius: var(--w-radius);
      overflow: hidden;
      background-color: var(--c-surface);

      .data-grid-container {
        width: 100%;
        height: 100%;
        overflow: auto;
        position: relative;
      }

      .data-grid-table-wrapper {
        position: relative;
        width: 100%;
        min-width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
      }

      .data-grid-table {
        border-collapse: separate;
        border-spacing: 0;
        table-layout: fixed;

        &.loading {
          min-height: 100%;
        }

        &.data-grid-table-left {
          position: sticky;
          left: 0;
          z-index: 15;
          background-color: var(--c-surface);
        }

        &.data-grid-table-regular {
          flex: 1;
        }

        &.data-grid-table-right {
          position: sticky;
          right: 0;
          z-index: 15;
          background-color: var(--c-surface);
        }
      }
    }

    .dark .data-grid {
      background-color: var(--c-surface);

      .data-grid-table-left,
      .data-grid-table-right {
        background-color: var(--c-surface);
      }
    }

    .data-grid-header {
      position: sticky;
      top: 0;
      z-index: 10;
      background-color: var(--c-surface);
      /* Ensure header is above body cells especially when scrolled */
    }

    .dark .data-grid-header {
      background-color: var(--c-surface);
    }
  `]
})
export class DataGridComponent implements AfterViewInit, OnDestroy {
  dataGrid = viewChild<ElementRef>('dataGrid');
  private resizeObserver?: ResizeObserver;

  /** The data to receive and display in the grid. */
  data = input<any[]>([]);

  /** Configuration for the columns. */
  columns = input<ColumnConfig[]>([]);

  /** Height of the grid container (CSS string). Default `400px`. */
  height = input<string>('400px');

  /** Whether the grid is in loading state. */
  loading = input<boolean>(false);

  /** Number of skeleton rows to show when loading. Default `20`. */
  skeletonRows = input<number>(20);

  /** Unique property name in data to serve as row key (e.g., 'id'). Default `id`. */
  rowKey = input<string>('id');

  /** Optional callback to override internal strict pin handling if needed. */
  onColumnPinChange =
    input<(key: string, state: 'left' | 'right' | undefined) => void>();

  /** Emits when a column is pinned/unpinned. */
  columnPinChange = output<{
    columnKey: string;
    newPinState: 'left' | 'right' | undefined;
  }>();

  /** Content children to capture custom cell templates. */
  cellTemplates = contentChildren(CellTemplateDirective);

  /** Map of cell template name -> TemplateRef. */
  cellTemplateMap = computed(() => {
    const map = new Map<string, any>();
    this.cellTemplates().forEach(slot => {
      map.set(slot.name, slot.template);
    });
    return map;
  });

  /** Internal copy of columns to handle local state (like pinning). */
  internalColumns = signal<ColumnConfig[]>([]);

  constructor() {
    effect(() => {
      this.internalColumns.set([...this.columns()]);
      // Sync rows when columns change (might affect text wrapping)
      setTimeout(() => this.syncRowHeights(), 0);
    });

    effect(() => {
      // Sync rows when data or loading changes
      this.data();
      this.loading();
      setTimeout(() => this.syncRowHeights(), 0);
    });
  }

  ngAfterViewInit() {
    this.syncRowHeights();
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  /**
   * Sets up a ResizeObserver to re-sync row heights when the container size changes.
   * This is crucial for responsive wrapping text.
   */
  private setupResizeObserver() {
    const dataGridEl = this.dataGrid()?.nativeElement;
    if (!dataGridEl) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.syncRowHeights();
    });

    // Observe the container to detect width changes that cause reflow/wrapping
    const container = dataGridEl.querySelector('.data-grid-container');
    if (container) {
      this.resizeObserver.observe(container);
    }
  }

  /**
   * Synchronizes row heights across the 3 tables (Left, Regular, Right).
   * Finds the maximum height for each row index and applies it to all corresponding TRs.
   */
  private syncRowHeights() {
    const dataGridEl = this.dataGrid()?.nativeElement;
    if (!dataGridEl) return;

    // We query both the body rows AND the header rows to ensure alignment everywhere
    // For now, let's focus on body rows as headers are usually single-line or fixed height
    // But if we want robust header sync, we might need logic there too.
    // The current logic handles body rows.

    const leftRows = dataGridEl.querySelectorAll('.data-grid-table-left .data-grid-body .data-grid-row');
    const regularRows = dataGridEl.querySelectorAll('.data-grid-table-regular .data-grid-body .data-grid-row');
    const rightRows = dataGridEl.querySelectorAll('.data-grid-table-right .data-grid-body .data-grid-row');

    const rowCount = Math.max(leftRows.length, regularRows.length, rightRows.length);

    // Use requestAnimationFrame to ensure we are not thrashing layout too much
    requestAnimationFrame(() => {
      for (let i = 0; i < rowCount; i++) {
        const leftRow = leftRows[i] as HTMLElement;
        const regularRow = regularRows[i] as HTMLElement;
        const rightRow = rightRows[i] as HTMLElement;

        // Reset heights first to allow natural sizing (compacting if content shrank)
        if (leftRow) leftRow.style.height = '';
        if (regularRow) regularRow.style.height = '';
        if (rightRow) rightRow.style.height = '';

        // Read natural heights
        const heights = [
          leftRow?.offsetHeight || 0,
          regularRow?.offsetHeight || 0,
          rightRow?.offsetHeight || 0
        ];

        const maxHeight = Math.max(...heights);

        // Apply max height
        if (maxHeight > 0) {
          if (leftRow) leftRow.style.height = `${maxHeight}px`;
          if (regularRow) regularRow.style.height = `${maxHeight}px`;
          if (rightRow) rightRow.style.height = `${maxHeight}px`;
        }
      }
    });
  }

  private flattenColumns(cols: ColumnConfig[]): ColumnConfig[] {
    const result: ColumnConfig[] = [];
    const walk = (columns: ColumnConfig[], parentPinned?: 'left' | 'right') => {
      columns.forEach(col => {
        if (col.children?.length) {
          const effectivePinned = col.pinned || parentPinned;
          walk(col.children, effectivePinned);
        } else {
          const effectivePinned = col.pinned || parentPinned;
          result.push({ ...col, pinned: effectivePinned });
        }
      });
    };
    walk(cols);
    return result;
  }

  flattenedColumns = computed(() =>
    this.flattenColumns(this.internalColumns())
  );

  leftPinnedColumns = computed(() =>
    this.flattenedColumns().filter(c => c.pinned === 'left')
  );

  regularColumns = computed(() =>
    this.flattenedColumns().filter(c => !c.pinned)
  );

  rightPinnedColumns = computed(() =>
    this.flattenedColumns().filter(c => c.pinned === 'right')
  );

  leftHeaderColumns = computed(() =>
    this.filterColumnsByPinned(this.internalColumns(), 'left')
  );

  regularHeaderColumns = computed(() =>
    this.filterColumnsByPinned(this.internalColumns(), null)
  );

  rightHeaderColumns = computed(() =>
    this.filterColumnsByPinned(this.internalColumns(), 'right')
  );


  maxHeaderDepth = computed(() => {
    const getMaxDepth = (cols: ColumnConfig[], currentDepth = 1): number => {
      if (!cols || cols.length === 0) return currentDepth - 1;

      let maxDepth = currentDepth;
      for (const col of cols) {
        if (col.children?.length) {
          const childDepth = getMaxDepth(col.children, currentDepth + 1);
          maxDepth = Math.max(maxDepth, childDepth);
        }
      }
      return maxDepth;
    };

    return getMaxDepth(this.internalColumns());
  });


  /*
  private findColumnByKey(
    columns: ColumnConfig[],
    key: string
  ): ColumnConfig | null {
    for (const col of columns) {
      if (col.key === key) return col;
      if (col.children?.length) {
        const found = this.findColumnByKey(col.children, key);
        if (found) return found;
      }
    }
    return null;
  }
  */

  private filterColumnsByPinned(
    columns: ColumnConfig[],
    pinned: 'left' | 'right' | null
  ): ColumnConfig[] {
    return columns
      .map(col => {
        if (col.children?.length) {
          const effectivePinned = col.pinned;

          const filteredChildren = this.filterColumnsByPinned(
            col.children,
            pinned
          );

          if (filteredChildren.length > 0) {
            return { ...col, children: filteredChildren };
          }

          if (pinned === null) {
            return effectivePinned ? null : col;
          }
          return effectivePinned === pinned ? col : null;
        }

        if (pinned === null) {
          return col.pinned ? null : col;
        }

        return col.pinned === pinned ? col : null;
      })
      .filter(Boolean) as ColumnConfig[];
  }


  handleColumnPinChange(event: {
    columnKey: string;
    newPinState: 'left' | 'right' | undefined;
  }) {
    // Update internal state directly
    this.internalColumns.update(cols => {
      const newCols = [...cols];

      const updateRecursive = (configCols: ColumnConfig[]): boolean => {
        for (const col of configCols) {
          if (col.key === event.columnKey) {
            const setPinned = (c: ColumnConfig, state: 'left' | 'right' | undefined) => {
              c.pinned = state;
              if (c.children?.length) {
                c.children.forEach(child => setPinned(child, state));
              }
            }
            setPinned(col, event.newPinState);
            return true;
          }

          if (col.children?.length) {
            if (updateRecursive(col.children)) return true;
          }
        }
        return false;
      };

      updateRecursive(newCols);
      return newCols;
    });

    // Still emit event in case parent wants to listen (e.g. to save preference)
    this.columnPinChange.emit(event);

    // Call functional input if provided
    const cb = this.onColumnPinChange();
    if (cb) cb(event.columnKey, event.newPinState);
  }
}
