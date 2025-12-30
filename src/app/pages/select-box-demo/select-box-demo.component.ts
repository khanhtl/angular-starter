import { CustomStore } from '@angular-starter/core/data-source';
import { ButtonComponent } from '@angular-starter/ui/button';
import { CheckBoxComponent } from '@angular-starter/ui/check-box';
import { AppInputComponent } from '@angular-starter/ui/input';
import { FieldTemplateDirective, GroupTemplateDirective, ItemTemplateDirective, SelectBoxComponent } from '@angular-starter/ui/select-box';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { ChevronDown, Code, Eye, EyeOff, Info, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-select-box-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectBoxComponent,
    AppInputComponent,
    CheckBoxComponent,
    ButtonComponent,
    ItemTemplateDirective,
    FieldTemplateDirective,
    GroupTemplateDirective,
    LucideAngularModule
  ],
  templateUrl: './select-box-demo.component.html',
  styles: [`
    /* Custom Item Styles for Demo */
    .custom-item { display: flex; align-items: center; gap: 12px; padding: 6px 0; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: #eee; }
    .info { .name { font-weight: 600; font-size: 0.9rem; } .email { font-size: 0.75rem; color: #64748b; } }
    .custom-field { display: flex; align-items: center; gap: 8px; font-weight: 600; }
    .avatar-small { width: 20px; height: 20px; border-radius: 50%; }
    .flag { font-size: 1.2rem; }
    
    .demo-group-header {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--c-brand);
      font-weight: bold;
    }
  `]
})
export class SelectBoxDemoComponent implements OnDestroy {
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly CodeIcon = Code;
  readonly InfoIcon = Info;
  readonly ChevronDownIcon = ChevronDown;

  activeTab = signal<'preview' | 'api'>('preview');
  showCode = signal(false);

  // Playground Config
  dsType = signal<'local' | 'users' | 'countries' | 'fruits' | 'remote' | 'large'>('local');

  scenarioOptions = [
    { id: 'local', name: 'Basic Array' },
    { id: 'fruits', name: 'Grouping (Fruits & Veggies)' },
    { id: 'users', name: 'Users (Custom Template)' },
    { id: 'countries', name: 'Countries (Custom Template)' },
    { id: 'remote', name: 'Remote API (JSONPlaceholder)' },
    { id: 'large', name: 'Large Data (Virtual Scroll)' }
  ];

  groupExpr = signal('');
  groupsCollapsed = signal(false);
  searchEnabled = signal(true);
  clearable = signal(true);
  closeOnScroll = signal(false);
  placeholder = signal('Select an option...');
  displayExpr = signal('name');
  valueExpr = signal('id');
  dropDownWidth = signal<string | number>('auto');
  selectedValue = signal<any>(null);

  // Form control properties (for custom form control demo)
  label = signal('Select an option');
  hint = signal('Choose one from the list');
  errorText = signal('This field is required');
  required = signal(false);
  disabled = signal(false);

  // Sample Data
  users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Albert Einstein', email: 'albert@relativity.com' },
    { id: 4, name: 'Marie Curie', email: 'marie@science.fr' },
    { id: 5, name: 'Isaac Newton', email: 'isaac@apple.co.uk' },
  ];

  countries = [
    { id: 1, name: 'Vietnam', code: 'VN', flag: '🇻🇳' },
    { id: 2, name: 'USA', code: 'US', flag: '🇺🇸' },
    { id: 3, name: 'Japan', code: 'JP', flag: '🇯🇵' },
    { id: 4, name: 'France', code: 'FR', flag: '🇫🇷' },
    { id: 5, name: 'Germany', code: 'DE', flag: '🇩🇪' },
  ];

  fruits = [
    { id: 1, name: 'Apple', category: 'Fruits' },
    { id: 2, name: 'Banana', category: 'Fruits' },
    { id: 3, name: 'Cherry', category: 'Fruits' },
    { id: 4, name: 'Carrot', category: 'Vegetables' },
    { id: 5, name: 'Broccoli', category: 'Vegetables' },
    { id: 6, name: 'Eggplant', category: 'Vegetables' },
    { id: 7, name: 'Diamond', category: 'Other' },
  ];

  remoteStore = new CustomStore({
    load: async (options) => {
      const q = options.searchValue || '';
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts?q=${q}`);
      const data = await response.json();
      return {
        data: data.slice(options.skip || 0, (options.skip || 0) + (options.take || 20)),
        totalCount: data.length
      };
    }
  });

  currentDataSource = computed(() => {
    switch (this.dsType()) {
      case 'users': return this.users;
      case 'countries': return this.countries;
      case 'fruits': return this.fruits;
      case 'remote': return this.remoteStore;
      case 'large':
        return {
          store: Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` })),
          paginate: true,
          pageSize: 50
        };
      default:
        return [
          { id: 1, name: 'Option 1' },
          { id: 2, name: 'Option 2' },
          { id: 3, name: 'Option 3' }
        ];
    }
  });

  @ViewChild('codeEditor') codeEditorRef!: ElementRef<HTMLDivElement>;
  editorView?: EditorView;

  generatedCode = computed(() => {
    const t = this.dsType();
    let templates = '';
    if (t === 'users') {
      templates = `
  <ng-template itemTemplate let-item>
    <div class="custom-item">
      <div class="info">
        <div class="name">{{ item.name }}</div>
        <div class="email">{{ item.email }}</div>
      </div>
    </div>
  </ng-template>`;
    }

    return `<app-select-box
  [dataSource]="dataSource"
  displayExpr="${this.displayExpr()}"
  label="${this.label()}"
  hint="${this.hint()}"
  errorText="${this.errorText()}"
  [required]="${this.required()}"
  [disabled]="${this.disabled()}"
  [groupExpr]="${this.groupExpr()}"
  [searchEnabled]="${this.searchEnabled()}"
  [clearable]="${this.clearable()}"
  [(ngModel)]="value">${templates}
</app-select-box>`;
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

  onScenarioChange() {
    this.selectedValue.set(null);
    const t = this.dsType();
    if (t === 'remote') {
      this.displayExpr.set('title');
      this.groupExpr.set('');
    } else if (t === 'fruits') {
      this.displayExpr.set('name');
      this.groupExpr.set('category');
    } else {
      this.displayExpr.set('name');
      this.groupExpr.set('');
    }
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
