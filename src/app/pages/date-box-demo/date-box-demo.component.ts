import { ButtonComponent } from '@angular-starter/ui/button';
import { DateBoxComponent } from '@angular-starter/ui/date-box';
import { AppInputComponent } from '@angular-starter/ui/input';
import { SelectBoxComponent } from '@angular-starter/ui/select-box';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { Calendar, Code, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-date-box-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DateBoxComponent,
    ButtonComponent,
    LucideAngularModule,
    AppInputComponent,
    SelectBoxComponent
  ],
  templateUrl: './date-box-demo.component.html',

})
export class DateBoxDemoComponent implements OnDestroy {
  readonly CodeIcon = Code;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly CalendarIcon = Calendar;

  activeTab = signal<'preview' | 'api'>('preview');

  // Controls
  dateControl = new FormControl(new Date());

  // CodeMirror
  showCode = signal(false);
  @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
  editorView?: EditorView;

  typeOptions = [
    { value: 'date', text: 'Date' },
    { value: 'time', text: 'Time' },
    { value: 'datetime', text: 'Date Time' }
  ];

  // Playground Config
  config = signal({
    label: 'Select Date',
    placeholder: '',
    type: 'date' as 'date' | 'time' | 'datetime'
  });

  formattedValue = computed(() => {
    const val = this.dateControl.value;
    if (!val) return 'None';
    const type = this.config().type;
    if (type === 'time') {
      const h = val.getHours().toString().padStart(2, '0');
      const m = val.getMinutes().toString().padStart(2, '0');
      return `${h}:${m}`;
    }
    if (type === 'datetime') {
      const d = val.getDate().toString().padStart(2, '0');
      const mo = (val.getMonth() + 1).toString().padStart(2, '0');
      const y = val.getFullYear();
      const h = val.getHours().toString().padStart(2, '0');
      const m = val.getMinutes().toString().padStart(2, '0');
      return `${d}/${mo}/${y} ${h}:${m}`;
    }
    const d = val.getDate().toString().padStart(2, '0');
    const mo = (val.getMonth() + 1).toString().padStart(2, '0');
    const y = val.getFullYear();
    return `${d}/${mo}/${y}`;
  });

  generatedCode = computed(() => {
    const c = this.config();
    const props = [
      c.label ? `label="${c.label}"` : '',
      c.placeholder ? `placeholder="${c.placeholder}"` : '',
      c.type !== 'date' ? `type="${c.type}"` : '',
      '[formControl]="control"'
    ].filter(Boolean).join('\n  ');

    return `<app-date-box\n  ${props}>\n</app-date-box>`;
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
