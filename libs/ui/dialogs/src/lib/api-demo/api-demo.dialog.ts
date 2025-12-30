import { ButtonComponent } from '@angular-starter/ui/button';
import { SpinnerComponent } from '@angular-starter/ui/spinner';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom, timer } from 'rxjs';

export interface ApiDemoData {
    title: string;
    duration?: number;
}

export interface ApiDemoResult {
    success: boolean;
    data?: any;
}

@Component({
    selector: 'ui-api-demo-dialog',
    standalone: true,
    imports: [CommonModule, ButtonComponent, SpinnerComponent],
    template: `
    <div class="dialog-container">
      <div class="dialog-body">
        @if (loading()) {
          <div class="loading-state">
            <app-spinner size="lg"></app-spinner>
            <p>Processing {{ data.title }}...</p>
            <p class="sub-text">Please Wait, simulating API call ({{ data.duration || 2000 }}ms)</p>
          </div>
        } @else {
          <div class="success-state">
            <div class="success-icon">✓</div>
            <h3>Operation Successful</h3>
            <p>The data for <strong>{{ data.title }}</strong> has been processed successfully.</p>
            
            <div class="actions">
              <app-button color="primary" (click)="close()">Close</app-button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
    styles: [`
    :host {
      display: block;
      width: 320px;
      background: var(--c-surface);
      border-radius: var(--w-radius-lg);
      overflow: hidden;
      border: 1px solid var(--c-border);
    }

    .dialog-body {
      padding: var(--space-xl) var(--space-md);
      text-align: center;
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-md);
      
      p {
        margin: 0;
        font-weight: 500;
        color: var(--c-text);
      }

      .sub-text {
        font-size: 0.8rem;
        color: var(--c-tips);
        font-weight: 400;
      }
    }

    .success-state {
      animation: fadeIn 0.3s ease-out;

      .success-icon {
        width: 64px;
        height: 64px;
        background: var(--c-brand);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        margin: 0 auto var(--space-md);
      }

      h3 { margin: 0 0 var(--space-sm); color: var(--c-text); }
      p { color: var(--c-tips); margin-bottom: var(--space-lg); }
    }

    .actions {
      display: flex;
      justify-content: center;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ApiDemoDialog implements OnInit {
    private ref = inject(DialogRef<ApiDemoResult>);
    data = inject<ApiDemoData>(DIALOG_DATA);

    loading = signal(true);

    async ngOnInit() {
        // Simulate API call
        await firstValueFrom(timer(this.data.duration || 2000));
        this.loading.set(false);
    }

    close() {
        this.ref.close({ success: true, data: { status: 'completed' } });
    }
}
