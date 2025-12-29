export interface TabItem {
    id?: string | number;
    text?: string;
    icon?: any;
    disabled?: boolean;
    visible?: boolean;
    template?: any;
    [key: string]: any;
}

export type TabOrientation = 'horizontal' | 'vertical';
export type TabStylingMode = 'primary' | 'secondary' | 'underline';
