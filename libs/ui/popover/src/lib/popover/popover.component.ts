
import {
    ConnectionPositionPair,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    OverlayRef
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    effect,
    ElementRef,
    EventEmitter,
    input,
    model,
    OnDestroy,
    Output,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
    selector: 'app-popover',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './popover.component.html',
    styleUrls: ['./popover.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverComponent implements OnDestroy {
    readonly XIcon = X;
    // Inputs as signals or standard inputs that drive signals
    target = model<HTMLElement | ElementRef | string | undefined>(undefined);
    visible = model<boolean>(false);

    // Configuration
    width = input<string | number>('auto');
    height = input<string | number>('auto');
    position = input<'top' | 'bottom' | 'left' | 'right'>('bottom');
    shading = input(false); // backdrop
    showCloseButton = input(true);
    title = input('');
    closeOnOutsideClick = input(true);

    @Output() visibleChange = new EventEmitter<boolean>();

    @ViewChild('contentTemplate') contentTemplate!: TemplateRef<any>;

    private overlayRef?: OverlayRef;
    private portal?: TemplatePortal;

    constructor(
        private overlay: Overlay,
        private viewContainerRef: ViewContainerRef
    ) {
        // Effect to handle visibility changes
        effect(() => {
            if (this.visible()) {
                this.show();
            } else {
                this.hide();
            }
        });

        // Effect to update position if target changes while open
        effect(() => {
            const t = this.target();
            if (this.overlayRef && this.overlayRef.hasAttached() && t) {
                // Re-run positioning if target changes
                this.updatePosition();
            }
        });
    }

    private show() {
        if (this.overlayRef?.hasAttached()) return;

        const targetElement = this.resolveTarget();
        if (!targetElement) {
            console.warn('Popover: Target element not found.', this.target());
            return;
        }

        const positionStrategy = this.getPositionStrategy(targetElement);

        const overlayConfig = new OverlayConfig({
            positionStrategy,
            hasBackdrop: this.shading(),
            backdropClass: 'popover-backdrop',
            scrollStrategy: this.overlay.scrollStrategies.reposition(),
            panelClass: 'app-popover-panel'
        });

        this.overlayRef = this.overlay.create(overlayConfig);

        this.portal = new TemplatePortal(this.contentTemplate, this.viewContainerRef);
        this.overlayRef.attach(this.portal);

        if (this.shading()) {
            this.overlayRef.backdropClick().subscribe(() => {
                if (this.closeOnOutsideClick()) {
                    this.close();
                }
            });
        }

        this.overlayRef.outsidePointerEvents().subscribe(() => {
            if (!this.shading() && this.closeOnOutsideClick()) {
                this.close();
            }
        });
    }

    private hide() {
        if (this.overlayRef) {
            this.overlayRef.detach();
            this.overlayRef.dispose();
            this.overlayRef = undefined;
        }
    }

    close() {
        this.visible.set(false);
        this.visibleChange.emit(false);
    }

    private resolveTarget(): HTMLElement | null {
        const t = this.target();
        if (!t) return null;

        if (typeof t === 'string') {
            return document.querySelector(t) as HTMLElement;
        }

        // Handle ElementRef or objects that look like ElementRef
        if (t instanceof ElementRef || (typeof t === 'object' && 'nativeElement' in t)) {
            return (t as any).nativeElement;
        }

        return t as HTMLElement;
    }

    private getPositionStrategy(element: HTMLElement): FlexibleConnectedPositionStrategy {
        const pos = this.position();
        let positions: ConnectionPositionPair[] = [];

        switch (pos) {
            case 'top':
                positions.push(
                    new ConnectionPositionPair({ originX: 'center', originY: 'top' }, { overlayX: 'center', overlayY: 'bottom' })
                );
                break;
            case 'bottom':
                positions.push(
                    new ConnectionPositionPair({ originX: 'center', originY: 'bottom' }, { overlayX: 'center', overlayY: 'top' })
                );
                break;
            case 'left':
                positions.push(
                    new ConnectionPositionPair({ originX: 'start', originY: 'center' }, { overlayX: 'end', overlayY: 'center' })
                );
                break;
            case 'right':
                positions.push(
                    new ConnectionPositionPair({ originX: 'end', originY: 'center' }, { overlayX: 'start', overlayY: 'center' })
                );
                break;
            default: // bottom default
                positions.push(
                    new ConnectionPositionPair({ originX: 'center', originY: 'bottom' }, { overlayX: 'center', overlayY: 'top' })
                );
                break;
        }

        // Add fallbacks
        // If top fails, try bottom, etc.
        if (pos === 'top') {
            positions.push(new ConnectionPositionPair({ originX: 'center', originY: 'bottom' }, { overlayX: 'center', overlayY: 'top' }));
        } else if (pos === 'bottom') {
            positions.push(new ConnectionPositionPair({ originX: 'center', originY: 'top' }, { overlayX: 'center', overlayY: 'bottom' }));
        }

        return this.overlay.position()
            .flexibleConnectedTo(element)
            .withPositions(positions)
            .withPush(false);
    }

    private updatePosition() {
        if (this.overlayRef) {
            const target = this.resolveTarget();
            if (target) {
                const strategy = this.getPositionStrategy(target);
                this.overlayRef.updatePositionStrategy(strategy);
            }
        }
    }

    ngOnDestroy() {
        this.hide();
    }
}
