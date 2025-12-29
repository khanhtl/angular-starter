
import { ButtonComponent } from '@angular-starter/ui/button';
import { AppInputComponent } from '@angular-starter/ui/input';
import { PopoverComponent } from '@angular-starter/ui/popover';
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
        LucideAngularModule
    ],
    templateUrl: './popover-demo.component.html',
    styles: [`
    .playground-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 2rem;
      align-items: start;
    }
    .controls-panel {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid #e2e8f0;
    }
    .control-group {
      margin-bottom: 1.25rem;
    }
    .control-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 0.5rem;
    }
    .control-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    
    .demo-area {
        height: 400px;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #f1f5f9;
        border-radius: 8px;
        position: relative;
    }

    .target-element {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 24px;
        background: white;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        transition: all 0.2s;
        
        &:hover {
            border-color: #94a3b8;
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
                    "&": { height: "auto", maxHeight: "400px", fontSize: "14px", backgroundColor: "#f8fafc" },
                    ".cm-scroller": { overflow: "auto" },
                    ".cm-gutters": { backgroundColor: "#f1f5f9", borderRight: "1px solid #e2e8f0" }
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
