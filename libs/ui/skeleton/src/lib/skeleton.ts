import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
    getSkeletonClasses,
    getSkeletonStyles,
    SkeletonAnimation,
    SkeletonVariant
} from './skeleton-core';

@Component({
    selector: 'app-skeleton',
    standalone: true,
    imports: [CommonModule],
    template: ``,
    styleUrls: ['./skeleton.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class]': 'hostClasses()',
        '[style]': 'hostStyles()',
        'aria-hidden': 'true'
    }
})
export class SkeletonComponent {
    /**
     * The variant of the skeleton.
     */
    variant = input<SkeletonVariant>('text');

    /**
     * The animation type.
     */
    animation = input<SkeletonAnimation>('pulse');

    /**
     * Custom width of the skeleton.
     */
    width = input<string | number>();

    /**
     * Custom height of the skeleton.
     */
    height = input<string | number>();

    /**
     * Custom border radius.
     */
    borderRadius = input<string | number>();

    /**
     * Computed classes based on inputs.
     */
    hostClasses = computed(() => {
        const classes = getSkeletonClasses({
            variant: this.variant(),
            animation: this.animation()
        });
        return Object.entries(classes)
            .filter(([_, value]) => value)
            .map(([key]) => key)
            .join(' ');
    });

    /**
     * Computed styles based on inputs.
     */
    hostStyles = computed(() => getSkeletonStyles({
        width: this.width(),
        height: this.height(),
        borderRadius: this.borderRadius(),
        variant: this.variant()
    }));
}
