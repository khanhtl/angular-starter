import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { SpinnerCore, SpinnerSize } from './spinner-core';

@Component({
    selector: 'app-spinner',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './spinner.html',
    styleUrl: './spinner.css',
})
export class SpinnerComponent {
    visible = input<boolean>(true);
    size = input<SpinnerSize>('md');
    label = input<string | undefined>(undefined);
    inline = input<boolean>(true);
    rainbow = input<boolean>(false);

    sizeValue = computed(() => SpinnerCore.getSizeValue(this.size()));

    radius = computed(() => {
        const value = parseInt(this.sizeValue());
        return (value / 2) - 3;
    });

    center = computed(() => {
        const value = parseInt(this.sizeValue());
        return value / 2;
    });

    viewBox = computed(() => {
        const value = parseInt(this.sizeValue());
        return `0 0 ${value} ${value}`;
    });
}
