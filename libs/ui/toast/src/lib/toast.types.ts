export type ToastType = 'info' | 'success' | 'warning' | 'error';

export type ToastPosition =
    | 'top-left' | 'top-center' | 'top-right'
    | 'bottom-left' | 'bottom-center' | 'bottom-right'
    | 'center';

export interface ToastConfig {
    id: string;
    message: string;
    type?: ToastType;
    displayTime?: number;
    position?: ToastPosition;
    closeOnClick?: boolean;
    showCloseButton?: boolean;
    width?: string | number;
    minWidth?: string | number;
    maxWidth?: string | number;
    animationDuration?: number;
    closing?: boolean; // New flag for out animation
}

export interface ToastState {
    toasts: ToastConfig[];
}
