import { Type } from '@angular/core';

export interface PopupDefinition<TData, TResult> {
    component: Type<unknown>;
    data?: TData;
    result?: TResult;
}

export type PopupLoader<TData, TResult> =
    () => Promise<Type<unknown>>;

export interface PopupHooks<TData, TResult> {
    onOpen?: (data?: TData) => void;
    onClose?: (result?: TResult) => void;
}

export interface PopupConfig<
    TMap,
    K extends keyof TMap
> {
    data?: PopupData<TMap, K>;
    width?: string;
    height?: string;
    disableClose?: boolean;
    panelClass?: string | string[];
    backdropClass?: string | string[];
    hooks?: PopupHooks<
        PopupData<TMap, K>,
        PopupResult<TMap, K>
    >;
}
export type PopupData<TMap, K extends keyof TMap> =
    TMap[K] extends { data: infer D } ? D : never;

export type PopupResult<TMap, K extends keyof TMap> =
    TMap[K] extends { result: infer R } ? R : never;