
import { BaseControl } from '@angular-starter/core/forms';
import { CommonModule } from '@angular/common';
import {
    Component,
    ContentChild,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    booleanAttribute,
    forwardRef,
    numberAttribute,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ChevronLeft, ChevronRight, LucideAngularModule } from 'lucide-angular';
import { CarouselCore } from './carousel-core';

@Component({
    selector: 'app-carousel',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, FormsModule, ReactiveFormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CarouselComponent),
            multi: true,
        },
    ],
    templateUrl: './carousel.html',
    styleUrl: './carousel.css',
})
export class CarouselComponent extends BaseControl<number> implements OnInit, OnDestroy {
    @Input() dataSource: any[] = [];
    @Input({ transform: booleanAttribute }) loop = true;
    @Input({ transform: booleanAttribute }) autoPlay = false;
    @Input({ transform: numberAttribute }) interval = 5000;
    @Input({ transform: booleanAttribute }) showNavButtons = true;
    @Input({ transform: booleanAttribute }) showIndicator = true;
    @Input() animationType: 'slide' | 'fade' = 'slide';

    @ContentChild('itemTemplate') itemTemplate?: TemplateRef<any>;

    readonly ChevronLeftIcon = ChevronLeft;
    readonly ChevronRightIcon = ChevronRight;

    private _intervalId?: any;

    get selectedIndex(): number {
        return this.control.value ?? 0;
    }

    constructor() {
        super();
        this.id = `app-carousel-${CarouselComponent.nextId++}`;
    }

    ngOnInit(): void {
        this.startAutoPlay();
    }

    ngOnDestroy(): void {
        this.stopAutoPlay();
    }

    next(): void {
        const nextIndex = CarouselCore.getNextIndex(
            this.selectedIndex,
            this.dataSource.length,
            this.loop
        );
        this.goTo(nextIndex);
    }

    prev(): void {
        const prevIndex = CarouselCore.getPrevIndex(
            this.selectedIndex,
            this.dataSource.length,
            this.loop
        );
        this.goTo(prevIndex);
    }

    goTo(index: number): void {
        if (index === this.selectedIndex) return;
        this.control.setValue(index);
    }

    getTransform(): string {
        return CarouselCore.getTranslatedPosition(this.selectedIndex, this.dataSource.length);
    }

    startAutoPlay(): void {
        if (this.autoPlay && this.dataSource.length > 1) {
            this.stopAutoPlay();
            this._intervalId = setInterval(() => {
                this.next();
            }, this.interval);
        }
    }

    stopAutoPlay(): void {
        if (this._intervalId) {
            clearInterval(this._intervalId);
            this._intervalId = undefined;
        }
    }

    onMouseEnter(): void {
        this.stopAutoPlay();
    }

    onMouseLeave(): void {
        this.startAutoPlay();
    }

    override writeValue(value: any): void {
        const index = numberAttribute(value, 0);
        if (index >= 0 && index < this.dataSource.length) {
            super.writeValue(index);
        } else {
            super.writeValue(0);
        }
    }
}
