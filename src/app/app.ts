import { THEME_COLOR_LIST } from '@angular-starter/core/theme';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Calendar, CalendarDays, CalendarRange, ChevronsRight, CircleDot, FileText, Images, LucideAngularModule, MessageSquare, Moon, MousePointer2, Palette, Square, SquareChevronDown, Sun, Table2, TableProperties, Tags, TextCursorInput } from 'lucide-angular';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
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
  readonly Sun = Sun;
  readonly Moon = Moon;
  readonly Palette = Palette;
}
