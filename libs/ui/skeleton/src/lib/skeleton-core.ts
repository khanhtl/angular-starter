/**
 * Functional core for Skeleton logic.
 * Contains pure functions for styling and class calculations.
 */

export type SkeletonVariant = 'text' | 'rect' | 'circle';
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

export interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    variant?: SkeletonVariant;
    animation?: SkeletonAnimation;
    borderRadius?: string | number;
}

/**
 * Normalizes dimension values (adds 'px' if number)
 */
export function normalizeDimension(value?: string | number): string | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    return typeof value === 'number' ? `${value}px` : value;
}

/**
 * Calculates CSS classes for the skeleton
 */
export function getSkeletonClasses(props: SkeletonProps): Record<string, boolean> {
    const { variant = 'text', animation = 'pulse' } = props;
    return {
        'app-skeleton': true,
        [`app-skeleton-${variant}`]: true,
        [`app-skeleton-animation-${animation}`]: animation !== 'none',
    };
}

/**
 * Calculates Inline Styles for the skeleton
 */
export function getSkeletonStyles(props: SkeletonProps): Record<string, string | undefined> {
    const { width, height, borderRadius, variant } = props;

    const styles: Record<string, string | undefined> = {
        width: normalizeDimension(width),
        height: normalizeDimension(height),
        borderRadius: normalizeDimension(borderRadius),
    };

    // Default height for text variant if not provided
    if (variant === 'text' && !height) {
        styles['height'] = '1em';
    }

    return styles;
}
