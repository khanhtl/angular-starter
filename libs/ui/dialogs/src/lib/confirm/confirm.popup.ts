import { PopupRegistry } from '@angular-starter/ui/popup';
import { inject } from '@angular/core';
import { ApiDemoData, ApiDemoResult } from '../api-demo/api-demo.dialog';
import { UserFormData, UserFormResult } from '../user-form/user-form.types';
import { ConfirmPopupData, ConfirmPopupResult } from './confirm.types';

export interface SharedPopupMap {
    'ui.confirm': {
        data: ConfirmPopupData;
        result: ConfirmPopupResult;
    };
    'ui.user-form': {
        data: UserFormData;
        result: UserFormResult;
    };
    'ui.api-demo': {
        data: ApiDemoData;
        result: ApiDemoResult;
    };
}

export function registerConfirmPopup() {
    const registry = inject(PopupRegistry<SharedPopupMap>);
    return registry.register(
        'ui.confirm',
        () => import('./confirm.dialog').then(m => m.ConfirmDialog)
    );
}

export function registerUserFormPopup() {
    const registry = inject(PopupRegistry<SharedPopupMap>);
    return registry.register(
        'ui.user-form',
        () => import('../user-form/user-form.dialog').then(m => m.UserFormDialog)
    );
}

export function registerApiDemoPopup() {
    const registry = inject(PopupRegistry<SharedPopupMap>);
    return registry.register(
        'ui.api-demo',
        () => import('../api-demo/api-demo.dialog').then(m => m.ApiDemoDialog)
    );
}
