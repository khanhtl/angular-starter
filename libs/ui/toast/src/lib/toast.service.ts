import { computed, Injectable, signal } from '@angular/core';
import { toastCore } from './toast.core';
import { ToastConfig, ToastPosition } from './toast.types';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private readonly _toasts = signal<ToastConfig[]>([]);

    /**
     * Group toasts by position for efficient rendering
     */
    readonly toastsByPosition = computed(() => {
        const toasts = this._toasts();
        const grouped: Record<ToastPosition, ToastConfig[]> = {
            'top-left': [], 'top-center': [], 'top-right': [],
            'bottom-left': [], 'bottom-center': [], 'bottom-right': [],
            'center': []
        };

        toasts.forEach(toast => {
            const pos = toast.position || 'bottom-center';
            if (grouped[pos]) {
                grouped[pos].push(toast);
            } else {
                grouped['bottom-center'].push(toast);
            }
        });

        return grouped;
    });

    /**
     * Public API to show a toast
     */
    show(config: Partial<ToastConfig> & { message: string }) {
        const id = Math.random().toString(36).substring(2, 9);
        const fullConfig: ToastConfig = {
            id,
            type: 'info',
            displayTime: 3000,
            position: 'bottom-center',
            showCloseButton: true,
            ...config
        };

        this._toasts.update(toasts => toastCore.addToast(toasts, fullConfig));

        if (fullConfig.displayTime && fullConfig.displayTime > 0) {
            setTimeout(() => {
                this.hide(id);
            }, fullConfig.displayTime);
        }

        return id;
    }

    /**
     * Success shortcut
     */
    success(message: string, config?: Partial<ToastConfig>) {
        return this.show({ ...config, message, type: 'success' });
    }

    /**
     * Info shortcut
     */
    info(message: string, config?: Partial<ToastConfig>) {
        return this.show({ ...config, message, type: 'info' });
    }

    /**
     * Warning shortcut
     */
    warning(message: string, config?: Partial<ToastConfig>) {
        return this.show({ ...config, message, type: 'warning' });
    }

    /**
     * Error shortcut
     */
    error(message: string, config?: Partial<ToastConfig>) {
        return this.show({ ...config, message, type: 'error' });
    }

    /**
     * Public API to hide a toast with animation
     */
    hide(id: string) {
        // First mark as closing to trigger animation
        this._toasts.update(toasts => toastCore.markAsClosing(toasts, id));

        // Then remove after animation duration
        setTimeout(() => {
            this._toasts.update(toasts => toastCore.removeToast(toasts, id));
        }, 300);
    }
}
