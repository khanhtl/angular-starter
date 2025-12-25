import { ButtonComponent, ButtonSize, ButtonVariant, DropdownItem } from '@angular-starter/ui/button';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { ArrowRight, Code, Eye, EyeOff, LucideAngularModule, Save, Send, Trash2 } from 'lucide-angular';

interface ButtonConfig {
  text: string;
  variant: ButtonVariant;
  size: ButtonSize;
  loading: boolean;
  disabled: boolean;
  ripple: boolean;
  showIcon: boolean;
  dropdown: boolean;
  split: boolean;
}

@Component({
  selector: 'app-button-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, LucideAngularModule],
  templateUrl: './button-demo.component.html',
  styles: [`
    .playground-grid {
      display: grid;
      grid-template-columns: 1fr 300px;
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
  `]
})
export class ButtonDemoComponent implements OnDestroy {
  readonly CodeIcon = Code;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly SendIcon = Send;
  readonly SaveIcon = Save;
  readonly TrashIcon = Trash2;
  readonly ArrowIcon = ArrowRight;

  activeTab = signal<'preview' | 'api'>('preview');
  isLoading = signal(false);

  // CodeMirror
  showCode = signal(false);
  @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
  editorView?: EditorView;

  // Playground Config
  config = signal<ButtonConfig>({
    text: 'Click Me',
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    ripple: true,
    showIcon: false,
    dropdown: false,
    split: false
  });

  mockItems: DropdownItem[] = [
    { label: 'Profile', click: () => console.log('Profile clicked') },
    { label: 'Settings', click: () => console.log('Settings clicked') },
    { label: 'Logout', click: () => console.log('Logout clicked') }
  ];

  generatedCode = computed(() => {
    const c = this.config();
    const props = [
      c.variant !== 'primary' ? `variant="${c.variant}"` : '',
      c.size !== 'md' ? `size="${c.size}"` : '',
      c.loading ? '[loading]="true"' : '',
      c.disabled ? 'disabled' : '',
      !c.ripple ? '[ripple]="false"' : '',
      c.dropdown ? 'dropdown' : '',
      c.split ? 'split' : '',
      (c.dropdown || c.split) ? '[items]="myItems"' : ''
    ].filter(Boolean).join('\n  ');

    const iconSnippet = c.showIcon ? `\n  <i-lucide [img]="SendIcon" [size]="16" style="margin-right: 8px"></i-lucide>` : '';
    const content = c.size === 'icon' ? `\n  <i-lucide [img]="SendIcon" [size]="18"></i-lucide>` : `\n  ${iconSnippet}${c.text}`;

    return `<app-button\n  ${props}>\n  ${content}\n</app-button>`;
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

  toggleLoading() {
    this.isLoading.set(true);
    setTimeout(() => this.isLoading.set(false), 2000);
  }

  ngOnDestroy() {
    this.editorView?.destroy();
  }
}
