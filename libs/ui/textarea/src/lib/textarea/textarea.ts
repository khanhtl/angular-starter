import { BaseControl } from '@angular-starter/core/forms';
import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  forwardRef,
  Input,
  ViewChild,
} from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export type TextareaValue = string | number | null;

@Component({
  selector: 'app-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './textarea.html',
  styleUrl: './textarea.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaComponent extends BaseControl<TextareaValue> {
  @ViewChild('textAreaElement', { static: true }) textAreaElement!: ElementRef<HTMLTextAreaElement>;

  @Input() placeholder = '';
  @Input() height: string | number = 'auto';
  @Input() minHeight: string | number = 'unset';
  @Input() maxHeight: string | number = 'unset';
  @Input() maxLength: number | null = null;
  @Input({ transform: booleanAttribute }) autoResize = false;
  @Input({ transform: booleanAttribute }) spellcheck = false;

  constructor() {
    super();
    this.id = `app-textarea-${TextareaComponent.nextId++}`;
  }

  protected override handleValueChanged(value: TextareaValue): void {
    if (this.autoResize) {
      this.adjustHeight();
    }
  }

  override writeValue(value: TextareaValue): void {
    super.writeValue(value);
    if (this.autoResize) {
      setTimeout(() => this.adjustHeight(), 0);
    }
  }

  override handleBlur(): void {
    super.handleBlur();
  }

  override handleFocus(): void {
    super.handleFocus();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      // Custom event for Meta+Enter can be added here or emitted via separate output
    }
  }

  adjustHeight(): void {
    if (!this.autoResize || !this.textAreaElement) return;

    const textarea = this.textAreaElement.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  formatSize(size: string | number): string {
    if (typeof size === 'number') {
      return `${size}px`;
    }
    return size;
  }

  // Imperative API
  focus(): void {
    this.textAreaElement.nativeElement.focus();
  }

  blur(): void {
    this.textAreaElement.nativeElement.blur();
  }
}
