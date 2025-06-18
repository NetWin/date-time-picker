/**
 * date-time.class
 */
import { booleanAttribute, Directive, inject, Input, numberAttribute, type OutputRef } from '@angular/core';
import { DateTimeAdapter } from './adapter/date-time-adapter.class';
import { OWL_DATE_TIME_FORMATS, OwlDateTimeFormats } from './adapter/date-time-format.class';

let nextUniqueId = 0;

export const PickerType = {
  /**
   * Shows both calendar and timer views.
   */
  Both: 'both',
  /**
   * Shows only the calendar view.
   */
  Calendar: 'calendar',
  /**
   * Shows only the timer view.
   */
  Timer: 'timer'
} as const;

export type PickerType = (typeof PickerType)[keyof typeof PickerType];

export const SelectMode = {
  /**
   * Selects a single date.
   */
  Single: 'single',
  /**
   * Selects a date range.
   */
  Range: 'range',
  /**
   * Selects a date range from a specific date.
   * The end date (range[1]) will always be `null` in this mode.
   */
  RangeFrom: 'rangeFrom',
  /**
   * Selects a date range up to a specific date.
   * The start date (range[0]) will always be `null` in this mode.
   */
  RangeTo: 'rangeTo'
} as const;

export type SelectMode = (typeof SelectMode)[keyof typeof SelectMode];

export const DateView = {
  /**
   * Shows all days of a month in a grid.
   */
  MONTH: 'month',
  /**
   * Shows all months of a year in a grid.
   */
  YEAR: 'year',
  /**
   * Shows a list of years.
   */
  MULTI_YEARS: 'multi-years'
} as const;

export type DateViewType = (typeof DateView)[keyof typeof DateView];

@Directive()
export abstract class OwlDateTime<T> {
  protected readonly dateTimeAdapter = inject<DateTimeAdapter<T>>(DateTimeAdapter, { optional: true });

  protected readonly dateTimeFormats = inject<OwlDateTimeFormats>(OWL_DATE_TIME_FORMATS, { optional: true });

  /**
   * Whether to show the second's timer
   */
  @Input({ transform: booleanAttribute })
  public showSecondsTimer: boolean = false;

  /**
   * Whether the timer is in hour12 format
   */
  @Input({ transform: booleanAttribute })
  public hour12Timer: boolean = false;

  /**
   * The view that the calendar should start in.
   */
  @Input()
  public startView: DateViewType = DateView.MONTH;

  /**
   * Whether to should only the year and multi-year views.
   */
  @Input()
  public yearOnly = false;

  /**
   * Whether to should only the multi-year view.
   */
  @Input()
  public multiyearOnly = false;

  /**
   * Hours to change per step
   */
  @Input({ transform: (v: unknown) => numberAttribute(v, 1) })
  public stepHour: number = 1;

  /**
   * Minutes to change per step
   */
  @Input({ transform: (v: unknown) => numberAttribute(v, 1) })
  public stepMinute: number = 1;

  /**
   * Seconds to change per step
   */
  @Input({ transform: (v: unknown) => numberAttribute(v, 1) })
  public stepSecond: number = 1;

  /**
   * Set the first day of week
   */
  @Input({
    transform: (v: unknown) => {
      const value = numberAttribute(v);
      return value >= 0 && value <= 6 ? value : undefined;
    }
  })
  public firstDayOfWeek: number | undefined;

  /**
   * Whether to hide dates in other months at the start or end of the current month.
   */
  @Input({ transform: booleanAttribute })
  public hideOtherMonths: boolean = false;

  public readonly id = `owl-dt-picker-${nextUniqueId++}`;

  public abstract disabled: boolean;

  public abstract get selected(): T | null;

  public abstract get selecteds(): Array<T> | null;

  public abstract get dateTimeFilter(): (date: T | null) => boolean;

  public abstract get maxDateTime(): T | null;

  public abstract get minDateTime(): T | null;

  public abstract get selectMode(): SelectMode;

  public abstract get startAt(): T | null;

  public abstract get endAt(): T | null;

  public abstract get opened(): boolean;

  public abstract get pickerType(): PickerType;

  public abstract get isInSingleMode(): boolean;

  public abstract get isInRangeMode(): boolean;

  public abstract select(date: T | Array<T>): void;

  public abstract yearSelected: OutputRef<T>;

  public abstract monthSelected: OutputRef<T>;

  public abstract dateSelected: OutputRef<T>;

  public abstract selectYear(normalizedYear: T): void;

  public abstract selectMonth(normalizedMonth: T): void;

  public abstract selectDate(normalizedDate: T): void;

  public get displayFormat(): Partial<Intl.DateTimeFormatOptions> {
    if (this.pickerType === 'both') {
      return this.dateTimeFormats.fullPickerInput;
    }

    if (this.pickerType === 'calendar') {
      return this.dateTimeFormats.datePickerInput;
    }

    return this.dateTimeFormats.timePickerInput;
  }

  /**
   * Date Time Checker to check if the give dateTime is selectable
   */
  public dateTimeChecker = (dateTime: T): boolean => {
    return (
      !!dateTime &&
      (!this.dateTimeFilter || this.dateTimeFilter(dateTime)) &&
      (!this.minDateTime || this.dateTimeAdapter.compare(dateTime, this.minDateTime) >= 0) &&
      (!this.maxDateTime || this.dateTimeAdapter.compare(dateTime, this.maxDateTime) <= 0)
    );
  };

  constructor() {
    if (!this.dateTimeAdapter) {
      throw Error(
        `OwlDateTimePicker: No provider found for DateTimeAdapter. You must import one of the following ` +
          `modules at your application root: OwlNativeDateTimeModule, OwlMomentDateTimeModule, or provide a ` +
          `custom implementation.`
      );
    }

    if (!this.dateTimeFormats) {
      throw Error(
        `OwlDateTimePicker: No provider found for OWL_DATE_TIME_FORMATS. You must import one of the following ` +
          `modules at your application root: OwlNativeDateTimeModule, OwlMomentDateTimeModule, or provide a ` +
          `custom implementation.`
      );
    }
  }

  protected getValidDate(obj: unknown): T | null {
    return this.dateTimeAdapter.isDateInstance(obj) && this.dateTimeAdapter.isValid(obj) ? obj : null;
  }
}
