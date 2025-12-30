
export type SpinnerSize = 'sm' | 'md' | 'lg' | number;

export interface SpinnerOptions {
    visible?: boolean;
    size?: SpinnerSize;
    label?: string;
    rainbow?: boolean;
}

export class SpinnerCore {
    static getSizeValue(size: SpinnerSize): string {
        if (typeof size === 'number') {
            return `${size}px`;
        }
        switch (size) {
            case 'sm': return '16px';
            case 'md': return '32px';
            case 'lg': return '48px';
            default: return '32px';
        }
    }

    static getCircleRadius(size: SpinnerSize): number {
        const value = parseInt(this.getSizeValue(size));
        return (value / 2) - 2; // Offset for stroke
    }
}
