import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from '../../../picker/src/public_api';

/** One day in milliseconds */
const ONE_DAY = 24 * 60 * 60 * 1000;

@Component({
  standalone: true,
  selector: 'demo-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    FormsModule
  ],
})
export class AppComponent {
  protected readonly currentTab = signal<string>('date-range');

  protected selectedDates: [Date, Date] = [
    new Date(Date.now() - ONE_DAY),
    new Date(Date.now() + ONE_DAY)
  ];

  protected currentValue: Date = new Date(this.selectedDates[0]);

  protected endValue: Date = new Date(this.selectedDates[1]);

  protected selectedTrigger(date: Date): void {
    console.log(date);
  }
}
