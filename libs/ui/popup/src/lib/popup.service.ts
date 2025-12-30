import { Dialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PopupRegistry } from './popup.registry';
import { PopupConfig, PopupResult } from './popup.types';

@Injectable({ providedIn: 'root' })
export class PopupService<
    TMap extends Record<string, any> = any
> {
    private dialog = inject(Dialog);
    private registry = inject(PopupRegistry<TMap>);

    async open<K extends keyof TMap>(
        key: K,
        config?: PopupConfig<TMap, K>
    ) {
        const { loader, lifecycle } =
            this.registry.get(key);

        config?.hooks?.onOpen?.(config.data);

        const component = await loader();

        const ref = this.dialog.open<
            PopupResult<TMap, K>
        >(component, {
            data: config?.data,
            width: config?.width,
            height: config?.height,
            disableClose: config?.disableClose,
            panelClass: config?.panelClass,
            backdropClass: config?.backdropClass,
        });

        ref.closed.subscribe(result => {
            config?.hooks?.onClose?.(result);
            lifecycle?.onClose?.(result);
        });

        return ref.closed;
    }

    async openAndWait<K extends keyof TMap>(
        key: K,
        config?: PopupConfig<TMap, K>
    ): Promise<PopupResult<TMap, K> | undefined> {
        const closed$ = await this.open(key, config);
        return firstValueFrom(closed$);
    }


}

