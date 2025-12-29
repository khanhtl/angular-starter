import { DataSource, DataSourceOptions } from '@angular-starter/core/data-source';
import { BaseControl } from '@angular-starter/core/forms';
import { CdkOverlayOrigin, ConnectedPosition, OverlayModule, ScrollStrategyOptions } from '@angular/cdk/overlay';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChildren,
  effect,
  ElementRef,
  EventEmitter,
  forwardRef,
  input,
  numberAttribute,
  OnDestroy,
  OnInit,
  Output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ChevronDown, LucideAngularModule, Search, X } from 'lucide-angular';
import { ItemTemplateDirective, TagTemplateDirective } from './tag-box-templates';

/**
 * Represents a selected item with both value and display text
 */
export interface SelectedItemInfo {
  /** The raw item object */
  item: any;
  /** The value (based on valueExpr) */
  value: any;
  /** The display text (based on displayExpr) */
  displayText: string;
}

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
  selector: 'app-tag-box',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OverlayModule, ScrollingModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagBoxComponent),
      multi: true,
    },
  ],
  templateUrl: './tag-box.html',
  styleUrl: './tag-box.css',
})
export class TagBoxComponent extends BaseControl<any[]> implements OnInit, OnDestroy {
  // ========================
  // INPUTS
  // ========================

  /** Data source configuration - array, CustomStore, or DataSourceOptions */
  dataSourceInput = input<DataSourceOptions<any>>([], { alias: 'dataSource' });

  /** Property name to display item text */
  displayExpr = input<string>('');

  /** Property name to use as the actual value */
  valueExpr = input<string>('id');

  /** Placeholder text when no items selected */
  placeholder = input('Select items...');

  /** Enable search functionality in dropdown */
  searchEnabled = input(false, { transform: booleanAttribute });

  /** Placeholder for search input */
  searchPlaceholder = input('Search...');

  /** Show clear all button */
  clearableInput = input(false, { transform: booleanAttribute, alias: 'clearable' });

  /** Minimum characters before search triggers */
  minSearchLength = input(0, { transform: numberAttribute });

  /** Property/properties to search in */
  searchExpr = input<string | string[]>('');

  /** Width of dropdown ('auto' or specific value) */
  dropDownWidth = input<string | number>('auto');

  /** Close dropdown when scrolling outside */
  closeOnScroll = input(false, { transform: booleanAttribute });

  /** Maximum number of tags to display before showing "+N more" */
  maxDisplayedTags = input(3, { transform: numberAttribute });

  /** Show select all checkbox in dropdown */
  showSelectAll = input(false, { transform: booleanAttribute });

  /** Property name to group items by */
  groupExpr = input<string>('');

  /** Whether groups are collapsed by default */
  groupsCollapsed = input(false, { transform: booleanAttribute });

  // ========================
  // OUTPUTS
  // ========================

  /** Event emitted when selection changes, provides detailed selection info */
  @Output() selectionChanged = new EventEmitter<SelectedItemInfo[]>();

  // ========================
  // TEMPLATES
  // ========================

  itemTemplates = contentChildren(ItemTemplateDirective);
  tagTemplates = contentChildren(TagTemplateDirective);

  itemTemplate = computed(() => this.itemTemplates()[0]?.template);
  tagTemplate = computed(() => this.tagTemplates()[0]?.template);

  // ========================
  // ICONS
  // ========================

  readonly ChevronDownIcon = ChevronDown;
  readonly SearchIcon = Search;
  readonly XIcon = X;

  // ========================
  // INTERNAL STATE
  // ========================

  private ds?: DataSource<any>;
  items = signal<any[]>([]);
  loading = signal(false);
  isOpen = signal(false);
  searchValue = signal('');
  focusedIndex = signal(-1);
  selectedItems = signal<any[]>([]);
  showRemainingPopup = signal(false);
  groupExpandedState = signal<Record<string, boolean>>({});

  overlayWidth: string | number = 'auto';
  viewportHeight = 200;

  // ========================
  // COMPUTED VALUES
  // ========================

  /** Tags displayed in the input (limited by maxDisplayedTags) */
  displayedTags = computed(() => {
    const items = this.selectedItems();
    const max = this.maxDisplayedTags();
    return items.slice(0, max);
  });

  /** Count of hidden tags */
  remainingCount = computed(() => {
    const total = this.selectedItems().length;
    const max = this.maxDisplayedTags();
    return total > max ? total - max : 0;
  });

  /** Tags that are hidden (for popup display) */
  remainingTags = computed(() => {
    const items = this.selectedItems();
    const max = this.maxDisplayedTags();
    return items.slice(max);
  });

  /** Whether all items are selected */
  allSelected = computed(() => {
    const items = this.items();
    const selected = this.selectedItems();
    return items.length > 0 && items.length === selected.length;
  });

  /** Items grouped by groupExpr */
  groupedItems = computed(() => {
    const expr = this.groupExpr();
    const items = this.items();
    const expandedState = this.groupExpandedState();

    if (!expr) {
      return null; // No grouping
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
      result.push({ __isGroupHeader: true, __groupKey: group.key, __expanded: group.expanded, __count: group.items.length });
      if (group.expanded) {
        result.push(...group.items);
      }
    }
    return result;
  });

  // ========================
  // VIEW CHILDS
  // ========================

  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  viewport = viewChild(CdkVirtualScrollViewport);
  triggerContainer = viewChild<ElementRef<HTMLElement>>('triggerContainer');
  remainingTagsBtn = viewChild<ElementRef<HTMLElement>>('remainingTagsBtn');
  remainingTrigger = viewChild<CdkOverlayOrigin>('remainingTrigger');

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

  // Remaining popup positions
  remainingPopupPositions: ConnectedPosition[] = [
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
    this.id = `app-tag-box-${TagBoxComponent.nextId++}`;

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
      this.updateSelectedItems();
    });
  }

  ngOnInit() {
    this.updateOverlayWidth();
    window.addEventListener('resize', this.updateOverlayWidth);
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.updateOverlayWidth);
  }

  // ========================
  // PUBLIC API METHODS
  // ========================

  /**
   * Get all selected items with their values and display texts
   * @returns Array of SelectedItemInfo objects
   */
  getSelectedItemsInfo(): SelectedItemInfo[] {
    return this.selectedItems().map(item => ({
      item,
      value: this.getItemValue(item),
      displayText: this.getDisplayText(item)
    }));
  }

  /**
   * Get only the values of selected items
   * @returns Array of values (based on valueExpr)
   */
  getSelectedValues(): any[] {
    return Array.isArray(this.control.value) ? [...this.control.value] : [];
  }

  /**
   * Get only the display texts of selected items
   * @returns Array of display strings
   */
  getSelectedDisplayTexts(): string[] {
    return this.selectedItems().map(item => this.getDisplayText(item));
  }

  /**
   * Get the raw selected item objects
   * @returns Array of item objects
   */
  getSelectedItems(): any[] {
    return [...this.selectedItems()];
  }

  /**
   * Select items by their values
   * @param values Array of values to select
   */
  selectByValues(values: any[]): void {
    this.control.setValue(values);
    this.emitSelectionChanged();
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    this.control.setValue([]);
    this.emitSelectionChanged();
  }

  // ========================
  // PRIVATE METHODS
  // ========================

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
      this.updateSelectedItems();
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

  toggleItem(item: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    // Skip group headers
    if (item.__isGroupHeader) {
      return;
    }

    const value = this.getItemValue(item);
    const currentValues = Array.isArray(this.control.value) ? [...this.control.value] : [];
    const index = currentValues.indexOf(value);

    if (index > -1) {
      currentValues.splice(index, 1);
    } else {
      currentValues.push(value);
    }

    this.control.setValue(currentValues);
    this.handleBlur();
    this.emitSelectionChanged();
  }

  removeTag(item: any, event: MouseEvent) {
    event.stopPropagation();
    const value = this.getItemValue(item);
    const currentValues = (Array.isArray(this.control.value) ? this.control.value : []).filter(v => v !== value);
    this.control.setValue(currentValues);
    this.handleBlur();
    this.emitSelectionChanged();
  }

  clearAll(event: MouseEvent) {
    event.stopPropagation();
    this.control.setValue([]);
    this.handleBlur();
    this.emitSelectionChanged();
  }

  toggleSelectAll() {
    const items = this.items();
    if (this.allSelected()) {
      this.control.setValue([]);
    } else {
      const allValues = items.map(item => this.getItemValue(item));
      this.control.setValue(allValues);
    }
    this.handleBlur();
    this.emitSelectionChanged();
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

  selectGroup(groupKey: string, event: Event) {
    event.stopPropagation();
    const grouped = this.groupedItems();
    if (!grouped) return;

    const group = grouped.find(g => g.key === groupKey);
    if (!group) return;

    const groupValues = group.items.map(item => this.getItemValue(item));
    const currentValues = Array.isArray(this.control.value) ? [...this.control.value] : [];
    const allGroupSelected = groupValues.every(v => currentValues.includes(v));

    let newValues: any[];
    if (allGroupSelected) {
      // Deselect all in group
      newValues = currentValues.filter(v => !groupValues.includes(v));
    } else {
      // Select all in group
      newValues = [...new Set([...currentValues, ...groupValues])];
    }

    this.control.setValue(newValues);
    this.handleBlur();
    this.emitSelectionChanged();
  }

  isGroupFullySelected(groupKey: string): boolean {
    const grouped = this.groupedItems();
    if (!grouped) return false;

    const group = grouped.find(g => g.key === groupKey);
    if (!group) return false;

    const currentValues = Array.isArray(this.control.value) ? this.control.value : [];
    return group.items.every(item => currentValues.includes(this.getItemValue(item)));
  }

  isGroupPartiallySelected(groupKey: string): boolean {
    const grouped = this.groupedItems();
    if (!grouped) return false;

    const group = grouped.find(g => g.key === groupKey);
    if (!group) return false;

    const currentValues = Array.isArray(this.control.value) ? this.control.value : [];
    const selectedCount = group.items.filter(item => currentValues.includes(this.getItemValue(item))).length;
    return selectedCount > 0 && selectedCount < group.items.length;
  }

  toggleRemainingPopup(event: MouseEvent) {
    event.stopPropagation();
    this.showRemainingPopup.update(v => !v);
  }

  closeRemainingPopup() {
    this.showRemainingPopup.set(false);
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
    if (item.__isGroupHeader) return false;
    const value = this.getItemValue(item);
    const currentValues = Array.isArray(this.control.value) ? this.control.value : [];
    return currentValues.includes(value);
  }

  isGroupHeader(item: any): boolean {
    return item?.__isGroupHeader === true;
  }

  trackById = (index: number, item: any) => {
    if (item.__isGroupHeader) {
      return `group-${item.__groupKey}`;
    }
    return this.getItemValue(item) ?? index;
  };

  // ========================
  // SEARCH
  // ========================

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

  // ========================
  // KEYBOARD NAVIGATION
  // ========================

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
            this.toggleItem(item);
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
      requestAnimationFrame(() => {
        this.viewport()?.scrollToIndex(index, 'smooth');
      });
    }
  }

  // ========================
  // VIRTUAL SCROLL
  // ========================

  onScrollIndexChange(index: number) {
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

  protected override handleValueChanged(value: any[]): void {
    this.updateSelectedItems();
  }

  override get isInvalid(): boolean {
    const value = this.control.value;
    return this.isTouched() && this.required && (!value || (Array.isArray(value) && value.length === 0));
  }

  private updateSelectedItems() {
    const items = this.items();
    const value = Array.isArray(this.control.value) ? this.control.value : [];
    if (items.length > 0 && value.length > 0) {
      const selected = items.filter(item =>
        value.includes(this.getItemValue(item))
      );
      this.selectedItems.set(selected);
    } else {
      this.selectedItems.set([]);
    }
  }

  private emitSelectionChanged() {
    this.selectionChanged.emit(this.getSelectedItemsInfo());
  }
}

