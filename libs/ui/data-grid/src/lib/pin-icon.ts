import {
  Component,
  computed,
  input,
  output
} from '@angular/core';
import { LucideAngularModule, Pin } from 'lucide-angular';

@Component({
  selector: 'app-pin-icon',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div
      class="pin-icon"
      [class.pinnable]="pinnable() !== false"
      [class.pin-none]="pinState() === 'none'"
      [class.pin-left]="pinState() === 'left'"
      [class.pin-right]="pinState() === 'right'"
      (click)="handleClick()"
      [title]="tooltipText()"
    >
      <i-lucide [img]="Pin" [size]="16" strokeWidth="2"></i-lucide>
    </div>
  `,
  styles: [`
    .pin-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      margin-left: 6px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      opacity: 0.6;
    }

    .pin-icon:hover {
      background-color: rgba(green, 0.1);
      opacity: 1;
    }

    .pin-icon.pinnable {
      opacity: 0.8;
    }

    .pin-icon.pinnable:hover {
      opacity: 1;
    }

    .pin-icon.pin-none {
      color: grey;
    }

    .pin-icon.pin-none:hover {
      color: green;
    }

    .pin-icon.pin-left {
      color: green;
    }

    .pin-icon.pin-right lucide-icon {
      transform: rotate(45deg);
    }

    lucide-icon {
      transition: transform 0.2s ease;
      display: flex;
    }

    .dark .pin-icon:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .dark .pin-icon.pin-none {
      color: grey;
    }

    .dark .pin-icon.pin-none:hover {
      color: green;
    }
  `]
})
export class PinIconComponent {
  readonly Pin = Pin;
  pinState = input<'none' | 'left' | 'right'>('none');
  pinnable = input<boolean | undefined>(true);

  pinChange = output<'left' | 'right' | undefined>();

  tooltipText = computed(() => {
    if (this.pinnable() === false) {
      return 'This column cannot be pinned';
    }

    switch (this.pinState()) {
      case 'none':
        return 'Click to pin to left';
      case 'left':
        return 'Click to unpin';
      case 'right':
        return 'Click to unpin';
      default:
        return '';
    }
  });

  handleClick() {
    if (this.pinnable() === false) return;

    let newState: 'left' | 'right' | undefined;

    switch (this.pinState()) {
      case 'none':
        newState = 'left';
        break;
      case 'left':
        newState = undefined;
        break;
      case 'right':
        newState = undefined;
        break;
    }

    this.pinChange.emit(newState);
  }
}
