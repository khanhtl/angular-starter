import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Calendar, CalendarDays, CalendarRange, ChevronsRight, CircleDot, FileText, Images, LucideAngularModule, MessageSquare, MousePointer2, Square, SquareChevronDown, Table2, TableProperties, Tags, TextCursorInput } from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
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
}
