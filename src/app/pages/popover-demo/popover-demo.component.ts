
import { ButtonComponent } from '@angular-starter/ui/button';
import { CheckBoxComponent } from '@angular-starter/ui/check-box';
import { AppInputComponent } from '@angular-starter/ui/input';
import { PopoverComponent } from '@angular-starter/ui/popover';
import { SelectBoxComponent } from '@angular-starter/ui/select-box';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { Code, Eye, EyeOff, Info, LucideAngularModule, Settings } from 'lucide-angular';

@Component({
    selector: 'app-popover-demo',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        PopoverComponent,
        ButtonComponent,
        AppInputComponent,
        SelectBoxComponent,
        CheckBoxComponent,
        LucideAngularModule
    ],
    templateUrl: './popover-demo.component.html',
    styles: [`
    .demo-area {
        height: 400px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--c-bg);
        border: 1px solid var(--c-border);
        border-radius: var(--w-radius);
        position: relative;
    }

    .target-element {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 24px;
        background: var(--c-surface);
        border: 1px solid var(--c-border);
        border-radius: var(--w-radius-sm);
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        transition: all 0.2s;
        
        &:hover {
            border-color: var(--c-brand);
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
    }
  `]
})
export class PopoverDemoComponent implements OnDestroy, AfterViewInit {
    // Icons
    readonly EyeIcon = Eye;
    readonly EyeOffIcon = EyeOff;
    readonly CodeIcon = Code;
    readonly InfoIcon = Info;
    readonly SettingsIcon = Settings;

    activeTab = signal<'preview' | 'api'>('preview');
    showCode = signal(false);

    // Playground Config
    popoverVisible = signal(false);
    position = signal<'top' | 'bottom' | 'left' | 'right'>('bottom');
    shading = signal(false);
    showCloseButton = signal(true);
    title = signal('Popover Title');
    closeOnOutsideClick = signal(true);
    width = signal<string | number>('300px');

    positionOptions = [
        { id: 'top', text: 'Top' },
        { id: 'bottom', text: 'Bottom' },
        { id: 'left', text: 'Left' },
        { id: 'right', text: 'Right' }
    ];

    @ViewChild('popoverTrigger', { read: ElementRef }) triggerRef!: ElementRef;

    // Target signal for the popover
    targetEl = signal<HTMLElement | undefined>(undefined);

    @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
    editorView?: EditorView;

    generatedCode = computed(() => {
        return `<app-popover
  [target]="triggerEl"
  [(visible)]="isVisible"
  position="${this.position()}"
  [shading]="${this.shading()}"
  [showCloseButton]="${this.showCloseButton()}"
  title="${this.title()}"
  [closeOnOutsideClick]="${this.closeOnOutsideClick()}"
  width="${this.width()}">
  
  <p>This is the content of the popover.</p>
  <p>It can contain any HTML or Angular components.</p>
</app-popover>

<!-- Target Element (using ViewChild with read: ElementRef) -->
<app-button #popoverTrigger (click)="isVisible = !isVisible">
  Click me to toggle Popover
</app-button>`;
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

    togglePopover() {
        this.popoverVisible.update(v => !v);
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
                    "&": { height: "auto", maxHeight: "400px", fontSize: "14px", backgroundColor: "var(--c-bg)" },
                    ".cm-scroller": { overflow: "auto" },
                    ".cm-gutters": { backgroundColor: "var(--c-surface)", borderRight: "1px solid var(--c-border)", color: "var(--c-tips)" }
                })
            ],
            parent: this.codeEditorRef.nativeElement
        });
    }

    ngAfterViewInit() {
        // Capture the button element once the view is initialized
        if (this.triggerRef) {
            this.targetEl.set(this.triggerRef.nativeElement);
        }
    }

    ngOnDestroy() {
        this.editorView?.destroy();
    }
}
