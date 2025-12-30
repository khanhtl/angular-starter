import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ToastComponent } from './toast.component';
import { ToastService } from './toast.service';
import { ToastPosition } from './toast.types';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    imports: [CommonModule, ToastComponent],
    template: `
        @for (pos of positions; track pos) {
            @if (toastsByPosition()[pos].length > 0) {
                <div class="toast-container {{ pos }}">
                    @for (toast of toastsByPosition()[pos]; track toast.id) {
                        <app-toast [config]="toast" (onClose)="toastService.hide($event)"></app-toast>
                    }
                </div>
            }
        }
    `,
    styleUrls: ['./toast.scss']
})
export class ToastContainerComponent {
    readonly toastService = inject(ToastService);
    readonly toastsByPosition = this.toastService.toastsByPosition;

    readonly positions: ToastPosition[] = [
        'top-left', 'top-center', 'top-right',
        'bottom-left', 'bottom-center', 'bottom-right',
        'center'
    ];
}
