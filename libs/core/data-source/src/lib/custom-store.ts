import { LoadOptions, LoadResult, Store } from './store';

export interface CustomStoreOptions<T = any> {
  load: (options: LoadOptions) => Promise<LoadResult<T>> | LoadResult<T>;
  byKey?: (key: any) => Promise<T> | T;
}

export class CustomStore<T = any> extends Store<T> {
  constructor(private _options: CustomStoreOptions<T>) {
    super();
  }

  async load(options: LoadOptions): Promise<LoadResult<T>> {
    const result = await this._options.load(options);
    return result;
  }

  async byKey(key: any): Promise<T> {
    if (this._options.byKey) {
      return await this._options.byKey(key);
    }
    throw new Error('byKey is not implemented in CustomStore');
  }
}
