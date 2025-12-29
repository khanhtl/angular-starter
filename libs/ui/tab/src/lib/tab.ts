import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    effect,
    ElementRef,
    EventEmitter,
    inject,
    input,
    model,
    Output,
    PLATFORM_ID,
    QueryList,
    signal,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TabItem } from './tab-types';

@Component({
    selector: 'app-tab',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './tab.html',
    styleUrls: ['./tab.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.vertical]': 'orientation() === "vertical"'
    }
})
export class TabComponent implements AfterViewInit {
    private platformId = inject(PLATFORM_ID);

    // Inputs using signal-based inputs
    items = input<TabItem[]>([]);
    selectedIndex = model<number>(0);
    orientation = input<'horizontal' | 'vertical'>('horizontal');

    // Outputs
    @Output() onItemClick = new EventEmitter<{ index: number, item: TabItem }>();
    @Output() onSelectionChanged = new EventEmitter<{ index: number, item: TabItem }>();

    // View Queries
    @ViewChild('list') listRef!: ElementRef<HTMLDivElement>;
    @ViewChildren('tabItem') tabElements!: QueryList<ElementRef<HTMLDivElement>>;

    // Internal State for the active bar
    barLeft = signal(0);
    barWidth = signal(0);
    barTop = signal(0);
    barHeight = signal(0);

    constructor() {
        // Update bar position whenever selectedIndex or items change
        effect(() => {
            this.selectedIndex();
            this.items();
            // Need to wait for DOM to update
            setTimeout(() => this.updateBarPosition(), 0);
        });
    }

    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.updateBarPosition();
            // Handle window resize
            window.addEventListener('resize', () => this.updateBarPosition());
        }
    }

    onTabClick(index: number, item: TabItem) {
        if (item.disabled) return;

        const prevIndex = this.selectedIndex();
        this.onItemClick.emit({ index, item });

        if (prevIndex !== index) {
            this.selectedIndex.set(index);
            this.onSelectionChanged.emit({ index, item });
        }
    }

    private updateBarPosition() {
        if (!isPlatformBrowser(this.platformId) || !this.tabElements) return;

        const tabs = this.tabElements.toArray();
        const selectedIdx = this.selectedIndex();

        if (tabs[selectedIdx]) {
            const el = tabs[selectedIdx].nativeElement;
            const listEl = this.listRef.nativeElement;

            if (this.orientation() === 'horizontal') {
                this.barLeft.set(el.offsetLeft);
                this.barWidth.set(el.offsetWidth);
            } else {
                this.barTop.set(el.offsetTop);
                this.barHeight.set(el.offsetHeight);
            }
        } else {
            this.barWidth.set(0);
            this.barHeight.set(0);
        }
    }

    // Imperative API
    public selectTab(index: number) {
        if (index >= 0 && index < this.items().length) {
            const item = this.items()[index];
            if (!item.disabled) {
                this.selectedIndex.set(index);
            }
        }
    }

    public next() {
        const nextIdx = (this.selectedIndex() + 1) % this.items().length;
        this.selectTab(nextIdx);
    }

    public prev() {
        const prevIdx = (this.selectedIndex() - 1 + this.items().length) % this.items().length;
        this.selectTab(prevIdx);
    }
}
