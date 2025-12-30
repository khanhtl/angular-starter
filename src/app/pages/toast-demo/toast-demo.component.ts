import { ButtonComponent } from '@angular-starter/ui/button';
import { CheckBoxComponent } from '@angular-starter/ui/check-box';
import { AppInputComponent } from '@angular-starter/ui/input';
import { SelectBoxComponent } from '@angular-starter/ui/select-box';
import { ToastPosition, ToastService, ToastType } from '@angular-starter/ui/toast';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { Bell, Code, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';

interface ToastDemoConfig {
    message: string;
    type: ToastType;
    position: ToastPosition;
    displayTime: number;
    showCloseButton: boolean;
    width: string;
}

@Component({
    selector: 'app-toast-demo',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonComponent,
        AppInputComponent,
        SelectBoxComponent,
        CheckBoxComponent,
        LucideAngularModule
    ],
    templateUrl: './toast-demo.component.html'
})
export class ToastDemoComponent {
    private readonly toastService = inject(ToastService);

    readonly CodeIcon = Code;
    readonly EyeIcon = Eye;
    readonly EyeOffIcon = EyeOff;
    readonly BellIcon = Bell;

    activeTab = signal<'preview' | 'api'>('preview');
    showCode = signal(false);
    @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
    editorView?: EditorView;

    config = signal<ToastDemoConfig>({
        message: 'This is a premium toast message!',
        type: 'success',
        position: 'bottom-center',
        displayTime: 3000,
        showCloseButton: true,
        width: '320px'
    });

    typeOptions = [
        { value: 'info', displayValue: 'Info' },
        { value: 'success', displayValue: 'Success' },
        { value: 'warning', displayValue: 'Warning' },
        { value: 'error', displayValue: 'Error' }
    ];

    positionOptions = [
        { value: 'top-left', displayValue: 'Top Left' },
        { value: 'top-center', displayValue: 'Top Center' },
        { value: 'top-right', displayValue: 'Top Right' },
        { value: 'bottom-left', displayValue: 'Bottom Left' },
        { value: 'bottom-center', displayValue: 'Bottom Center' },
        { value: 'bottom-right', displayValue: 'Bottom Right' },
        { value: 'center', displayValue: 'Center' }
    ];

    generatedCode = computed(() => {
        const c = this.config();
        return `// Inject ToastService
const toastService = inject(ToastService);

// Show toast
toastService.show({
  message: '${c.message}',
  type: '${c.type}',
  position: '${c.position}',
  displayTime: ${c.displayTime},
  showCloseButton: ${c.showCloseButton},
  width: '${c.width}'
});`;
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
        this.config.update(c => ({ ...c, [key]: value }));
    }

    showToast() {
        this.toastService.show(this.config());
    }

    showSuccess() {
        this.toastService.success('Operation completed successfully!');
    }

    showError() {
        this.toastService.error('An error occurred while saving.');
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
