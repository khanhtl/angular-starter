import { AppButtonDirective, AppRippleDirective, ButtonComponent, DropdownItem } from '@angular-starter/ui/button';
import { Component, signal } from '@angular/core';
import { ArrowRight, Download, LucideAngularModule, Settings } from 'lucide-angular';

@Component({
    selector: 'app-button-demo',
    standalone: true,
    imports: [ButtonComponent, AppButtonDirective, AppRippleDirective, LucideAngularModule],
    templateUrl: './button-demo.component.html',
})
export class ButtonDemoComponent {
    readonly Settings = Settings;
    readonly Download = Download;
    readonly ArrowRight = ArrowRight;

    isLoading = signal(false);

    toggleLoading() {
        this.isLoading.set(true);
        setTimeout(() => this.isLoading.set(false), 2000);
    }

    menuItems: DropdownItem[] = [
        { label: 'Edit Profile', icon: 'pencil' },
        { label: 'Preferences', icon: 'settings' },
        { label: 'Logout', icon: 'log-out' }
    ];

    onMenuAction(item: DropdownItem) {
        console.log('Menu Action Clicked:', item.label);
        alert(`Clicked: ${item.label}`);
    }
}
