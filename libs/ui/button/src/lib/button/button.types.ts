export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';
export type ButtonType = 'button' | 'submit' | 'reset';

export interface DropdownItem {
    label: string;
    icon?: any;
    click?: () => void;
    disabled?: boolean;
}
