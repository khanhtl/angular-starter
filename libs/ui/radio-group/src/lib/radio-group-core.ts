
export interface RadioGroupItem {
    text?: string;
    value?: any;
    disabled?: boolean;
    [key: string]: any;
}

export type RadioGroupLayout = 'horizontal' | 'vertical';

export class RadioGroupCore {
    static getDisplayValue(item: any, displayExpr?: string): string {
        if (typeof item === 'string' || typeof item === 'number') {
            return String(item);
        }
        if (displayExpr && item && typeof item === 'object') {
            return item[displayExpr];
        }
        return item?.text || '';
    }

    static getValue(item: any, valueExpr?: string): any {
        if (typeof item === 'string' || typeof item === 'number') {
            return item;
        }
        if (valueExpr && item && typeof item === 'object') {
            return item[valueExpr];
        }
        return item?.value !== undefined ? item.value : item;
    }

    static isSelected(item: any, currentValue: any, valueExpr?: string): boolean {
        const value = this.getValue(item, valueExpr);
        return value === currentValue;
    }
}
