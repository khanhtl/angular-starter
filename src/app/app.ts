import { THEME_COLOR_LIST } from '@angular-starter/core/theme';
import { ToastContainerComponent } from '@angular-starter/ui/toast';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Bell, Calendar, CalendarDays, CalendarRange, ChevronsRight, CircleDot, FileText, Images, Layout, Loader2, LucideAngularModule, Menu, MessageCircle, MessageSquare, Moon, MousePointer2, Palette, Smartphone, Square, SquareChevronDown, Sun, Table2, TableProperties, Tags, TextCursorInput, X } from 'lucide-angular';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, LucideAngularModule, ToastContainerComponent, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Theme service
  readonly themeService = inject(ThemeService);
  readonly themeColors = THEME_COLOR_LIST;

  // Sidebar state
  sidebarVisible = signal(false);

  toggleSidebar() {
    this.sidebarVisible.update(v => !v);
  }

  closeSidebar() {
    this.sidebarVisible.set(false);
  }

  // Icons
  readonly MousePointer2 = MousePointer2;
  readonly Table2 = Table2;
  readonly TextCursorInput = TextCursorInput;
  readonly Calendar = Calendar;
  readonly CalendarDays = CalendarDays;
  readonly CalendarRange = CalendarRange;
  readonly SquareChevronDown = SquareChevronDown;
  readonly Tags = Tags;
  readonly CheckSquare = Square;
  readonly CircleDot = CircleDot;
  readonly TableProperties = TableProperties;
  readonly FileText = FileText;
  readonly Images = Images;
  readonly PaginationIcon = ChevronsRight;
  readonly MessageSquare = MessageSquare;
  readonly MessageCircle = MessageCircle;
  readonly Bell = Bell;
  readonly Layout = Layout;
  readonly Loader2 = Loader2;
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Palette = Palette;
  readonly Menu = Menu;
  readonly X = X;
  readonly Smartphone = Smartphone;
}
