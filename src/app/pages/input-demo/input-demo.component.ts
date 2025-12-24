import {
  AppInputComponent
} from '@angular-starter/ui/input';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Binary, Eye, EyeOff, Keyboard, LucideAngularModule, ShieldCheck } from 'lucide-angular';

@Component({
  selector: 'app-input-demo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppInputComponent,
    LucideAngularModule
  ],
  templateUrl: './input-demo.component.html',
  styles: [`
    :host {
      display: block;
      background-color: #f9fafb;
      min-height: 100%;
    }
    .demo-container {
      padding: 3rem 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }
    .header-section {
      margin-bottom: 3rem;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 2rem;
    }
    .demo-section {
      margin-bottom: 4rem;
    }
    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .section-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      background: #eff6ff;
      color: #2563eb;
      border-radius: 8px;
    }
    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .card {
      background: white;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      border: 1px solid #f3f4f6;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }
    .label-group {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }
    .badge {
      font-size: 0.7rem;
      padding: 0.125rem 0.5rem;
      background: #f3f4f6;
      border-radius: 9999px;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 700;
    }
    .value-display {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed #f3f4f6;
    }
    .val-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
    }
    .val-label {
      color: #9ca3af;
    }
    .val-content {
      font-family: 'JetBrains Mono', monospace;
      color: #2563eb;
      font-weight: 600;
      background: #f0f9ff;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .hint {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: #9ca3af;
    }
    h2 {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #111827;
      margin: 0;
    }
    h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0;
    }
    .text-secondary {
      color: #6b7280;
      font-size: 1.125rem;
      margin-top: 0.5rem;
    }
  `]
})
export class InputDemoComponent {
  readonly Keyboard = Keyboard;
  readonly Binary = Binary;
  readonly ShieldCheck = ShieldCheck;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  form = new FormGroup({
    text: new FormControl('Hello World', Validators.required),
    password: new FormControl('secret123'),
    currency: new FormControl(1250000),
    date: new FormControl('23/12/2025'),
    numeric: new FormControl(12.5),
    accounting: new FormControl(1500000.75),
    phone: new FormControl('0971018134'),
    customDate: new FormControl('31/12/2025')
  });

  uppercaseFormatter = (value: string) => value.toUpperCase();
}
