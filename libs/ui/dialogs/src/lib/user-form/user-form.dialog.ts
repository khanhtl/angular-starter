import { ButtonComponent } from '@angular-starter/ui/button';
import { AppInputComponent } from '@angular-starter/ui/input';
import { SelectBoxComponent } from '@angular-starter/ui/select-box';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserFormData, UserFormResult } from './user-form.types';

@Component({
  selector: 'ui-user-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, AppInputComponent, SelectBoxComponent, ButtonComponent],
  template: `
    <div class="dialog-container">
      <header class="dialog-header">
        <h2 class="dialog-title">{{ data.id ? 'Edit User' : 'Create User' }}</h2>
      </header>

      <form class="dialog-body" (ngSubmit)="save()">
        <div class="form-grid">
          <div class="form-field">
            <app-input 
              label="Full Name" 
              [(ngModel)]="formValue.name" 
              name="name" 
              placeholder="Enter name"
              required>
            </app-input>
          </div>

          <div class="form-field">
            <app-input 
              label="Email Address" 
              type="email" 
              [(ngModel)]="formValue.email" 
              name="email" 
              placeholder="user@example.com"
              required>
            </app-input>
          </div>

          <div class="form-field">
            <app-select-box
              label="Role"
              [dataSource]="roles"
              valueExpr="id"
              displayExpr="label"
              name="role"
              [(ngModel)]="formValue.role">
            </app-select-box>
          </div>
        </div>
      </form>

      <footer class="dialog-actions">
        <app-button color="neutral" variant="outline" (click)="cancel()">
          Cancel
        </app-button>
        <app-button color="primary" (click)="save()">
          {{ data.id ? 'Save Changes' : 'Create User' }}
        </app-button>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      max-width: 500px;
      background: var(--c-surface);
      border-radius: var(--w-radius-lg);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid var(--c-border);
    }

    .dialog-container {
      display: flex;
      flex-direction: column;
    }

    .dialog-header {
      padding: var(--space-sm) var(--space-md);
      border-bottom: 1px solid var(--c-border);
    }

    .dialog-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--c-text);
    }

    .dialog-body {
      padding: var(--space-md);
    }

    .form-grid {
      display: grid;
      gap: var(--space-md);
    }

    .dialog-actions {
      padding: var(--space-sm) var(--space-md);
      display: flex;
      justify-content: flex-end;
      gap: var(--space-xs);
      background: var(--c-bg);
      border-top: 1px solid var(--c-border);
    }
  `]
})
export class UserFormDialog {
  private ref = inject<DialogRef<UserFormResult>>(DialogRef);
  data = inject<UserFormData>(DIALOG_DATA);

  formValue: UserFormData = {
    id: this.data.id,
    name: this.data.name || '',
    email: this.data.email || '',
    role: this.data.role || 'user'
  };

  roles = [
    { id: 'admin', label: 'Administrator' },
    { id: 'editor', label: 'Editor' },
    { id: 'user', label: 'User' }
  ];

  save() {
    this.ref.close(this.formValue);
  }

  cancel() {
    this.ref.close(null);
  }
}
