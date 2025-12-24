import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';

@Directive({
    selector: '[appRipple]',
    standalone: true,
})
export class AppRippleDirective {
    private elementRef = inject(ElementRef);

    @Input('appRipple') enabled: boolean | string = true;

    @HostListener('mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        const isEnabled = this.enabled === true || this.enabled === 'true' || this.enabled === '';
        if (!isEnabled) return;
        this.createRipple(event);
    }

    private createRipple(event: MouseEvent) {
        const el = this.elementRef.nativeElement;

        // Ensure host is relatively positioned and clips children
        el.style.position = 'relative';
        el.style.overflow = 'hidden';

        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        el.appendChild(ripple);

        // Auto-remove after animation
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });

        // Safety timeout if animationend doesn't fire
        setTimeout(() => {
            if (ripple.parentElement) ripple.remove();
        }, 1000);
    }
}
