import { THEME_COLOR_LIST } from '@angular-starter/core/theme';
import { ToastContainerComponent } from '@angular-starter/ui/toast';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Bell, Calendar, CalendarDays, CalendarRange, ChevronsRight, CircleDot, FileText, Images, Layout, Loader2, LucideAngularModule, MessageCircle, MessageSquare, Moon, MousePointer2, Palette, Square, SquareChevronDown, Sun, Table2, TableProperties, Tags, TextCursorInput } from 'lucide-angular';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, LucideAngularModule, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Theme service
  readonly themeService = inject(ThemeService);
  readonly themeColors = THEME_COLOR_LIST;

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
}
