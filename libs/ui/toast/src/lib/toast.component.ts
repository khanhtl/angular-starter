import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AlertTriangle, CheckCircle2, Info, LucideAngularModule, X, XCircle } from 'lucide-angular';
import { ToastConfig } from './toast.types';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    template: `
        <div class="toast-item {{ config.type }}" 
             [class.toast-out]="config.closing" 
             [style.width]="config.width">
            <div class="toast-icon">
                <i-lucide [img]="getIcon()" [size]="20"></i-lucide>
            </div>
            <div class="toast-content">
                {{ config.message }}
            </div>
            @if (config.showCloseButton) {
                <button class="toast-close" (click)="close()">
                    <i-lucide [img]="CloseIcon" [size]="16"></i-lucide>
                </button>
            }
        </div>
    `,
    styleUrls: ['./toast.scss']
})
export class ToastComponent {
    @Input({ required: true }) config!: ToastConfig;
    @Output() onClose = new EventEmitter<string>();

    readonly CloseIcon = X;

    getIcon() {
        switch (this.config.type) {
            case 'success': return CheckCircle2;
            case 'warning': return AlertTriangle;
            case 'error': return XCircle;
            default: return Info;
        }
    }

    close() {
        this.onClose.emit(this.config.id);
    }
}
