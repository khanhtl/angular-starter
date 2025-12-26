export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'link';
export type ButtonColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';
export type ButtonType = 'button' | 'submit' | 'reset';

export interface DropdownItem {
    label: string;
    icon?: any;
    click?: () => void;
    disabled?: boolean;
}
