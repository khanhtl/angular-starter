import { ButtonComponent } from '@angular-starter/ui/button';
import { CheckBoxComponent } from '@angular-starter/ui/check-box';
import { CellTemplateDirective, ColumnConfig, DataGridComponent } from '@angular-starter/ui/data-grid';
import { registerApiDemoPopup, registerConfirmPopup, registerUserFormPopup, SharedPopupMap, UserFormData } from '@angular-starter/ui/dialogs';
import { AppInputComponent } from '@angular-starter/ui/input';
import { PopupService } from '@angular-starter/ui/popup';
import { SelectBoxComponent } from '@angular-starter/ui/select-box';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, effect, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { ExternalLink, Eye, EyeOff, Layout, LucideAngularModule, Pencil, Plus, RefreshCcw, Rocket, Search, Terminal, Trash2 } from 'lucide-angular';

@Component({
    selector: 'app-popup-demo',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        LucideAngularModule,
        ButtonComponent,
        DataGridComponent,
        CellTemplateDirective,
        AppInputComponent,
        SelectBoxComponent,
        CheckBoxComponent
    ],
    templateUrl: './popup-demo.component.html'
})
export class PopupDemoComponent implements OnDestroy, AfterViewInit {
    private popupService = inject(PopupService<SharedPopupMap>);

    ngAfterViewInit() {
        if (this.showCode()) {
            this.initEditor();
        }
    }

    // Icons
    readonly PlusIcon = Plus;
    readonly PencilIcon = Pencil;
    readonly TrashIcon = Trash2;
    readonly RefreshIcon = RefreshCcw;
    readonly ExternalIcon = ExternalLink;
    readonly EyeIcon = Eye;
    readonly EyeOffIcon = EyeOff;
    readonly SearchIcon = Search;
    readonly RocketIcon = Rocket;
    readonly DashboardIcon = Layout;
    readonly TerminalIcon = Terminal;

    // Registration cleanup
    private unregistrations: (() => void)[] = [
        registerConfirmPopup(),
        registerUserFormPopup(),
        registerApiDemoPopup()
    ];

    activeTab = signal<'playground' | 'dashboard' | 'api'>('playground');
    showCode = signal(true);
    lastResult = signal<any>(null);
    loading = signal(false);

    playgroundConfig = signal({
        type: 'ui.confirm',
        title: 'Delete User Account',
        message: 'Are you sure you want to permanently delete your account?',
        okText: 'Delete Permanently',
        cancelText: 'Maybe Later',
        width: '500px',
        disableClose: false
    });

    popupTypes = [
        { label: 'Confirm Dialog', value: 'ui.confirm' },
        { label: 'User Form', value: 'ui.user-form' },
        { label: 'API Simulation', value: 'ui.api-demo' }
    ];

    generatedCode = computed(() => {
        const c = this.playgroundConfig();
        if (c.type === 'ui.confirm') {
            return `const result = await this.popupService.openAndWait('ui.confirm', {
  data: {
    title: '${c.title}',
    message: '${c.message}',
    okText: '${c.okText}',
    cancelText: '${c.cancelText}'
  },
  width: '${c.width}',
  disableClose: ${c.disableClose}
});`;
        } else if (c.type === 'ui.user-form') {
            return `const result = await this.popupService.openAndWait('ui.user-form', {
  data: { name: 'John Doe', email: 'john@example.com' },
  width: '${c.width}',
  disableClose: ${c.disableClose}
});`;
        }
        return `const result = await this.popupService.openAndWait('ui.api-demo', {
  data: { title: 'Processing...', duration: 2000 },
  disableClose: true 
});`;
    });

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

    updatePlayground(key: string, value: any) {
        this.playgroundConfig.update(c => ({ ...c, [key]: value }));
    }

    async openPlayground() {
        const c = this.playgroundConfig();
        let result;
        if (c.type === 'ui.confirm') {
            result = await this.popupService.openAndWait('ui.confirm', {
                data: {
                    title: c.title,
                    message: c.message,
                    okText: c.okText,
                    cancelText: c.cancelText
                },
                width: c.width,
                disableClose: c.disableClose
            });
        } else if (c.type === 'ui.user-form') {
            result = await this.popupService.openAndWait('ui.user-form', {
                data: { name: 'John Doe', email: 'john@example.com' },
                width: c.width,
                disableClose: c.disableClose
            });
        } else {
            result = await this.popupService.openAndWait('ui.api-demo', {
                data: { title: 'Simulating Process', duration: 2000 },
                disableClose: true
            });
        }
        this.lastResult.set(result);
    }

    async openCreateForm() {
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
