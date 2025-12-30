import { ButtonComponent } from '@angular-starter/ui/button';
import { CheckBoxComponent } from '@angular-starter/ui/check-box';
import { TextareaComponent } from '@angular-starter/ui/textarea';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { Code, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';

interface TextareaConfig {
    value: string;
    label: string;
    placeholder: string;
    hint: string;
    errorText: string;
    required: boolean;
    disabled: boolean;
    readonly: boolean;
    autoResize: boolean;
    spellcheck: boolean;
    maxLength: number | null;
    height: number | string;
}

@Component({
    selector: 'app-textarea-demo',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TextareaComponent,
        LucideAngularModule,
        ButtonComponent,
        CheckBoxComponent
    ],
    templateUrl: './textarea-demo.component.html',

})
export class TextareaDemoComponent implements OnDestroy {
    readonly CodeIcon = Code;
    readonly EyeIcon = Eye;
    readonly EyeOffIcon = EyeOff;

    activeTab = signal<'preview' | 'api'>('preview');
    showCode = signal(false);
    @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
    editorView?: EditorView;

    // Playground Config
    config = signal<TextareaConfig>({
        value: 'Hello World',
        label: 'Bio',
        placeholder: 'Enter text here...',
        hint: 'Give us a brief description of yourself.',
        errorText: 'This field is required.',
        required: false,
        disabled: false,
        readonly: false,
        autoResize: true,
        spellcheck: true,
        maxLength: 500,
        height: 100
    });

    generatedCode = computed(() => {
        const c = this.config();
        const props = [
            c.label ? `label="${c.label}"` : '',
            c.placeholder ? `placeholder="${c.placeholder}"` : '',
            c.hint ? `hint="${c.hint}"` : '',
            c.errorText ? `errorText="${c.errorText}"` : '',
            c.required ? '[required]="true"' : '',
            c.disabled ? '[disabled]="true"' : '',
            c.readonly ? '[readonly]="true"' : '',
            c.autoResize ? '[autoResize]="true"' : '',
            !c.spellcheck ? '[spellcheck]="false"' : '',
            c.maxLength ? `[maxLength]="${c.maxLength}"` : '',
            !c.autoResize && c.height ? `[height]="${c.height}"` : '',
            `[(ngModel)]="value"`
        ].filter(Boolean).join('\n  ');

        return `<app-textarea\n  ${props}>\n</app-textarea>`;
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
