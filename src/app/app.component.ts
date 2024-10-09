import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'picker';

/** One day in milliseconds */
const ONE_DAY = 24 * 60 * 60 * 1000;

type DebugUiTab =
  | 'date-time-inline' // Inline DateTime picker
  | 'date-range'; // Date range picker

@Component({
  standalone: true,
  selector: 'owl-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, FormsModule, OwlDateTimeModule, OwlNativeDateTimeModule]
})
export class AppComponent {
  protected readonly currentTab = signal<DebugUiTab>('date-range');

  protected selectedDates: [Date, Date] = [new Date(Date.now() - ONE_DAY), new Date(Date.now() + ONE_DAY)];

  protected currentValue: Date = new Date(this.selectedDates[0]);

  protected endValue: Date = new Date(this.selectedDates[1]);

  protected selectedTrigger(date: Date): void {
    console.log(date);
  }
}
