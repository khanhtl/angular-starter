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
  Calendar,
  CalendarDays,
  CalendarRange,
  ChevronDown,
  CircleDot,
  Download,
  Eye,
  EyeOff,
  FileText,
  Keyboard,
  LogOut,
  LucideAngularModule,
  MousePointer2,
  Pencil,
  Pin,
  Settings,
  ShieldCheck,
  Square,
  SquareChevronDown,
  Table2,
  TableProperties,
  Tags,
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
        Calendar,
        CalendarDays,
        CalendarRange,
        ChevronDown,
        CircleDot,
        Download,
        Eye,
        EyeOff,
        FileText,
        Keyboard,
        LogOut,
        MousePointer2,
        Pencil,
        Settings,
        ShieldCheck,
        Square,
        SquareChevronDown,
        Table2,
        TableProperties,
        Tags,
        TextCursorInput,
        Pin
      })),
    ],
  });
}