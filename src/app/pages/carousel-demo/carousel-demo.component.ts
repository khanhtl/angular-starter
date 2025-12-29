
import { CarouselComponent } from '@angular-starter/carousel';
import { ButtonComponent } from '@angular-starter/ui/button';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { Code, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';

interface CarouselConfig {
    loop: boolean;
    autoPlay: boolean;
    interval: number;
    showNavButtons: boolean;
    showIndicator: boolean;
    animationType: 'slide' | 'fade';
    selectedIndex: number;
}

@Component({
    selector: 'app-carousel-demo',
    standalone: true,
    imports: [CommonModule, FormsModule, CarouselComponent, LucideAngularModule, ButtonComponent],
    templateUrl: './carousel-demo.component.html',
    styles: [`
    .playground-grid {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 2rem;
      align-items: start;
    }
  `]
})
export class CarouselDemoComponent implements OnDestroy {
    readonly CodeIcon = Code;
    readonly EyeIcon = Eye;
    readonly EyeOffIcon = EyeOff;

    activeTab = signal<'preview' | 'api'>('preview');
    showCode = signal(false);
    @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
    editorView?: EditorView;

    dataSource = [
        {
            title: 'Mountain Retreat',
            description: 'Experience the serenity of the high peaks at sunset.',
            image: 'assets/images/carousel-1.png'
        },
        {
            title: 'Neo-Tokyo Nights',
            description: 'Dive into the vibrant energy of the futuristic cityscape.',
            image: 'assets/images/carousel-2.png'
        },
        {
            title: 'Tropical Paradise',
            description: 'Relax on the pristine white sands of our remote island.',
            image: 'assets/images/carousel-3.png'
        }
    ];

    // Playground Config
    config = signal<CarouselConfig>({
        loop: true,
        autoPlay: false,
        interval: 5000,
        showNavButtons: true,
        showIndicator: true,
        animationType: 'slide',
        selectedIndex: 0
    });

    generatedCode = computed(() => {
        const c = this.config();
        const props = [
            `[dataSource]="dataSource"`,
            c.loop ? '[loop]="true"' : '[loop]="false"',
            c.autoPlay ? '[autoPlay]="true"' : '',
            c.autoPlay ? `[interval]="${c.interval}"` : '',
            c.showNavButtons ? '[showNavButtons]="true"' : '[showNavButtons]="false"',
            c.showIndicator ? '[showIndicator]="true"' : '[showIndicator]="false"',
            `animationType="${c.animationType}"`,
            `[(ngModel)]="selectedIndex"`
        ].filter(Boolean).join('\n  ');

        return `<app-carousel\n  ${props}>\n</app-carousel>`;
    });

    constructor() {
        effect(() => {
            const code = this.generatedCode();
            if (this.editorView) {
                this.editorView.dispatch({
                    changes: { from: 0, to: this.editorView.state.doc.length, insert: code }
                });
            }
        });
    }

    updateConfig(key: string, value: any) {
        this.config.update((c: any) => ({ ...c, [key]: value }));
    }

    toggleCode() {
        this.showCode.update(v => !v);
        if (this.showCode()) {
            setTimeout(() => this.initEditor(), 50);
        } else {
            this.editorView?.destroy();
            this.editorView = undefined;
        }
    }

    initEditor() {
        if (!this.codeEditorRef) return;
        this.editorView = new EditorView({
            doc: this.generatedCode(),
            extensions: [
                basicSetup,
                html(),
                EditorView.editable.of(false),
                EditorView.theme({
                    "&": { height: "auto", maxHeight: "300px", fontSize: "14px", backgroundColor: "#f8fafc" },
                    ".cm-scroller": { overflow: "auto" },
                    ".cm-gutters": { backgroundColor: "#f1f5f9", borderRight: "1px solid #e2e8f0" }
                })
            ],
            parent: this.codeEditorRef.nativeElement
        });
    }

    ngOnDestroy() {
        this.editorView?.destroy();
    }
}
