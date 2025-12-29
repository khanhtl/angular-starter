import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LucideAngularModule,
} from 'lucide-angular';
import {
  calculateDisplayRange,
  calculateTotalPages,
  calculateVisiblePages,
} from './pagination-core';

export interface PageChangeEvent {
  pageIndex: number;
  pageSize: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class PaginationComponent {
  /** Total number of items across all pages */
  totalCount = input(0, { transform: numberAttribute });

  /** Number of items per page */
  pageSize = input(10, { transform: numberAttribute });

  /** Current page index (1-based) */
  pageIndex = input(1, { transform: numberAttribute });

  /** Available page size options */
  pageSizes = input<number[]>([5, 10, 20, 50, 100]);

  /** Whether to show the page size selector dropdown */
  showPageSizeSelector = input(false, { transform: booleanAttribute });

  /** Whether to show info text (e.g., "Showing 1-10 of 100") */
  showInfo = input(false, { transform: booleanAttribute });

  /** Whether to show navigation buttons (First, Previous, Next, Last) */
  showNavigationButtons = input(true, { transform: booleanAttribute });

  /** Maximum number of page buttons to show (excluding first/last and ellipses) */
  visiblePages = input(5, { transform: numberAttribute });

  /** Emitted when the page or page size changes */
  pageChange = output<PageChangeEvent>();

  // Icons
  readonly ChevronsLeftIcon = ChevronsLeft;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly ChevronsRightIcon = ChevronsRight;

  // Computed properties
  totalPages = computed(() => calculateTotalPages(this.totalCount(), this.pageSize()));

  pages = computed(() =>
    calculateVisiblePages({
      totalCount: this.totalCount(),
      pageSize: this.pageSize(),
      pageIndex: this.pageIndex(),
      visiblePages: this.visiblePages(),
    })
  );

  displayRange = computed(() =>
    calculateDisplayRange(this.pageIndex(), this.pageSize(), this.totalCount())
  );

  canGoPrev = computed(() => this.pageIndex() > 1);
  canGoNext = computed(() => this.pageIndex() < this.totalPages());

  // Actions
  goToPage(index: number | string) {
    if (typeof index === 'string' || index < 1 || index > this.totalPages() || index === this.pageIndex()) {
      return;
    }
    this.pageChange.emit({ pageIndex: index, pageSize: this.pageSize() });
  }

  nextPage() {
    if (this.canGoNext()) {
      this.goToPage(this.pageIndex() + 1);
    }
  }

  prevPage() {
    if (this.canGoPrev()) {
      this.goToPage(this.pageIndex() - 1);
    }
  }

  firstPage() {
    this.goToPage(1);
  }

  lastPage() {
    this.goToPage(this.totalPages());
  }

  onPageSizeChange(event: Event) {
    const size = +(event.target as HTMLSelectElement).value;
    this.pageChange.emit({ pageIndex: 1, pageSize: size });
  }
}
