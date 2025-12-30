import { ToastConfig } from './toast.types';

/**
 * Functional Core: Pure logic for managing toasts.
 * No side effects, no dependencies on Angular services.
 */
export const toastCore = {
    addToast(toasts: ToastConfig[], toast: ToastConfig): ToastConfig[] {
        return [...toasts, toast];
    },

    markAsClosing(toasts: ToastConfig[], id: string): ToastConfig[] {
        return toasts.map(t => t.id === id ? { ...t, closing: true } : t);
    },

    removeToast(toasts: ToastConfig[], id: string): ToastConfig[] {
        return toasts.filter(t => t.id !== id);
    }
};
