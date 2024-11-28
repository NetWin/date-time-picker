import { booleanAttribute, Directive, inject, Input, numberAttribute, type OutputRef } from '@angular/core';
import type { Maybe, Nullable } from '../types';
import { DateTimeAdapter } from './adapter/date-time-adapter.class';
import { OWL_DATE_TIME_FORMATS, OwlDateTimeFormats } from './adapter/date-time-format.class';

let nextUniqueId = 0;

export type PickerType = 'both' | 'calendar' | 'timer';

export type SelectMode = 'single' | 'range' | 'rangeFrom' | 'rangeTo';

export enum DateView {
  MONTH = 'month',
  YEAR = 'year',
  MULTI_YEARS = 'multi-years'
}

export type DateViewType = DateView.MONTH | DateView.YEAR | DateView.MULTI_YEARS;

@Directive()
export abstract class OwlDateTime<T> {
  readonly #dateTimeAdapter = inject<DateTimeAdapter<T>>(DateTimeAdapter, { optional: true });
  readonly #dateTimeFormats = inject<OwlDateTimeFormats>(OWL_DATE_TIME_FORMATS, { optional: true });

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
  @Input({ transform: booleanAttribute })
  public yearOnly: boolean = false;

  /**
   * Whether to should only the multi-year view.
   */
  @Input({ transform: booleanAttribute })
  public multiyearOnly: boolean = false;

  /**
   * Hours to change per step
   */
  @Input({ transform: (val: unknown) => numberAttribute(val, 1) })
  public stepHour: number = 1;

  /**
   * Minutes to change per step
   */
  @Input({ transform: (val: unknown) => numberAttribute(val, 1) })
  public stepMinute: number = 1;

  /**
   * Seconds to change per step
   */
  @Input({ transform: (val: unknown) => numberAttribute(val, 1) })
  public stepSecond: number = 1;

  /**
   * Set the first day of week.
   * Must be a number between `0` and `6` where:
   * - `0` = Sunday
   * - `6` = Saturday
   */
  @Input({ transform: numberAttribute })
  public firstDayOfWeek: Maybe<number>;

  /**
   * Whether to hide dates in other months at the start or end of the current month.
   */
  @Input({ transform: booleanAttribute })
  public hideOtherMonths = false;

  public readonly id = `owl-dt-picker-${nextUniqueId++}`;

  protected abstract get selected(): Nullable<T>;

  protected abstract get selecteds(): Nullable<Array<T>>;

  protected abstract dateFilter?: (date: Nullable<T>) => boolean;

  protected abstract get maxDateTime(): Nullable<T>;

  protected abstract get minDateTime(): Nullable<T>;

  protected abstract get selectMode(): SelectMode;

  protected abstract get startAt(): Nullable<T>;

  protected abstract get endAt(): Nullable<T>;

  protected abstract get pickerType(): PickerType;

  protected abstract get isInSingleMode(): boolean;

  protected abstract get isInRangeMode(): boolean;

  protected abstract select(date: T | Array<T>): void;

  protected abstract yearSelected: OutputRef<T>;

  protected abstract monthSelected: OutputRef<T>;

  protected abstract dateSelected: OutputRef<T>;

  protected abstract selectYear(normalizedYear: T): void;

  protected abstract selectMonth(normalizedMonth: T): void;

  public abstract selectDate(normalizedDate: T): void;

  public get formatString(): Intl.DateTimeFormatOptions {
    switch (this.pickerType) {
      case 'both':
        return this.#dateTimeFormats.fullPickerInput;
      case 'calendar':
        return this.#dateTimeFormats.datePickerInput;
      case 'timer':
        return this.#dateTimeFormats.timePickerInput;
    }
  }

  /**
   * Function to check if the give dateTime is selectable
   */
  public dateTimeChecker: (dateTime: T) => boolean = (dateTime: T) => {
    return (
      !!dateTime &&
      (!this.dateFilter || this.dateFilter(dateTime)) &&
      (!this.minDateTime || this.#dateTimeAdapter.compare(dateTime, this.minDateTime) >= 0) &&
      (!this.maxDateTime || this.#dateTimeAdapter.compare(dateTime, this.maxDateTime) <= 0)
    );
  };

  public readonly disabled: boolean = false;

  constructor() {
    if (!this.#dateTimeAdapter) {
      throw Error(
        `OwlDateTimePicker: No provider found for DateTimeAdapter. You must import one of the following ` +
          `modules at your application root: OwlNativeDateTimeModule, OwlMomentDateTimeModule, or provide a ` +
          `custom implementation.`
      );
    }

    if (!this.#dateTimeFormats) {
      throw Error(
        `OwlDateTimePicker: No provider found for OWL_DATE_TIME_FORMATS. You must import one of the following ` +
          `modules at your application root: OwlNativeDateTimeModule, OwlMomentDateTimeModule, or provide a ` +
          `custom implementation.`
      );
    }
  }

  protected getValidDate(obj: unknown): Nullable<T> {
    return this.#dateTimeAdapter.isDateInstance(obj) && this.#dateTimeAdapter.isValid(obj) ? obj : null;
  }
}
