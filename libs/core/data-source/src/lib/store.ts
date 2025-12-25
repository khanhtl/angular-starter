export interface LoadOptions {
  searchValue?: string;
  searchExpr?: string | string[];
  searchOperation?: 'contains' | 'startswith' | 'endswith' | '=';
  filter?: any;
  sort?: { selector: string; desc: boolean }[];
  skip?: number;
  take?: number;
  requireTotalCount?: boolean;
}

export interface LoadResult<T = any> {
  data: T[];
  totalCount?: number;
  summary?: any;
}

export abstract class Store<T = any> {
  abstract load(options: LoadOptions): Promise<LoadResult<T>>;
}
