import { DataSource, DataSourceOptions } from '@angular-starter/core/data-source';
import { BaseControl } from '@angular-starter/core/forms';
import { ConnectedPosition, OverlayModule, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  forwardRef,
  input,
  numberAttribute,
  OnDestroy,
  OnInit,
  signal,
  viewChild
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ChevronDown, LucideAngularModule, Search, X } from 'lucide-angular';
import { FieldTemplateDirective, GroupTemplateDirective, ItemTemplateDirective } from './select-box-templates';

/**
 * Represents a group of items
 */
export interface ItemGroup {
  /** Group key/name */
  key: string;
  /** Items in this group */
  items: any[];
  /** Whether the group is expanded */
  expanded: boolean;
}

@Component({
  selector: 'app-select-box',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OverlayModule, ScrollingModule, LucideAngularModule],
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
export class SelectBoxComponent extends BaseControl<any> implements OnInit, OnDestroy {
  // Inputs
  placeholder = input('Select item...');

  dataSourceInput = input<DataSourceOptions<any>>([], { alias: 'dataSource' });
  displayExpr = input<string>('');
  valueExpr = input<string>('id');
  searchEnabled = input(false, { transform: booleanAttribute });
  searchPlaceholder = input('Search...');
  clearableInput = input(false, { transform: booleanAttribute, alias: 'clearable' });
  minSearchLength = input(0, { transform: numberAttribute });
  searchExpr = input<string | string[]>('');
  dropDownWidth = input<string | number>('auto');
  closeOnScroll = input(false, { transform: booleanAttribute });
  groupExpr = input<string>('');
  groupsCollapsed = input(false, { transform: booleanAttribute });

  // Templates
  itemTemplates = contentChildren(ItemTemplateDirective);
  fieldTemplates = contentChildren(FieldTemplateDirective);
  groupTemplates = contentChildren(GroupTemplateDirective);

  itemTemplate = computed(() => this.itemTemplates()[0]?.template);
  fieldTemplate = computed(() => this.fieldTemplates()[0]?.template);
  groupTemplate = computed(() => this.groupTemplates()[0]?.template);

  // Icons
  readonly ChevronDownIcon = ChevronDown;
  readonly SearchIcon = Search;
  readonly XIcon = X;

  // Internal State
  private ds?: DataSource<any>;
  items = signal<any[]>([]);
  loading = signal(false);
  isOpen = signal(false);
  searchValue = signal('');
  focusedIndex = signal(-1);
  selectedItem = signal<any>(null);
  groupExpandedState = signal<Record<string, boolean>>({});

  overlayWidth: string | number = 'auto';
  viewportHeight = 200;

  // View Childs
  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  viewport = viewChild(CdkVirtualScrollViewport);
  triggerContainer = viewChild<ElementRef<HTMLElement>>('triggerContainer');

  // Computed Values
  /** Items grouped by groupExpr */
  groupedItems = computed(() => {
    const expr = this.groupExpr();
    const items = this.items();
    const expandedState = this.groupExpandedState();

    if (!expr) {
      return null;
    }

    const groups: Map<string, any[]> = new Map();

    for (const item of items) {
      const key = item[expr] || 'Other';
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }

    const result: ItemGroup[] = [];
    groups.forEach((groupItems, key) => {
      result.push({
        key,
        items: groupItems,
        expanded: expandedState[key] !== undefined ? expandedState[key] : !this.groupsCollapsed()
      });
    });

    return result;
  });

  /** Flat list of items for virtual scroll (with group headers if grouped) */
  flattenedItems = computed(() => {
    const grouped = this.groupedItems();
    if (!grouped) {
      return this.items();
    }

    const result: any[] = [];
    for (const group of grouped) {
      result.push({
        __isGroupHeader: true,
        __groupKey: group.key,
        __expanded: group.expanded,
        __count: group.items.length
      });
      if (group.expanded) {
        result.push(...group.items);
      }
    }
    return result;
  });

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

  constructor(private elRef: ElementRef, private sso: ScrollStrategyOptions) {
    super();
    this.id = `app-select-box-${SelectBoxComponent.nextId++}`;

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

    // Handle value changes from BaseControl
    this.control.valueChanges.subscribe(() => {
      this.updateSelectedItem();
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
        this.overlayWidth = this.elRef.nativeElement.offsetWidth;
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
    if (this.disabled) return;
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
    if (item?.__isGroupHeader) return;
    const value = this.getItemValue(item);
    this.control.setValue(value);
    this.selectedItem.set(item);
    this.closeDropdown();
  }

  clearValue(event: MouseEvent) {
    event.stopPropagation();
    this.control.setValue(null);
    this.selectedItem.set(null);
  }

  toggleGroup(groupKey: string, event: Event) {
    event.stopPropagation();
    const current = this.groupExpandedState();
    const currentExpanded = current[groupKey] !== undefined ? current[groupKey] : !this.groupsCollapsed();
    this.groupExpandedState.set({
      ...current,
      [groupKey]: !currentExpanded
    });
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
    if (item?.__isGroupHeader) return false;
    return this.getItemValue(item) === this.control.value;
  }

  isGroupHeader(item: any): boolean {
    return item?.__isGroupHeader === true;
  }

  trackById = (index: number, item: any) => {
    if (item?.__isGroupHeader) {
      return `group-${item.__groupKey}`;
    }
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
    const items = this.flattenedItems();
    if (items.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.focusedIndex.update(i => {
          let next = i < items.length - 1 ? i + 1 : i;
          // Skip group headers
          while (next < items.length && items[next].__isGroupHeader) {
            next++;
          }
          if (next >= items.length) next = i;
          this.scrollToFocused(next);
          return next;
        });
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusedIndex.update(i => {
          let next = i > 0 ? i - 1 : i;
          // Skip group headers
          while (next >= 0 && items[next].__isGroupHeader) {
            next--;
          }
          if (next < 0) next = i;
          this.scrollToFocused(next);
          return next;
        });
        break;
      case 'Enter':
        event.preventDefault();
        if (this.focusedIndex() >= 0) {
          const item = items[this.focusedIndex()];
          if (!item.__isGroupHeader) {
            this.selectItem(item);
          }
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

  protected override handleValueChanged(value: any): void {
    this.updateSelectedItem();
  }

  private updateSelectedItem() {
    const items = this.items();
    const value = this.control.value;
    if (items.length > 0 && value !== null) {
      const found = items.find(item => this.getItemValue(item) === value);
      if (found) {
        this.selectedItem.set(found);
      }
    } else if (value === null) {
      this.selectedItem.set(null);
    }
  }
}
