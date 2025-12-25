import {
  Component,
  input,
  Output,
  EventEmitter,
  forwardRef,
  signal,
  computed,
  effect,
  viewChild,
  ElementRef,
  OnDestroy,
  OnInit,
  booleanAttribute,
  numberAttribute,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OverlayModule, ConnectedPosition, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { LucideAngularModule, ChevronDown, Search, X } from 'lucide-angular';
import { DataSource, DataSourceOptions } from '@angular-starter/core/data-source';
import { ItemTemplateDirective, FieldTemplateDirective } from './select-box-templates';
import { contentChildren } from '@angular/core';

@Component({
  selector: 'app-select-box',
  standalone: true,
  imports: [CommonModule, FormsModule, OverlayModule, ScrollingModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectBoxComponent),
      multi: true,
    },
  ],
  templateUrl: './select-box.html',
  styleUrl: './select-box.css',
})
export class SelectBoxComponent implements ControlValueAccessor, OnInit, OnDestroy {
  // Inputs
  dataSourceInput = input<DataSourceOptions<any>>([]);
  displayExpr = input<string>('');
  valueExpr = input<string>('id');
  placeholder = input('Select item...');
  searchEnabled = input(false, { transform: booleanAttribute });
  searchPlaceholder = input('Search...');
  clearable = input(false, { transform: booleanAttribute });
  minSearchLength = input(0, { transform: numberAttribute });
  searchExpr = input<string | string[]>('');
  dropDownWidth = input<string | number>('auto');
  closeOnScroll = input(false, { transform: booleanAttribute });

  // Templates
  itemTemplates = contentChildren(ItemTemplateDirective);
  fieldTemplates = contentChildren(FieldTemplateDirective);

  itemTemplate = computed(() => this.itemTemplates()[0]?.template);
  fieldTemplate = computed(() => this.fieldTemplates()[0]?.template);

  // Icons
  readonly ChevronDownIcon = ChevronDown;
  readonly SearchIcon = Search;
  readonly XIcon = X;

  // Internal State
  private ds?: DataSource<any>;
  items = signal<any[]>([]);
  loading = signal(false);
  isOpen = signal(false);
  disabled = signal(false);
  searchValue = signal('');
  focusedIndex = signal(-1);
  selectedItem = signal<any>(null);
  
  overlayWidth: string | number = 'auto';
  viewportHeight = 200;

  // View Childs
  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  viewport = viewChild(CdkVirtualScrollViewport);
  triggerContainer = viewChild<ElementRef<HTMLElement>>('triggerContainer');

  // Scroll strategy for overlay
  scrollStrategy = computed(() => {
    return this.closeOnScroll() ? this.sso.close() : this.sso.reposition();
  });

  // Overlay Positions
  overlayPositions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
    }
  ];

  // ControlValueAccessor
  private onChange: any = () => {};
  private onTouched: any = () => {};
  private _value: any = null;

  constructor(private el: ElementRef, private sso: ScrollStrategyOptions) {
    // Effect to initialize data source when input changes
    effect(() => {
      const options = this.dataSourceInput();
      this.ds = new DataSource(options);
      if (this.searchExpr()) {
        this.ds.searchExpr(this.searchExpr() || this.displayExpr());
      } else if (this.displayExpr()) {
        this.ds.searchExpr(this.displayExpr());
      }
      this.loadData();
    }, { allowSignalWrites: true });

    // Focus search input when dropdown opens
    effect(() => {
      if (this.isOpen() && this.searchEnabled()) {
        setTimeout(() => {
          this.searchInput()?.nativeElement.focus();
        }, 0);
      }
    });
  }

  ngOnInit() {
    this.updateOverlayWidth();
    window.addEventListener('resize', this.updateOverlayWidth);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateOverlayWidth);
  }

  private updateOverlayWidth = () => {
    const width = this.dropDownWidth();
    if (width === 'auto') {
      const container = this.triggerContainer()?.nativeElement;
      if (container) {
        this.overlayWidth = container.offsetWidth;
      } else {
        this.overlayWidth = this.el.nativeElement.offsetWidth;
      }
    } else {
      this.overlayWidth = width;
    }
  };

  async loadData() {
    if (!this.ds) return;
    this.loading.set(true);
    try {
      const data = await this.ds.load();
      this.items.set(data);
      this.updateSelectedItem();
    } finally {
      this.loading.set(false);
    }
  }

  toggleDropdown() {
    if (this.disabled()) return;
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.focusedIndex.set(-1);
      this.updateOverlayWidth();
    }
  }

  closeDropdown() {
    this.isOpen.set(false);
  }

  selectItem(item: any) {
    const value = this.getItemValue(item);
    this._value = value;
    this.selectedItem.set(item);
    this.onChange(value);
    this.onTouched();
    this.closeDropdown();
  }

  clearValue(event: MouseEvent) {
    event.stopPropagation();
    this._value = null;
    this.selectedItem.set(null);
    this.onChange(null);
    this.onTouched();
  }

  getDisplayText(item: any): string {
    if (!item) return '';
    const expr = this.displayExpr();
    if (!expr) return String(item);
    return item[expr];
  }

  getItemValue(item: any): any {
    if (!item) return null;
    const expr = this.valueExpr();
    if (!expr) return item;
    return item[expr];
  }

  isSelected(item: any): boolean {
    return this.getItemValue(item) === this._value;
  }

  trackById = (index: number, item: any) => {
    return this.getItemValue(item) ?? index;
  };

  // Searching logic
  private searchTimeout?: any;
  handleSearch(event: any) {
    const val = event.target.value;
    this.searchValue.set(val);

    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      if (val === '' || val.length >= this.minSearchLength()) {
        this.ds?.searchValue(val);
        this.loadData();
      }
    }, 300);
  }

  // Keyboard navigation
  handleKeydown(event: KeyboardEvent) {
    const items = this.items();
    if (items.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusedIndex.update(i => {
           const next = i < items.length - 1 ? i + 1 : i;
           this.scrollToFocused(next);
           return next;
        });
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedIndex.update(i => {
           const next = i > 0 ? i - 1 : i;
           this.scrollToFocused(next);
           return next;
        });
        break;
      case 'Enter':
        event.preventDefault();
        if (this.focusedIndex() >= 0) {
          this.selectItem(items[this.focusedIndex()]);
        }
        break;
      case 'Escape':
        this.closeDropdown();
        break;
    }
  }

  handleSearchKeydown(event: KeyboardEvent) {
     if (['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) {
       this.handleKeydown(event);
     }
  }

  private scrollToFocused(index: number) {
    if (index >= 0) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        this.viewport()?.scrollToIndex(index, 'smooth');
      });
    }
  }

  // Virtual Scroll / Load on demand
  onScrollIndexChange(index: number) {
    // Basic load more implementation if ds supports it
    const items = this.items();
    if (index > items.length - 10 && !this.loading() && items.length < (this.ds?.totalCount || 0)) {
       this.loadMore();
    }
  }

  async loadMore() {
    if (!this.ds) return;
    this.loading.set(true);
    try {
      await this.ds.loadMore();
      this.items.set([...this.ds.items]);
    } finally {
      this.loading.set(false);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this._value = value;
    this.updateSelectedItem();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  private updateSelectedItem() {
    const items = this.items();
    if (items.length > 0 && this._value !== null) {
      const found = items.find(item => this.getItemValue(item) === this._value);
      if (found) {
        this.selectedItem.set(found);
      } else if (this.ds) {
         // If not found in current items, we might need a byKey call if CustomStore
      }
    } else if (this._value === null) {
      this.selectedItem.set(null);
    }
  }
}
