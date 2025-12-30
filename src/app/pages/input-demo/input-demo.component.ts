
import { ButtonComponent } from '@angular-starter/ui/button';
import { AppInputComponent } from '@angular-starter/ui/input';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { Calendar, Code, CreditCard, DollarSign, Eye, EyeOff, Lock, LucideAngularModule, Mail, Phone, Search, User } from 'lucide-angular';

@Component({
  selector: 'app-input-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AppInputComponent, LucideAngularModule, ButtonComponent],
  templateUrl: './input-demo.component.html',
  styles: [`
    .value-display {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #f1f5f9;
      border-radius: 0.5rem;
      font-family: monospace;
      font-size: 0.875rem;
      color: #334155;
      border: 1px solid #e2e8f0;
    }
    .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.5rem;
    }
  `]
})
export class InputDemoComponent implements OnDestroy {
  activeTab = signal<'preview' | 'api'>('preview');

  // Icons
  UserIcon = User;
  MailIcon = Mail;
  PhoneIcon = Phone;
  CalendarIcon = Calendar;
  CreditCardIcon = CreditCard;
  LockIcon = Lock;
  DollarIcon = DollarSign;
  SearchIcon = Search;
  CodeIcon = Code;
  EyeIcon = Eye;
  EyeOffIcon = EyeOff;

  // CodeMirror
  showCode = signal(false);
  @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
  editorView?: EditorView;

  // Playground Config
  config = signal({
    label: 'Ô nhập liệu thử nghiệm',
    placeholder: 'Nhập nội dung...',
    hint: 'Đây là văn bản gợi ý',
    disabled: false,
    readonly: false,
    required: false,
    clearable: true,
    errorText: 'Trường này không hợp lệ',
    type: 'text'
  });

  updateConfig(key: string, value: any) {
    this.config.update((c: any) => ({ ...c, [key]: value }));
  }

  // Playground Control
  playgroundControl = new FormControl('');

  // Showcase Controls
  showcaseForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl(''),
    phone: new FormControl(''),
    currency: new FormControl(''),
    date: new FormControl(''),
    creditCard: new FormControl(''),
    licensePlate: new FormControl('59-F1 123.45'),
    search: new FormControl('')
  });

  generatedCode = computed(() => {
    const c = this.config();
    const props = [
      c.label ? `label="${c.label}"` : '',
      c.placeholder ? `placeholder="${c.placeholder}"` : '',
      c.hint ? `hint="${c.hint}"` : '',
      c.type !== 'text' ? `type="${c.type}"` : '',
      c.disabled ? 'disabled' : '',
      c.readonly ? 'readonly' : '',
      c.clearable ? 'clearable' : '',
      c.required ? 'required' : '',
      '[formControl]="control"'
    ].filter(Boolean).join('\n  ');

    return `<app-input\n  ${props}>\n</app-input>`;
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
