import { ButtonComponent } from '@angular-starter/ui/button';
import { CheckBoxComponent } from '@angular-starter/ui/check-box';
import { AppInputComponent } from '@angular-starter/ui/input';
import { RadioGroupComponent, RadioGroupLayout } from '@angular-starter/ui/radio-group';
import { SelectBoxComponent } from '@angular-starter/ui/select-box';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { Code, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';

interface RadioGroupConfig {
    label: string;
    hint: string;
    errorText: string;
    required: boolean;
    layout: RadioGroupLayout;
    disabled: boolean;
    readonly: boolean;
    displayExpr: string;
    valueExpr: string;
}

@Component({
    selector: 'app-radio-group-demo',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RadioGroupComponent,
        LucideAngularModule,
        ButtonComponent,
        AppInputComponent,
        CheckBoxComponent,
        SelectBoxComponent
    ],
    templateUrl: './radio-group-demo.component.html',
    styles: [`
    .preview-container {
        padding: 3rem;
        background: var(--c-surface);
        border-radius: 1rem;
        border: 1px dashed var(--c-border);
        min-height: 240px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        overflow: hidden;
    }
    .preview-container::before {
        content: "PREVIEW";
        position: absolute;
        top: 12px;
        left: 12px;
        font-size: 10px;
        font-weight: 800;
        color: var(--c-tips);
        letter-spacing: 0.1em;
    }
    .custom-select, .custom-input {
        width: 100%;
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid var(--c-border);
        font-size: 0.875rem;
        color: var(--c-text);
        background-color: var(--c-surface);
        transition: all 0.2s;
    }
    .custom-select:focus, .custom-input:focus {
        outline: none;
        border-color: var(--c-brand);
        box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
    }
    .state-checkbox {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
        border-radius: 0.5rem;
        background: var(--c-bg);
        cursor: pointer;
        transition: all 0.2s;
    }
    .state-checkbox:hover {
        background: var(--c-hover-bg);
    }
    .value-card {
        background: var(--c-bg);
        border: 1px solid var(--c-border);
        padding: 1rem;
        border-radius: 0.75rem;
    }
  `]
})
export class RadioGroupDemoComponent implements OnDestroy {
    readonly CodeIcon = Code;
    readonly EyeIcon = Eye;
    readonly EyeOffIcon = EyeOff;

    activeTab = signal<'preview' | 'api'>('preview');
    selectedValue = signal<any>('standard');
    showCode = signal(false);

    @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
    editorView?: EditorView;

    layoutOptions = ['vertical', 'horizontal'];

    items = [
        { id: 'standard', name: 'Standard Delivery', price: 0, description: '3-5 business days' },
        { id: 'express', name: 'Express Delivery', price: 15, description: '1-2 business days' },
        { id: 'overnight', name: 'Overnight Delivery', price: 30, description: 'Next business day' },
        { id: 'pickup', name: 'Store Pickup', price: 0, description: 'Available in 2 hours', disabled: true }
    ];

    config = signal<RadioGroupConfig>({
        label: 'Delivery Method',
        hint: 'Select your preferred delivery option.',
        errorText: 'Please select a delivery method.',
        required: false,
        layout: 'vertical',
        disabled: false,
        readonly: false,
        displayExpr: 'name',
        valueExpr: 'id'
    });

    generatedCode = computed(() => {
        const c = this.config();
        const props = [
            c.label ? `label="${c.label}"` : '',
            c.hint ? `hint="${c.hint}"` : '',
            c.errorText ? `errorText="${c.errorText}"` : '',
            c.required ? '[required]="true"' : '',
            `[items]="deliveryItems"`,
            `[(ngModel)]="selectedValue"`,
            c.layout !== 'vertical' ? `layout="${c.layout}"` : '',
            c.displayExpr ? `displayExpr="${c.displayExpr}"` : '',
            c.valueExpr ? `valueExpr="${c.valueExpr}"` : '',
            c.disabled ? '[disabled]="true"' : '',
            c.readonly ? '[readonly]="true"' : ''
        ].filter(Boolean).join('\n  ');

        return `<app-radio-group\n  ${props}>\n  <ng-template itemTemplate let-item>\n    ...\n  </ng-template>\n</app-radio-group>`;
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
