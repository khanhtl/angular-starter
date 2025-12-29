import { ButtonComponent } from '@angular-starter/ui/button';
import { CheckBoxComponent, CheckBoxValue } from '@angular-starter/ui/check-box';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { Code, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';

interface CheckBoxConfig {
    text: string;
    label: string;
    hint: string;
    errorText: string;
    required: boolean;
    value: CheckBoxValue;
    disabled: boolean;
    readonly: boolean;
    allowIndeterminate: boolean;
}

@Component({
    selector: 'app-check-box-demo',
    standalone: true,
    imports: [CommonModule, FormsModule, CheckBoxComponent, LucideAngularModule, ButtonComponent],
    templateUrl: './check-box-demo.component.html',
    styles: [`
    .playground-grid {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 2rem;
      align-items: start;
    }
  `]
})
export class CheckBoxDemoComponent implements OnDestroy {
    readonly CodeIcon = Code;
    readonly EyeIcon = Eye;
    readonly EyeOffIcon = EyeOff;

    activeTab = signal<'preview' | 'api'>('preview');
    showCode = signal(false);
    @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
    editorView?: EditorView;

    // Playground Config
    config = signal<CheckBoxConfig>({
        text: 'Check Me',
        label: 'Terms & Conditions',
        hint: 'You must agree to the terms to proceed.',
        errorText: 'Please accept the terms.',
        required: false,
        value: false,
        disabled: false,
        readonly: false,
        allowIndeterminate: false,
    });

    generatedCode = computed(() => {
        const c = this.config();
        const props = [
            c.label ? `label="${c.label}"` : '',
            c.text ? `text="${c.text}"` : '',
            c.hint ? `hint="${c.hint}"` : '',
            c.errorText ? `errorText="${c.errorText}"` : '',
            c.required ? '[required]="true"' : '',
            c.allowIndeterminate ? '[allowIndeterminate]="true"' : '',
            c.disabled ? '[disabled]="true"' : '',
            c.readonly ? '[readonly]="true"' : '',
            `[(ngModel)]="value"`
        ].filter(Boolean).join('\n  ');

        return `<app-check-box\n  ${props}>\n</app-check-box>`;
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
