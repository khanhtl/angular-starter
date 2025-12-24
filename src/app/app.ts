import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MousePointer2, Table2, TextCursorInput } from 'lucide-angular';

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
}
