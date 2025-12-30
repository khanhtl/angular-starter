import { ButtonComponent } from '@angular-starter/ui/button';
import { CheckBoxComponent } from '@angular-starter/ui/check-box';
import { AppInputComponent } from '@angular-starter/ui/input';
import { SelectBoxComponent } from '@angular-starter/ui/select-box';
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Bell, ChevronLeft, Home, Info, LucideAngularModule, Monitor, Search, Settings, Smartphone, Tablet, User } from 'lucide-angular';

@Component({
    selector: 'app-mobile-demo',
    standalone: true,
    imports: [
        CommonModule,
        LucideAngularModule,
        ButtonComponent,
        AppInputComponent,
        CheckBoxComponent,
        SelectBoxComponent,
        FormsModule
    ],
    templateUrl: './mobile-demo.component.html',
    styleUrl: './mobile-demo.component.scss'
})
export class MobileDemoComponent {
    readonly Smartphone = Smartphone;
    readonly Tablet = Tablet;
    readonly Monitor = Monitor;
    readonly Info = Info;
    readonly Bell = Bell;
    readonly Settings = Settings;
    readonly Home = Home;
    readonly Search = Search;
    readonly User = User;
    readonly ChevronLeft = ChevronLeft;

    currentDevice = signal<'mobile' | 'tablet' | 'desktop'>('mobile');
    currentScreen = signal<'login' | 'dashboard' | 'settings'>('login');

    devices = [
        { id: 'mobile', icon: Smartphone, label: 'Mobile' },
        { id: 'tablet', icon: Tablet, label: 'Tablet' },
        { id: 'desktop', icon: Monitor, label: 'Desktop' }
    ];

    setDevice(device: any) {
        this.currentDevice.set(device);
    }

    setScreen(screen: 'login' | 'dashboard' | 'settings') {
        this.currentScreen.set(screen);
    }
}
