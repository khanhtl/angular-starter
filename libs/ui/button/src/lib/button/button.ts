import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, TemplateRef, ViewEncapsulation, booleanAttribute, computed, input, signal } from '@angular/core';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';
import { ButtonColor, ButtonSize, ButtonType, ButtonVariant, DropdownItem } from './button.types';
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
    '[class.variant-solid]': 'variant() === "solid"',
    '[class.variant-outline]': 'variant() === "outline"',
    '[class.variant-ghost]': 'variant() === "ghost"',
    '[class.variant-link]': 'variant() === "link"',
    '[class.color-primary]': 'color() === "primary"',
    '[class.color-secondary]': 'color() === "secondary"',
    '[class.color-success]': 'color() === "success"',
    '[class.color-warning]': 'color() === "warning"',
    '[class.color-danger]': 'color() === "danger"',
    '[class.color-info]': 'color() === "info"',
    '[class.color-neutral]': 'color() === "neutral"',
    '[class.size-sm]': 'size() === "sm"',
    '[class.size-md]': 'size() === "md"',
    '[class.size-lg]': 'size() === "lg"',
    '[class.size-icon]': 'size() === "icon"',
    '[class.is-loading]': 'loading()',
    '[class.is-disabled]': 'disabled()',
    '[class.is-split]': 'hasMenu()',
  }
})
export class ButtonComponent {
  readonly ChevronDown = ChevronDown;

  /** The visual style variant of the button. Default is 'solid'. */
  variant = input<ButtonVariant>('solid');

  /** The color theme of the button. Default is 'primary'. */
  color = input<ButtonColor>('primary');

  /** The size of the button. Default is 'md'. */
  size = input<ButtonSize>('md');

  /** The generic HTML type of the button. Default is 'button'. */
  type = input<ButtonType>('button');

  /** Whether the button is in a loading state. Shows a spinner and hides content. */
  loading = input(false, { transform: booleanAttribute });

  /** Whether the button is disabled. */
  disabled = input(false, { transform: booleanAttribute });

  /** Whether to show a dropdown chevron indicator on the right side. */
  dropdown = input(false, { transform: booleanAttribute });

  /** A template to show in the dropdown. */
  menu = input<TemplateRef<unknown>>();

  /** A simple list of items to show in the dropdown if no template is provided. */
  items = input<DropdownItem[]>([]);

  /** Whether to function as a split button with a separate chevron click area. */
  split = input(false, { transform: booleanAttribute });

  /** Whether to enable the ripple effect on click. */
  ripple = input(false, { transform: booleanAttribute });

  /** Event emitted when a dropdown item is clicked. */
  @Output() itemClicked = new EventEmitter<DropdownItem>();

  /** State for the overlay */
  isOpen = signal(false);

  toggle(event?: Event) {
    if (this.disabled() || this.loading()) return;
    const menu = this.menu();
    const items = this.items();

    if (menu || items.length > 0) {
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

  hasMenu = computed(() => {
    return this.split() || this.dropdown() || this.items().length > 0 || !!this.menu();
  });

  /* Core Click Logic */
  handleClick(event: MouseEvent) {
    if (this.disabled() || this.loading()) return;

    // We no longer toggle on main click because all dropdowns are now split
  }
}
