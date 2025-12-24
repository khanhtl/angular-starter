import { loadAppConfig, provideAppConfig } from '@angular-starter/core/config';
import { authInterceptor, errorInterceptor } from '@angular-starter/core/http';
import { provideI18n } from '@angular-starter/core/i18n';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  ArrowRight,
  Binary,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  Keyboard,
  LogOut,
  LucideAngularModule,
  MousePointer2,
  Pencil,
  Pin,
  Settings,
  ShieldCheck,
  Table2,
  TextCursorInput
} from 'lucide-angular';
import { App } from './app';
import { appRoutes } from './app.routes';

export async function bootstrap() {
  const config = await loadAppConfig();

  await bootstrapApplication(App, {
    providers: [
      provideAppConfig(config),

      provideHttpClient(
        withInterceptors([
          authInterceptor,
          errorInterceptor,
        ])
      ),

      provideRouter(appRoutes),
      provideI18n(),
      provideZonelessChangeDetection(),
      importProvidersFrom(LucideAngularModule.pick({
        ArrowRight,
        Binary,
        ChevronDown,
        Download,
        Eye,
        EyeOff,
        Keyboard,
        LogOut,
        MousePointer2,
        Pencil,
        Settings,
        ShieldCheck,
        Table2,
        TextCursorInput,
        Pin
      })),
    ],
  });
}