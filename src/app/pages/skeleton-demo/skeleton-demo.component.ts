import { ButtonComponent } from '@angular-starter/ui/button';
import { AppInputComponent } from '@angular-starter/ui/input';
import { SelectBoxComponent } from '@angular-starter/ui/select-box';
import { SkeletonAnimation, SkeletonComponent, SkeletonVariant } from '@angular-starter/ui/skeleton';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { Code, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';

interface SkeletonConfig {
    variant: SkeletonVariant;
    animation: SkeletonAnimation;
    width: string | number;
    height: string | number;
    borderRadius: string | number;
}

@Component({
    selector: 'app-skeleton-demo',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        SkeletonComponent,
        LucideAngularModule,
        ButtonComponent,
        SelectBoxComponent,
        AppInputComponent
    ],
    templateUrl: './skeleton-demo.component.html',
})
export class SkeletonDemoComponent implements OnDestroy {
    readonly CodeIcon = Code;
    readonly EyeIcon = Eye;
    readonly EyeOffIcon = EyeOff;

    activeTab = signal<'preview' | 'api'>('preview');
    showCode = signal(false);
    @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
    editorView?: EditorView;

    // Playground Config
    config = signal<SkeletonConfig>({
        variant: 'text',
        animation: 'pulse',
        width: '100%',
        height: '',
        borderRadius: '',
    });

    variantItems = [
        { value: 'text', display: 'Text' },
        { value: 'rect', display: 'Rectangle' },
        { value: 'circle', display: 'Circle' },
    ];

    animationItems = [
        { value: 'pulse', display: 'Pulse' },
        { value: 'wave', display: 'Wave' },
        { value: 'none', display: 'None' },
    ];

    generatedCode = computed(() => {
        const c = this.config();
        const props = [
            c.variant !== 'text' ? `variant="${c.variant}"` : '',
            c.animation !== 'pulse' ? `animation="${c.animation}"` : '',
            c.width && c.width !== '100%' ? `width="${c.width}"` : '',
            c.height ? `height="${c.height}"` : '',
            c.borderRadius ? `borderRadius="${c.borderRadius}"` : '',
        ].filter(Boolean).join('\n  ');

        return `<app-skeleton\n  ${props}>\n</app-skeleton>`;
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
