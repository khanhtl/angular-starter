import { LoadOptions, LoadResult, Store } from './store';

export class ArrayStore<T = any> extends Store<T> {
  constructor(private _data: T[]) {
    super();
  }

  async load(options: LoadOptions): Promise<LoadResult<T>> {
    let result = [...this._data];

    // Searching
    if (options.searchValue && options.searchExpr) {
      const searchValue = options.searchValue.toLowerCase();
      const searchExpr = Array.isArray(options.searchExpr) ? options.searchExpr : [options.searchExpr];
      
      result = result.filter(item => {
        return searchExpr.some(expr => {
          const val = (item as any)[expr];
          if (val === undefined || val === null) return false;
          return String(val).toLowerCase().includes(searchValue);
        });
      });
    }

    // Sorting
    if (options.sort && options.sort.length > 0) {
      result.sort((a, b) => {
        for (const s of options.sort!) {
          const valA = (a as any)[s.selector];
          const valB = (b as any)[s.selector];
          if (valA < valB) return s.desc ? 1 : -1;
          if (valA > valB) return s.desc ? -1 : 1;
        }
        return 0;
      });
    }

    const totalCount = result.length;

    // Paging
    if (options.skip !== undefined || options.take !== undefined) {
      const skip = options.skip || 0;
      const take = options.take || totalCount;
      result = result.slice(skip, skip + take);
    }

    return { data: result, totalCount };
  }
}
