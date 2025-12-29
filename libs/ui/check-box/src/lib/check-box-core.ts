
export type CheckBoxValue = boolean | null | undefined;

export interface CheckBoxOptions {
    allowIndeterminate?: boolean;
    disabled?: boolean;
    readonly?: boolean;
}

export class CheckBoxCore {
    static toggle(currentValue: CheckBoxValue, allowIndeterminate: boolean): CheckBoxValue {
        if (currentValue === true) {
            return false;
        }
        if (currentValue === false) {
            return allowIndeterminate ? null : true;
        }
        // Indeterminate case
        return true;
    }

    static isValidValue(value: any, allowIndeterminate: boolean): boolean {
        if (value === true || value === false) return true;
        if (allowIndeterminate && (value === null || value === undefined)) return true;
        return false;
    }
}
