import { ButtonComponent } from '@angular-starter/ui/button';
import { CheckBoxComponent } from '@angular-starter/ui/check-box';
import { AppInputComponent } from '@angular-starter/ui/input';
import { PaginationComponent } from '@angular-starter/ui/pagination';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { Code, Eye, EyeOff, Info, LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'app-pagination-demo',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        PaginationComponent,
        AppInputComponent,
        ButtonComponent,
        CheckBoxComponent,
        LucideAngularModule
    ],
    templateUrl: './pagination-demo.component.html',

})
export class PaginationDemoComponent implements OnDestroy {
    readonly EyeIcon = Eye;
    readonly EyeOffIcon = EyeOff;
    readonly CodeIcon = Code;
    readonly InfoIcon = Info;

    activeTab = signal<'preview' | 'api'>('preview');
    showCode = signal(false);

    // Pagination Config
    totalCount = signal(100);
    pageSize = signal(10);
    pageIndex = signal(1);
    visiblePages = signal(5);
    showPageSizeSelector = signal(true);
    showInfo = signal(true);
    showNavigationButtons = signal(true);

    @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
    editorView?: EditorView;

    generatedCode = computed(() => {
        return `<app-pagination
  [totalCount]="${this.totalCount()}"
  [pageSize]="${this.pageSize()}"
  [pageIndex]="${this.pageIndex()}"
  [visiblePages]="${this.visiblePages()}"
  [showPageSizeSelector]="${this.showPageSizeSelector()}"
  [showInfo]="${this.showInfo()}"
  [showNavigationButtons]="${this.showNavigationButtons()}"
  (pageChange)="onPageChange($event)">
</app-pagination>`;
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

    onPageChange(event: { pageIndex: number, pageSize: number }) {
        this.pageIndex.set(event.pageIndex);
        this.pageSize.set(event.pageSize);
        console.log('Page changed:', event);
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

    ngOnDestroy() {
        this.editorView?.destroy();
    }
}
