import { ButtonComponent } from '@angular-starter/ui/button';
import { DateRangeComponent } from '@angular-starter/ui/date-range';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { Code, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-date-range-demo',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DateRangeComponent, ButtonComponent, LucideAngularModule],
  templateUrl: './date-range-demo.component.html',
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
export class DateRangeDemoComponent implements OnDestroy {
  readonly CodeIcon = Code;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  activeTab = signal<'preview' | 'api'>('preview');

  // Controls
  rangeControl = new FormControl<[Date | null, Date | null]>([
    new Date(),
    new Date(new Date().setDate(new Date().getDate() + 7))
  ]);

  // CodeMirror
  showCode = signal(false);
  @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
  editorView?: EditorView;

  // Playground Config
  config = signal({
    label: 'Reservation Period',
    startPlaceholder: 'Start date',
    endPlaceholder: 'End date',
    disabled: false
  });

  generatedCode = computed(() => {
    const c = this.config();
    const props = [
      c.label ? `label="${c.label}"` : '',
      c.startPlaceholder !== 'Start date' ? `startPlaceholder="${c.startPlaceholder}"` : '',
      c.endPlaceholder !== 'End date' ? `endPlaceholder="${c.endPlaceholder}"` : '',
      c.disabled ? 'disabled' : '',
      '[formControl]="control"'
    ].filter(Boolean).join('\n  ');

    return `<app-date-range\n  ${props}>\n</app-date-range>`;
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
