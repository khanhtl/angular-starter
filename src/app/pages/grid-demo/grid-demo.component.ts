import { ButtonComponent } from '@angular-starter/ui/button';
import { CellTemplateDirective, ColumnConfig, DataGridComponent } from '@angular-starter/ui/data-grid';
import { AppInputComponent } from '@angular-starter/ui/input';
import { RadioGroupComponent } from '@angular-starter/ui/radio-group';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { Code, Eye, EyeOff, LucideAngularModule, Pencil, Settings } from 'lucide-angular';

@Component({
    selector: 'app-grid-demo',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DataGridComponent,
        CellTemplateDirective,
        ButtonComponent,
        AppInputComponent,
        RadioGroupComponent,
        LucideAngularModule
    ],
    templateUrl: './grid-demo.component.html',
    styles: [`
    .grid-scroll-container {
      width: 100%;
      overflow-x: auto;
      background: var(--c-surface);
      border-radius: var(--w-radius);
      border: 1px solid var(--c-border);
    }
    .preview-area {
        display: block;
        padding: 0;
        min-height: 600px;
    }
    .code-section {
        margin-top: 1.5rem;
    }
    .code-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
        padding: 0 1rem;

        h3 {
            margin: 0;
            font-size: 1rem;
            color: var(--c-text-muted);
        }
    }
    .code-editor-container {
        border: 1px solid var(--c-border);
        border-radius: var(--w-radius);
        overflow: hidden;
        margin: 0 1rem;
    }
    .demo-note {
        padding: 1rem;
        background: var(--c-surface);
        border-radius: var(--w-radius);
        border: 1px dashed var(--c-border);
        margin-top: 2rem;
        p {
            margin: 0;
            font-size: 0.8rem;
            color: var(--c-text-muted);
            font-style: italic;
        }
    }
    @media (max-width: 1200px) {
      .controls-panel {
        position: static;
      }
    }
    .controls-panel {
      position: sticky;
      top: 2rem;
      
      h3 {
        margin-top: 0;
        margin-bottom: 1rem;
        font-size: 1.1rem;
      }
    }
    .status-badge {
      padding: 4px 10px;
      border-radius: 99px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      &.active { background: var(--c-success-light); color: var(--c-success); }
      &.inactive { background: var(--c-error-light); color: var(--c-error); }
      &.pending { background: var(--c-warning-light); color: var(--c-warning); }
      &.on-leave { background: var(--c-surface-variant); color: var(--c-text-muted); }
    }
  `]
})
export class GridDemoComponent implements OnDestroy {
    readonly Pencil = Pencil;
    readonly Settings = Settings;
    readonly CodeIcon = Code;
    readonly EyeIcon = Eye;
    readonly EyeOffIcon = EyeOff;

    activeTab = signal<'preview' | 'api'>('preview');

    // CodeMirror
    showCode = signal(false);
    @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
    editorView?: EditorView;

    // Grid Config
    config = signal({
        height: '600px',
        loading: false,
        useNested: true,
    });

    headerTypes = [
        { label: 'Nested (Grouped)', value: true },
        { label: 'Flat (Single Level)', value: false }
    ];

    // Base Data
    data = signal<Record<string, any>[]>(this.generateSampleData());

    // Columns Computed
    columns = computed<ColumnConfig[]>(() => {
        const c = this.config();

        if (c.useNested) {
            return [
                { key: 'id', title: 'ID', width: '100px', align: 'center', pinned: 'left' as const, pinnable: true },
                {
                    key: 'personal',
                    title: 'Personal Info',
                    align: 'center',
                    pinnable: true,
                    children: [
                        { key: 'name', title: 'Full Name', width: '150px' },
                        { key: 'email', title: 'Email', width: '200px' },
                        { key: 'phone', title: 'Phone', width: '250px' }
                    ]
                },
                {
                    key: 'work',
                    title: 'Work Details',
                    align: 'center',
                    pinnable: true,
                    children: [
                        { key: 'department', title: 'Department', width: '150px' },
                        { key: 'role', title: 'Position', width: '120px' },
                        { key: 'salary', title: 'Salary', width: '120px', align: 'right' as const }
                    ]
                },
                {
                    key: 'employment',
                    title: 'Employment Info',
                    align: 'center',
                    pinnable: true,
                    children: [
                        { key: 'startDate', title: 'Start Date', width: '120px' },
                        { key: 'location', title: 'Location', width: '150px' },
                        { key: 'manager', title: 'Manager', width: '150px' },
                        { key: 'projects', title: 'Projects', width: '100px', align: 'center' as const }
                    ]
                },
                { key: 'status', cellTemplate: 'cell-status', title: 'Status', width: '150px', align: 'center' as const, pinned: 'right' as const },
                { key: 'actions', title: 'Actions', width: '120px', align: 'center' as const, pinned: 'right' as const, pinnable: false }
            ];
        }

        // Flat version for variety
        return [
            { key: 'id', title: 'ID', width: '100px', align: 'center', pinned: 'left' as const },
            { key: 'name', title: 'Full Name', width: '200px' },
            { key: 'email', title: 'Email', width: '250px' },
            { key: 'department', title: 'Department', width: '150px' },
            { key: 'role', title: 'Position', width: '150px' },
            { key: 'status', cellTemplate: 'cell-status', title: 'Status', width: '120px', align: 'center' as const, pinned: 'right' as const },
            { key: 'actions', title: 'Actions', width: '120px', align: 'center' as const, pinned: 'right' as const, cellTemplate: 'cell-actions' }
        ];
    });

    // Generated Code Computed
    generatedCode = computed(() => {
        const c = this.config();
        return `<app-data-grid
  [data]="data"
  [columns]="columns"
  [height]="'${c.height}'"
  [loading]="${c.loading}">

  <ng-template appCellTemplate="cell-status" let-value="value">
    <span class="status-badge" [class]="value.toLowerCase().replace(' ', '-')">{{ value }}</span>
  </ng-template>

  <ng-template appCellTemplate="cell-actions">
    <app-button variant="ghost" size="sm">
       <i-lucide [img]="Pencil" [size]="14"></i-lucide>
    </app-button>
  </ng-template>

</app-data-grid>`;
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
                    "&": { height: "auto", maxHeight: "400px", fontSize: "14px", backgroundColor: "#f8fafc" },
                    ".cm-scroller": { overflow: "auto" },
                    ".cm-gutters": { backgroundColor: "#f1f5f9", borderRight: "1px solid #e2e8f0" }
                })
            ],
            parent: this.codeEditorRef.nativeElement
        });
    }

    private generateSampleData() {
        const departments = ['Kỹ thuật', 'Thiết kế', 'Marketing', 'Bán hàng', 'Nhân sự', 'Tài chính', 'Vận hành'];
        const roles = ['Lập trình viên', 'Thiết kế', 'Quản lý', 'Kiểm thử', 'Phân tích', 'Tư vấn', 'Chuyên gia'];
        const statuses = ['Đang làm việc', 'Đã nghỉ', 'Chờ duyệt', 'Nghỉ phép'];
        const locations = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
        const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'];
        const lastNames = ['Anh', 'Bình', 'Chi', 'Dũng', 'Em', 'Giang', 'Hương', 'Inh', 'Khánh', 'Linh'];

        return Array.from({ length: 50 }, (_, i) => {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

            return {
                id: i + 1,
                name: `${firstName} ${lastName}`,
                email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
                phone: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
                department: departments[Math.floor(Math.random() * departments.length)],
                role: roles[Math.floor(Math.random() * roles.length)],
                salary: `$${(Math.floor(Math.random() * 100) + 50) * 1000}`,
                startDate: new Date(
                    2020 + Math.floor(Math.random() * 4),
                    Math.floor(Math.random() * 12),
                    Math.floor(Math.random() * 28) + 1
                ).toLocaleDateString(),
                location: locations[Math.floor(Math.random() * locations.length)],
                manager: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
                projects: Math.floor(Math.random() * 10) + 1,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                actions: 'Edit | Delete'
            };
        });
    }

    toggleLoading() {
        this.updateConfig('loading', true);
        setTimeout(() => {
            this.updateConfig('loading', false);
        }, 2000);
    }

    ngOnDestroy() {
        this.editorView?.destroy();
    }
}
