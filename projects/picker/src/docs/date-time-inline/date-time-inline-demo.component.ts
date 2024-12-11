import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OwlDateTimeModule, OwlNativeDateTimeModule, type PickerType, type SelectMode } from 'picker';

type SingleDate = Date | null;
type DateRange = [from: Date | null, to: Date | null];

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

@Component({
  standalone: true,
  selector: 'owl-date-time-inline-demo',
  templateUrl: './date-time-inline-demo.component.html',
  styleUrl: './date-time-inline-demo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, FormsModule, OwlDateTimeModule, OwlNativeDateTimeModule]
})
export class DateTimeInlineDemoComponent {
  public readonly selectMode = input<SelectMode>('range');

  public readonly pickerType = input<PickerType>('both');

  public readonly showTodayButton = input<boolean>(true);

  protected readonly value = linkedSignal<Date | DateRange>(() => {
    return this.selectMode() === 'single' ? new Date() : [new Date(Date.now() - 3 * ONE_DAY_IN_MS), new Date()];
  });

  protected rangeValue = computed<DateRange>(() => {
    const value = this.value();
    return Array.isArray(value) ? value : undefined;
  });

  protected singleValue = computed<SingleDate>(() => {
    const value = this.value();
    return Array.isArray(value) ? undefined : value;
  });
}
