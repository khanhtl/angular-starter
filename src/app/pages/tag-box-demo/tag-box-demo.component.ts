import { CustomStore } from '@angular-starter/core/data-source';
import { ButtonComponent } from '@angular-starter/ui/button';
import { AppInputComponent } from '@angular-starter/ui/input';
import { ItemTemplateDirective, SelectedItemInfo, TagBoxComponent, TagTemplateDirective } from '@angular-starter/ui/tag-box';
import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, OnDestroy, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';
import { Code, Eye, EyeOff, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-tag-box-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TagBoxComponent,
    AppInputComponent,
    ButtonComponent,
    ItemTemplateDirective,
    TagTemplateDirective,
    LucideAngularModule
  ],
  templateUrl: './tag-box-demo.component.html',
  styles: [`
    .playground-grid {
      display: grid;
      grid-template-columns: 1fr 340px;
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
    .dark .controls-panel {
      background: #111;
      border-color: #333;
    }

    /* Custom Item Styles for Demo */
    .custom-item { display: flex; align-items: center; gap: 12px; padding: 6px 0; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; background: #eee; }
    .info .name { font-weight: 600; font-size: 0.9rem; }
    .info .email { font-size: 0.75rem; color: #64748b; }
    .custom-tag { display: flex; align-items: center; gap: 6px; }
    .avatar-small { width: 18px; height: 18px; border-radius: 50%; }
    .flag { font-size: 1.2rem; }
  `]
})
export class TagBoxDemoComponent implements OnDestroy {
  // Icons
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly CodeIcon = Code;

  // Tab state
  activeTab = signal<'preview' | 'api'>('preview');
  showCode = signal(false);

  // Playground Config
  dsType = signal<'local' | 'users' | 'countries' | 'skills' | 'remote' | 'large'>('local');
  searchEnabled = signal(true);
  clearable = signal(true);
  closeOnScroll = signal(false);
  showSelectAll = signal(true);
  placeholder = signal('Select items...');
  displayExpr = signal('name');
  valueExpr = signal('id');
  dropDownWidth = signal<string | number>('auto');
  maxDisplayedTags = signal(3);
  groupExpr = signal('');
  selectedValues = signal<any[]>([]);

  // BaseControl Demo Properties
  demoLabel = signal('Choose your skills');
  demoHint = signal('Select at least 2 skills');
  demoError = signal('Skills are required');
  demoRequired = signal(true);

  // Reference to TagBox for API methods
  @ViewChild('tagBox') tagBoxRef!: TagBoxComponent;

  // Sample Data
  users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Albert Einstein', email: 'albert@relativity.com' },
    { id: 4, name: 'Marie Curie', email: 'marie@science.fr' },
    { id: 5, name: 'Isaac Newton', email: 'isaac@apple.co.uk' },
    { id: 6, name: 'Ada Lovelace', email: 'ada@computing.uk' },
    { id: 7, name: 'Alan Turing', email: 'alan@enigma.uk' },
  ];

  countries = [
    { id: 1, name: 'Vietnam', code: 'VN', flag: '🇻🇳' },
    { id: 2, name: 'USA', code: 'US', flag: '🇺🇸' },
    { id: 3, name: 'Japan', code: 'JP', flag: '🇯🇵' },
    { id: 4, name: 'France', code: 'FR', flag: '🇫🇷' },
    { id: 5, name: 'Germany', code: 'DE', flag: '🇩🇪' },
    { id: 6, name: 'UK', code: 'GB', flag: '🇬🇧' },
    { id: 7, name: 'Canada', code: 'CA', flag: '🇨🇦' },
    { id: 8, name: 'Australia', code: 'AU', flag: '🇦🇺' },
  ];

  skills = [
    { id: 1, name: 'Angular', category: 'Frontend' },
    { id: 2, name: 'React', category: 'Frontend' },
    { id: 3, name: 'Vue', category: 'Frontend' },
    { id: 4, name: 'Node.js', category: 'Backend' },
    { id: 5, name: 'Python', category: 'Backend' },
    { id: 6, name: 'TypeScript', category: 'Language' },
    { id: 7, name: 'JavaScript', category: 'Language' },
    { id: 8, name: 'Docker', category: 'DevOps' },
    { id: 9, name: 'Kubernetes', category: 'DevOps' },
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
      case 'skills': return this.skills;
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
          { id: 3, name: 'Option 3' },
          { id: 4, name: 'Option 4' },
          { id: 5, name: 'Option 5' }
        ];
    }
  });

  currentGroupExpr = computed(() => {
    const t = this.dsType();
    if (t === 'skills') return 'category';
    return this.groupExpr();
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
      <img [src]="'https://i.pravatar.cc/150?u=' + item.id" class="avatar" />
      <div class="info">
        <div class="name">{{ item.name }}</div>
        <div class="email">{{ item.email }}</div>
      </div>
    </div>
  </ng-template>

  <ng-template tagTemplate let-item>
    <div class="custom-tag">
      <img [src]="'https://i.pravatar.cc/150?u=' + item.id" class="avatar-small" />
      <span>{{ item.name }}</span>
    </div>
  </ng-template>`;
    } else if (t === 'countries') {
      templates = `
  <ng-template itemTemplate let-item>
    <span class="flag">{{ item.flag }}</span>
    <span>{{ item.name }} ({{ item.code }})</span>
  </ng-template>

  <ng-template tagTemplate let-item>
    <span class="flag">{{ item.flag }}</span>
    <span>{{ item.name }}</span>
  </ng-template>`;
    }

    return `<app-tag-box
  [dataSourceInput]="dataSource"
  displayExpr="${this.displayExpr()}"
  [searchEnabled]="${this.searchEnabled()}"
  [clearable]="${this.clearable()}"
  [showSelectAll]="${this.showSelectAll()}"
  [closeOnScroll]="${this.closeOnScroll()}"
  [maxDisplayedTags]="${this.maxDisplayedTags()}"
  [dropDownWidth]="${this.dropDownWidth()}"
  [(ngModel)]="selectedValues">${templates}
</app-tag-box>`;
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
    this.selectedValues.set([]);
    const t = this.dsType();
    if (t === 'remote') {
      this.displayExpr.set('title');
      this.groupExpr.set('');
    } else if (t === 'skills') {
      this.displayExpr.set('name');
      this.groupExpr.set('category');
    } else {
      this.displayExpr.set('name');
      this.groupExpr.set('');
    }
  }

  // API Methods Demo
  onSelectionChanged(items: SelectedItemInfo[]) {
    console.log('Selection changed:', items);
  }

  getSelectionInfo() {
    if (!this.tagBoxRef) return;
    const info = this.tagBoxRef.getSelectedItemsInfo();
    const values = this.tagBoxRef.getSelectedValues();
    const texts = this.tagBoxRef.getSelectedDisplayTexts();

    console.log('Selected Items Info:', info);
    console.log('Selected Values:', values);
    console.log('Selected Display Texts:', texts);

    alert(
      `Selected ${info.length} items.\n\n` +
      `Values: ${JSON.stringify(values)}\n\n` +
      `Display Texts: ${texts.join(', ')}`
    );
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
