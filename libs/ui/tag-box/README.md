# Tag Box Component

A multi-select dropdown component with tag display, built with Angular 17+ and Angular CDK.

## Features

- ✅ **Multi-select**: Select multiple items with checkboxes
- ✅ **Tag Display**: Selected items displayed as removable tags
- ✅ **Virtual Scrolling**: Efficient rendering for large datasets using CDK Virtual Scroll
- ✅ **Search**: Built-in search functionality with debouncing
- ✅ **Select All**: Option to select/deselect all items at once
- ✅ **Keyboard Navigation**: Navigate items using arrow keys, Enter, and Escape
- ✅ **Custom Templates**: Customize item and tag rendering
- ✅ **Data Source Integration**: Works with the DataSource utility for advanced data handling
- ✅ **Form Integration**: Implements ControlValueAccessor for Angular Forms
- ✅ **Responsive**: Auto-adjusts dropdown width and positioning

## Installation

The component is part of the `@angular-starter/ui/tag-box` library.

```typescript
import { TagBoxComponent, ItemTemplateDirective, TagTemplateDirective } from '@angular-starter/ui/tag-box';
```

## Basic Usage

### Simple Array

```typescript
import { Component } from '@angular/core';
import { TagBoxComponent } from '@angular-starter/ui/tag-box';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [TagBoxComponent, FormsModule],
  template: `
    <app-tag-box
      [dataSourceInput]="items"
      displayExpr="name"
      valueExpr="id"
      placeholder="Select items..."
      [(ngModel)]="selectedValues"
    />
  `
})
export class ExampleComponent {
  items = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' }
  ];
  
  selectedValues: number[] = [];
}
```

### With Search

```typescript
<app-tag-box
  [dataSourceInput]="items"
  displayExpr="name"
  valueExpr="id"
  placeholder="Select items..."
  [searchEnabled]="true"
  searchPlaceholder="Search items..."
  [(ngModel)]="selectedValues"
/>
```

### With Select All

```typescript
<app-tag-box
  [dataSourceInput]="items"
  displayExpr="name"
  valueExpr="id"
  [showSelectAll]="true"
  [(ngModel)]="selectedValues"
/>
```

### With Custom Tag Limit

```typescript
<app-tag-box
  [dataSourceInput]="items"
  displayExpr="name"
  valueExpr="id"
  [maxDisplayedTags]="5"
  [(ngModel)]="selectedValues"
/>
```

## Custom Templates

### Custom Item Template

```typescript
<app-tag-box
  [dataSourceInput]="items"
  displayExpr="name"
  valueExpr="id"
  [(ngModel)]="selectedValues">
  
  <ng-template itemTemplate let-item let-index="index">
    <div class="custom-item">
      <strong>{{ item.name }}</strong>
      <span class="item-description">{{ item.description }}</span>
    </div>
  </ng-template>
</app-tag-box>
```

### Custom Tag Template

```typescript
<app-tag-box
  [dataSourceInput]="items"
  displayExpr="name"
  valueExpr="id"
  [(ngModel)]="selectedValues">
  
  <ng-template tagTemplate let-item>
    <span class="custom-tag">
      <i class="icon">{{ item.icon }}</i>
      {{ item.name }}
    </span>
  </ng-template>
</app-tag-box>
```

## DataSource Integration

The component works seamlessly with the DataSource utility for advanced scenarios:

```typescript
import { DataSourceOptions } from '@angular-starter/core/data-source';

export class ExampleComponent {
  dataSource: DataSourceOptions<User> = {
    store: {
      type: 'custom',
      load: async (loadOptions) => {
        const response = await fetch('/api/users');
        return response.json();
      }
    },
    pageSize: 50
  };
  
  selectedUserIds: number[] = [];
}
```

```html
<app-tag-box
  [dataSourceInput]="dataSource"
  displayExpr="fullName"
  valueExpr="userId"
  [searchEnabled]="true"
  searchExpr="fullName"
  [(ngModel)]="selectedUserIds"
/>
```

## API Reference

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `dataSourceInput` | `DataSourceOptions<T>` | `[]` | Data source configuration or array of items |
| `displayExpr` | `string` | `''` | Property name to display in items and tags |
| `valueExpr` | `string` | `'id'` | Property name to use as the value |
| `placeholder` | `string` | `'Select items...'` | Placeholder text when no items selected |
| `searchEnabled` | `boolean` | `false` | Enable search functionality |
| `searchPlaceholder` | `string` | `'Search...'` | Placeholder for search input |
| `clearable` | `boolean` | `false` | Show clear all button |
| `minSearchLength` | `number` | `0` | Minimum characters before search triggers |
| `searchExpr` | `string \| string[]` | `''` | Property/properties to search in |
| `dropDownWidth` | `string \| number` | `'auto'` | Width of dropdown ('auto' or specific value) |
| `closeOnScroll` | `boolean` | `false` | Close dropdown when scrolling outside |
| `maxDisplayedTags` | `number` | `3` | Maximum number of tags to display before showing count |
| `showSelectAll` | `boolean` | `false` | Show select all checkbox |

### Outputs

The component implements `ControlValueAccessor`, so it works with Angular Forms:

```typescript
// Template-driven forms
[(ngModel)]="selectedValues"

// Reactive forms
[formControl]="myControl"
```

### Template Directives

- **`itemTemplate`**: Customize how items appear in the dropdown list
  - Context: `{ $implicit: item, index: number }`
  
- **`tagTemplate`**: Customize how selected items appear as tags
  - Context: `{ $implicit: item }`

## Keyboard Navigation

- **Arrow Down**: Move focus to next item
- **Arrow Up**: Move focus to previous item
- **Enter**: Toggle selection of focused item
- **Escape**: Close dropdown

## Styling

The component uses CSS variables from your global styles:

```css
--h-md          /* Component height */
--w-space-xs    /* Padding */
--w-radius      /* Border radius */
--c-border      /* Border color */
--c-brand       /* Brand color for tags and selection */
--c-white       /* Background color */
--c-text        /* Text color */
--c-tips        /* Placeholder color */
--c-bg          /* Background for disabled state */
```

### Custom Styling

You can override styles by targeting the component classes:

```css
::ng-deep .tag-box-container {
  /* Custom styles */
}

::ng-deep .tag {
  background-color: #custom-color;
}
```

## Examples

### With Reactive Forms

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TagBoxComponent } from '@angular-starter/ui/tag-box';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [TagBoxComponent, ReactiveFormsModule],
  template: `
    <app-tag-box
      [dataSourceInput]="items"
      displayExpr="name"
      valueExpr="id"
      [formControl]="selectedItems"
      [searchEnabled]="true"
      [showSelectAll]="true"
      [clearable]="true"
    />
    
    <p>Selected: {{ selectedItems.value | json }}</p>
  `
})
export class ExampleComponent {
  items = [
    { id: 1, name: 'Angular' },
    { id: 2, name: 'React' },
    { id: 3, name: 'Vue' },
    { id: 4, name: 'Svelte' }
  ];
  
  selectedItems = new FormControl<number[]>([1, 3]);
}
```

### With Remote Data

```typescript
export class ExampleComponent {
  dataSource: DataSourceOptions<Product> = {
    store: {
      type: 'custom',
      load: async (loadOptions) => {
        const params = new URLSearchParams({
          skip: String(loadOptions.skip || 0),
          take: String(loadOptions.take || 20),
          search: loadOptions.searchValue || ''
        });
        
        const response = await fetch(`/api/products?${params}`);
        const data = await response.json();
        
        return {
          data: data.items,
          totalCount: data.total
        };
      }
    },
    pageSize: 20
  };
  
  selectedProductIds: number[] = [];
}
```

## License

MIT
