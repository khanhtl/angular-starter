import { ButtonComponent } from '@angular-starter/ui/button';
import { CellTemplateDirective, ColumnConfig, DataGridComponent } from '@angular-starter/ui/data-grid';
import { registerApiDemoPopup, registerConfirmPopup, registerUserFormPopup, SharedPopupMap, UserFormData } from '@angular-starter/ui/dialogs';
import { PopupService } from '@angular-starter/ui/popup';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { ExternalLink, Eye, EyeOff, LucideAngularModule, Pencil, Plus, RefreshCcw, Search, Trash2 } from 'lucide-angular';

@Component({
    selector: 'app-popup-demo',
    standalone: true,
    imports: [
        CommonModule,
        LucideAngularModule,
        ButtonComponent,
        DataGridComponent,
        CellTemplateDirective
    ],
    templateUrl: './popup-demo.component.html'
})
export class PopupDemoComponent implements OnDestroy {
    private popupService = inject(PopupService<SharedPopupMap>);

    // Icons
    readonly PlusIcon = Plus;
    readonly PencilIcon = Pencil;
    readonly TrashIcon = Trash2;
    readonly RefreshIcon = RefreshCcw;
    readonly ExternalIcon = ExternalLink;
    readonly EyeIcon = Eye;
    readonly EyeOffIcon = EyeOff;
    readonly SearchIcon = Search;

    // Registration cleanup
    private unregistrations: (() => void)[] = [
        registerConfirmPopup(),
        registerUserFormPopup(),
        registerApiDemoPopup()
    ];

    activeTab = signal<'preview' | 'api'>('preview');
    showCode = signal(false);
    lastResult = signal<any>(null);
    loading = signal(false);

    @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
    editorView?: EditorView;

    // Grid Data
    users = signal<UserFormData[]>([
        { id: '1', name: 'James Wilson', email: 'james.w@example.com', role: 'admin' },
        { id: '2', name: 'Sarah Connor', email: 'sarah.c@sky.net', role: 'editor' },
        { id: '3', name: 'John Doe', email: 'john.doe@gmail.com', role: 'user' },
        { id: '4', name: 'Jane Smith', email: 'jane.smith@apple.com', role: 'editor' }
    ]);

    // Grid Columns
    columns: ColumnConfig[] = [
        { key: 'id', title: 'ID', width: '80px', align: 'center' },
        { key: 'name', title: 'Full Name', width: '200px' },
        { key: 'email', title: 'Email Address', width: '250px' },
        { key: 'role', title: 'User Role', width: '150px', cellTemplate: 'role-cell' },
        { key: 'actions', title: 'Actions', width: '120px', align: 'center', cellTemplate: 'actions-cell', pinned: 'right' }
    ];

    generatedCode = signal<string>(`// Professional CRUD with PopupService
const result = await this.popupService.openAndWait('ui.user-form', {
  data: candidateData,
  width: '500px'
});

if (result) {
  this.users.update(list => [...list, result]);
}`);

    async openCreateForm() {
        this.generatedCode.set(`// Create new user
const result = await this.popupService.openAndWait('ui.user-form', {
  data: {}, // Empty for create
  width: '600px'
});`);

        const result = await this.popupService.openAndWait('ui.user-form', {
            data: {},
            width: '600px'
        });

        if (result) {
            const newUser = { ...result, id: String(this.users().length + 1) };
            this.users.update(list => [...list, newUser]);
            this.lastResult.set({ action: 'created', data: newUser });
        }
    }

    async openEditForm(user: UserFormData) {
        this.generatedCode.set(`// Edit existing user
const result = await this.popupService.openAndWait('ui.user-form', {
  data: { ...user }, // Pre-fill data
  width: '600px'
});`);

        const result = await this.popupService.openAndWait('ui.user-form', {
            data: { ...user },
            width: '600px'
        });

        if (result) {
            this.users.update(list => list.map(u => u.id === user.id ? result : u));
            this.lastResult.set({ action: 'updated', data: result });
        }
    }

    async confirmDelete(user: UserFormData) {
        const result = await this.popupService.openAndWait('ui.confirm', {
            data: {
                title: 'Remove User',
                message: `Are you sure you want to delete <strong>${user.name}</strong>? This action cannot be undone.`,
                okText: 'Delete Now',
                cancelText: 'Keep User'
            }
        });

        if (result?.confirmed) {
            this.users.update(list => list.filter(u => u.id !== user.id));
            this.lastResult.set({ action: 'deleted', id: user.id });
        }
    }

    async simulateSync() {
        this.loading.set(true);
        await this.popupService.openAndWait('ui.api-demo', {
            data: { title: 'User Database Sync', duration: 2500 },
            disableClose: true
        });
        this.loading.set(false);
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
        this.unregistrations.forEach(unreg => unreg());
        this.editorView?.destroy();
    }
}
