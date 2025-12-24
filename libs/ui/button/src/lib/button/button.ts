import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef, ViewEncapsulation, booleanAttribute, signal } from '@angular/core';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';
import { ButtonSize, ButtonType, ButtonVariant, DropdownItem } from './button.types';
import { AppRippleDirective } from './ripple.directive';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [
    CommonModule,
    OverlayModule,
    LucideAngularModule,
    AppRippleDirective
  ],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [
    {
      directive: AppRippleDirective,
      inputs: ['appRipple: ripple']
    }
  ],
  host: {
    '[class.lib-button]': 'true',
    '[class.variant-primary]': 'variant === "primary"',
    '[class.variant-secondary]': 'variant === "secondary"',
    '[class.variant-outline]': 'variant === "outline"',
    '[class.variant-ghost]': 'variant === "ghost"',
    '[class.variant-danger]': 'variant === "danger"',
    '[class.variant-link]': 'variant === "link"',
    '[class.size-sm]': 'size === "sm"',
    '[class.size-md]': 'size === "md"',
    '[class.size-lg]': 'size === "lg"',
    '[class.size-icon]': 'size === "icon"',
    '[class.is-loading]': 'loading',
    '[class.is-disabled]': 'disabled',
    '[class.is-split]': 'split',
  }
})
export class ButtonComponent {
  readonly ChevronDown = ChevronDown;

  /** The visual style variant of the button. Default is 'primary'. */
  @Input() variant: ButtonVariant = 'primary';

  /** The size of the button. Default is 'md'. */
  @Input() size: ButtonSize = 'md';

  /** The generic HTML type of the button. Default is 'button'. */
  @Input() type: ButtonType = 'button';

  /** Whether the button is in a loading state. Shows a spinner and hides content. */
  @Input({ transform: booleanAttribute }) loading = false;

  /** Whether the button is disabled. */
  @Input({ transform: booleanAttribute }) disabled = false;

  /** Whether to show a dropdown chevron indicator on the right side. */
  @Input({ transform: booleanAttribute }) dropdown = false;

  /** A template to show in the dropdown. */
  @Input() menu?: TemplateRef<unknown>;

  /** A simple list of items to show in the dropdown if no template is provided. */
  @Input() items: DropdownItem[] = [];

  /** Whether to function as a split button with a separate chevron click area. */
  @Input({ transform: booleanAttribute }) split = false;

  /** Whether to enable the ripple effect on click. */
  @Input({ transform: booleanAttribute }) ripple = false;

  /** Event emitted when a dropdown item is clicked. */
  @Output() itemClicked = new EventEmitter<DropdownItem>();

  /** State for the overlay */
  isOpen = signal(false);

  toggle(event?: Event) {
    if (this.disabled || this.loading) return;

    if (this.menu || this.items.length > 0) {
      this.isOpen.update(v => !v);
      event?.stopPropagation();
    }
  }

  close() {
    this.isOpen.set(false);
  }

  handleItemClick(item: DropdownItem) {
    if (item.disabled) return;
    item.click?.();
    this.itemClicked.emit(item);
    this.close();
  }

  /* Core Click Logic */
  handleClick(event: MouseEvent) {
    if (this.disabled || this.loading) return;

    // If it's a dropdown button but NOT split, the whole button should toggle the menu
    if (!this.split && (this.menu || this.items.length > 0)) {
      this.isOpen.update(v => !v);
    }
  }
}
