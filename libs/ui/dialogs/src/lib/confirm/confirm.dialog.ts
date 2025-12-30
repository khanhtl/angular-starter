import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { ButtonComponent } from '@angular-starter/ui/button';

import {
  ConfirmPopupData,
  ConfirmPopupResult,
} from './confirm.types';

@Component({
  standalone: true,
  selector: 'ui-confirm-dialog',
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ data.title || 'Confirm' }}</h2>
      </div>
      <div class="dialog-body">
        <p class="dialog-message">{{ data.message }}</p>
      </div>
      <div class="dialog-actions">
        <app-button color="neutral" variant="outline" (click)="cancel()">
          {{ data.cancelText || 'Cancel' }}
        </app-button>
        <app-button color="primary" (click)="ok()">
          {{ data.okText || 'OK' }}
        </app-button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        max-width: 400px;
        background: var(--c-surface);
        border-radius: var(--w-radius-lg);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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

      .dialog-message {
        margin: 0;
        color: var(--c-text);
        opacity: 0.8;
        line-height: 1.5;
      }

      .dialog-actions {
        padding: var(--space-sm) var(--space-md);
        display: flex;
        justify-content: flex-end;
        gap: var(--space-xs);
        background: var(--c-bg);
        border-top: 1px solid var(--c-border);
      }

    `,
  ],
})
export class ConfirmDialog {
  private ref =
    inject<DialogRef<ConfirmPopupResult>>(DialogRef);
  data = inject<ConfirmPopupData>(DIALOG_DATA);

  ok() {
    this.ref.close({ confirmed: true });
  }

  cancel() {
    this.ref.close({ confirmed: false });
  }
}
