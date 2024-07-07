import {
  coerceBooleanProperty,
  coerceNumberProperty
} from '@angular/cdk/coercion';
import { Directive, EventEmitter, Input, inject } from '@angular/core';
import { DateFilter } from '../types/date-filter';
import {
  DateTimeAdapter,
  OWL_DATE_TIME_FORMATS,
  OwlDateTimeFormats
} from './adapter';

let nextUniqueId = 0;

export type PickerType = 'both' | 'calendar' | 'timer';

export type PickerMode = 'popup' | 'dialog' | 'inline';

export type SelectMode = 'single' | 'range' | 'rangeFrom' | 'rangeTo';

export enum DateView {
  MONTH = 'month',
  YEAR = 'year',
  MULTI_YEARS = 'multi-years'
}

export type DateViewType = DateView.MONTH | DateView.YEAR | DateView.MULTI_YEARS;

@Directive()
export abstract class OwlDateTime<T> {

  protected readonly dateTimeAdapter = inject<DateTimeAdapter<T>>(DateTimeAdapter<T>, { optional: true });

  protected readonly dateTimeFormats = inject<OwlDateTimeFormats>(OWL_DATE_TIME_FORMATS, { optional: true });

  /**
   * Whether to show the second's timer
   */
  private _showSecondsTimer = false;
  @Input()
  public get showSecondsTimer(): boolean {
    return this._showSecondsTimer;
  }

  public set showSecondsTimer(val: boolean) {
    this._showSecondsTimer = coerceBooleanProperty(val);
  }

  /**
   * Whether the timer is in hour12 format
   */
  private _hour12Timer = false;
  @Input()
  public get hour12Timer(): boolean {
    return this._hour12Timer;
  }

  public set hour12Timer(val: boolean) {
    this._hour12Timer = coerceBooleanProperty(val);
  }

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
  private _stepHour = 1;
  @Input()
  public get stepHour(): number {
    return this._stepHour;
  }

  public set stepHour(val: number) {
    this._stepHour = coerceNumberProperty(val, 1);
  }

  /**
   * Minutes to change per step
   */
  private _stepMinute = 1;
  @Input()
  public get stepMinute(): number {
    return this._stepMinute;
  }

  public set stepMinute(val: number) {
    this._stepMinute = coerceNumberProperty(val, 1);
  }

  /**
   * Seconds to change per step
   */
  private _stepSecond = 1;
  @Input()
  public get stepSecond(): number {
    return this._stepSecond;
  }

  public set stepSecond(val: number) {
    this._stepSecond = coerceNumberProperty(val, 1);
  }

  /**
   * Set the first day of week
   */
  private _firstDayOfWeek: number;
  @Input()
  public get firstDayOfWeek(): number {
    return this._firstDayOfWeek;
  }

  public set firstDayOfWeek(value: number) {
    value = coerceNumberProperty(value);
    if (value > 6 || value < 0) {
      this._firstDayOfWeek = undefined;
    } else {
      this._firstDayOfWeek = value;
    }
  }

  /**
   * Whether to hide dates in other months at the start or end of the current month.
   */
  private _hideOtherMonths = false;
  @Input()
  public get hideOtherMonths(): boolean {
    return this._hideOtherMonths;
  }

  public set hideOtherMonths(val: boolean) {
    this._hideOtherMonths = coerceBooleanProperty(val);
  }

  private readonly _id: string;
  public get id(): string {
    return this._id;
  }

  public abstract get selected(): T | null;

  public abstract get selecteds(): Array<T> | null;

  public abstract get dateTimeFilter(): DateFilter<T> | null;

  public abstract get maxDateTime(): T | null;

  public abstract get minDateTime(): T | null;

  public abstract get selectMode(): SelectMode;

  public abstract get startAt(): T | null;

  public abstract get endAt(): T | null;

  public abstract get opened(): boolean;

  public abstract get pickerMode(): PickerMode;

  public abstract get pickerType(): PickerType;

  public abstract get isInSingleMode(): boolean;

  public abstract get isInRangeMode(): boolean;

  public abstract select(date: T | Array<T>): void;

  public abstract yearSelected: EventEmitter<T>;

  public abstract monthSelected: EventEmitter<T>;

  public abstract dateSelected: EventEmitter<T>;

  public abstract selectYear(normalizedYear: T): void;

  public abstract selectMonth(normalizedMonth: T): void;

  public abstract selectDate(normalizedDate: T): void;

  public get formatString(): unknown {
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
      (!this.minDateTime ||
        this.dateTimeAdapter.compare(dateTime, this.minDateTime) >=
        0) &&
      (!this.maxDateTime ||
        this.dateTimeAdapter.compare(dateTime, this.maxDateTime) <= 0)
    );
  };

  public get disabled(): boolean {
    return false;
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

    this._id = `owl-dt-picker-${nextUniqueId++}`;
  }

  protected getValidDate(obj: unknown): T | null {
    if (!this.dateTimeAdapter.isDateInstance(obj)) return null;
    if (!this.dateTimeAdapter.isValid(obj)) return null;
    return obj;
  }
}
