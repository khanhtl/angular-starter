import { CalendarComponent, CalendarEvent } from '@angular-starter/calendar';
import { ButtonComponent } from '@angular-starter/ui/button';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { Code, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-calendar-demo',
    standalone: true,
    imports: [CommonModule, FormsModule, CalendarComponent, ButtonComponent, LucideAngularModule],
    templateUrl: './calendar-demo.component.html',
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
export class CalendarDemoComponent implements OnDestroy {
    readonly CodeIcon = Code;
    readonly EyeIcon = Eye;
    readonly EyeOffIcon = EyeOff;

    activeTab = signal<'preview' | 'api'>('preview');
    selectedDate = signal<Date | null>(new Date());

    // CodeMirror
    showCode = signal(false);
    @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
    editorView?: EditorView;

    // Playground Config
    config = signal({
        showHeader: true,
        showFooter: true,
        showEvents: true
    });

    events: CalendarEvent[] = [
        { date: new Date(), title: 'Meeting Today', color: 'var(--c-brand)' },
        { date: new Date(new Date().setDate(new Date().getDate() + 2)), title: 'Deadline', color: '#ef4444' },
        { date: new Date(new Date().setDate(new Date().getDate() - 3)), title: 'Birthday', color: '#f59e0b' },
    ];

    generatedCode = computed(() => {
        const c = this.config();
        const props = [
            !c.showHeader ? '[showHeader]="false"' : '',
            !c.showFooter ? '[showFooter]="false"' : '',
            c.showEvents ? '[events]="events"' : '',
            '[(value)]="selectedDate"'
        ].filter(Boolean).join('\n  ');

        return `<app-calendar\n  ${props}>\n</app-calendar>`;
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
