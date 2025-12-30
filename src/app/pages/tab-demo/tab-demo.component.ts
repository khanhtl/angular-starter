import { ButtonComponent } from '@angular-starter/ui/button';
import { TabComponent, TabItem } from '@angular-starter/ui/tab';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { ChevronLeft, ChevronRight, Code, Eye, EyeOff, Info, Layout, List, LucideAngularModule, Settings, User } from 'lucide-angular';

@Component({
    selector: 'app-tab-demo',
    standalone: true,
    imports: [CommonModule, FormsModule, TabComponent, ButtonComponent, LucideAngularModule],
    templateUrl: './tab-demo.component.html',

})
export class TabDemoComponent implements OnDestroy {
    readonly CodeIcon = Code;
    readonly EyeIcon = Eye;
    readonly EyeOffIcon = EyeOff;
    readonly LayoutIcon = Layout;
    readonly ListIcon = List;
    readonly SettingsIcon = Settings;
    readonly UserIcon = User;
    readonly InfoIcon = Info;
    readonly PrevIcon = ChevronLeft;
    readonly NextIcon = ChevronRight;

    @ViewChild('tabComp') tabComp!: TabComponent;
    @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;

    activeTab = signal<'preview' | 'api'>('preview');
    showCode = signal(false);
    editorView?: EditorView;

    // Demo Data
    simpleItems: TabItem[] = [
        { text: 'Dashboard', icon: Layout },
        { text: 'Users', icon: User },
        { text: 'Settings', icon: Settings },
        { text: 'Reports', icon: List, disabled: true },
        { text: 'About', icon: Info }
    ];

    // Config for Playground
    selectedIndex = signal(0);
    orientation = signal<'horizontal' | 'vertical'>('horizontal');

    generatedCode = computed(() => {
        const props = [
            `[items]="items"`,
            `[(selectedIndex)]="selectedIndex"`,
            this.orientation() === 'vertical' ? `orientation="vertical"` : ''
        ].filter(Boolean).join('\n  ');

        return `<app-tab\n  ${props}>\n</app-tab>`;
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

    onSelectionChanged(e: any) {
        console.log('Selection Changed:', e);
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

    // Imperative API calls
    goNext() {
        this.tabComp.next();
    }

    goPrev() {
        this.tabComp.prev();
    }
}
