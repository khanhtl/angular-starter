import { ArrayStore } from './array-store';
import { CustomStore, CustomStoreOptions } from './custom-store';
import { LoadOptions, LoadResult, Store } from './store';

export type DataSourceOptions<T = any> = 
  | T[] 
  | Store<T> 
  | CustomStoreOptions<T>
  | {
      store: Store<T> | CustomStoreOptions<T> | T[];
      filter?: any;
      sort?: any;
      searchExpr?: string | string[];
      searchValue?: string;
      paginate?: boolean;
      pageSize?: number;
    };

export class DataSource<T = any> {
  private _store: Store<T>;
  private _options: any;
  private _loadOptions: LoadOptions = {};
  
  private _items: T[] = [];
  private _totalCount: number = -1;
  private _loading: boolean = false;

  constructor(options: DataSourceOptions<T>) {
    if (Array.isArray(options)) {
      this._store = new ArrayStore(options);
      this._options = {};
    } else if (options instanceof Store) {
      this._store = options;
      this._options = {};
    } else if ('load' in options && typeof options.load === 'function') {
      this._store = new CustomStore(options as CustomStoreOptions<T>);
      this._options = {};
    } else {
      const opt = options as any;
      if (Array.isArray(opt.store)) {
        this._store = new ArrayStore(opt.store);
      } else if (opt.store instanceof Store) {
        this._store = opt.store;
      } else {
        this._store = new CustomStore(opt.store);
      }
      this._options = opt;
      this._loadOptions.filter = opt.filter;
      this._loadOptions.sort = opt.sort;
      this._loadOptions.searchExpr = opt.searchExpr;
      this._loadOptions.searchValue = opt.searchValue;
      if (opt.paginate) {
        this._loadOptions.take = opt.pageSize || 20;
        this._loadOptions.skip = 0;
      }
    }
  }

  get items() { return this._items; }
  get totalCount() { return this._totalCount; }
  get loading() { return this._loading; }

  async load(): Promise<T[]> {
    this._loading = true;
    try {
      const result = await this._store.load(this._loadOptions);
      this._items = result.data;
      this._totalCount = result.totalCount ?? -1;
      return this._items;
    } finally {
      this._loading = false;
    }
  }

  searchValue(value: string | null) {
    this._loadOptions.searchValue = value || undefined;
  }

  searchExpr(expr: string | string[] | null) {
    this._loadOptions.searchExpr = expr || undefined;
  }

  pageSize(value: number) {
    this._loadOptions.take = value;
  }

  pageIndex(value: number) {
    this._loadOptions.skip = value * (this._loadOptions.take || 0);
  }

  // Support for load on demand / infinite scroll
  async loadMore(): Promise<T[]> {
    if (this._loading) return [];
    
    const skip = this._items.length;
    const take = this._loadOptions.take || 20;
    
    this._loading = true;
    try {
      const result = await this._store.load({
        ...this._loadOptions,
        skip,
        take
      });
      this._items = [...this._items, ...result.data];
      this._totalCount = result.totalCount ?? -1;
      return result.data;
    } finally {
      this._loading = false;
    }
  }
}
