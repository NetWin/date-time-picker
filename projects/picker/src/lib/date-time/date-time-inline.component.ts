import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  Input,
  OnInit,
  output,
  ViewChild,
  type Provider
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type { Nullable } from '../types';
import { DateTimeAdapter } from './adapter/date-time-adapter.class';
import { OwlDateTimeContainerComponent } from './date-time-picker-container.component';
import { OwlDateTime, PickerType, SelectMode } from './date-time.class';

export const OWL_DATETIME_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => OwlDateTimeInlineComponent),
  multi: true
};

@Component({
  standalone: false,
  selector: 'owl-date-time-inline',
  templateUrl: './date-time-inline.component.html',
  styleUrls: ['./date-time-inline.component.scss'],
  host: { 'class': 'owl-dt-inline' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OWL_DATETIME_VALUE_ACCESSOR]
})
// TODO: Drop the `OwlDateTime` inheritance
export class OwlDateTimeInlineComponent<T> extends OwlDateTime<T> implements OnInit, ControlValueAccessor {
  readonly #changeDetector = inject(ChangeDetectorRef);
  readonly #dateTimeAdapter = inject<DateTimeAdapter<T>>(DateTimeAdapter, { optional: true });

  @ViewChild(OwlDateTimeContainerComponent, { static: true })
  protected container: OwlDateTimeContainerComponent<T>;

  /**
   * Set the type of the dateTime picker
   *      'both' -- show both calendar and timer
   *      'calendar' -- show only calendar
   *      'timer' -- show only timer
   */
  @Input()
  public pickerType: PickerType = 'both';

  @Input({ transform: booleanAttribute })
  public override disabled: boolean = false;

  @Input()
  public selectMode: SelectMode = 'single';

  /**
   *  The date to open the calendar to initially.
   */
  private _startAt: Nullable<T>;
  @Input()
  public get startAt(): Nullable<T> {
    if (this._startAt) {
      return this._startAt;
    }

    if (this.selectMode === 'single') {
      return this.value || null;
    } else if (this.selectMode === 'range' || this.selectMode === 'rangeFrom') {
      return this.values[0] || null;
    } else if (this.selectMode === 'rangeTo') {
      return this.values[1] || null;
    } else {
      return null;
    }
  }
  public set startAt(date: Nullable<T>) {
    this._startAt = this.getValidDate(this.#dateTimeAdapter.deserialize(date));
  }

  /**
   *  The date to open for range calendar.
   */
  private _endAt: Nullable<T>;
  @Input()
  public get endAt(): Nullable<T> {
    if (this._endAt) {
      return this._endAt;
    }

    if (this.selectMode === 'single') {
      return this.value || null;
    } else if (this.selectMode === 'range' || this.selectMode === 'rangeFrom') {
      return this.values[1] || null;
    } else {
      return null;
    }
  }
  public set endAt(date: Nullable<T>) {
    this._endAt = this.getValidDate(this.#dateTimeAdapter.deserialize(date));
  }

  @Input()
  public dateFilter?: (date: Nullable<T>) => boolean;

  /**
   *  The minimum valid date.
   */
  private _min: Nullable<T>;

  @Input('min')
  public get minDateTime(): Nullable<T> {
    return this._min || null;
  }
  public set minDateTime(value: Nullable<T>) {
    this._min = this.getValidDate(this.#dateTimeAdapter.deserialize(value));
    this.#changeDetector.markForCheck();
  }

  /**
   *  The maximum valid date.
   */
  private _max: Nullable<T>;

  @Input('max')
  public get maxDateTime(): Nullable<T> {
    return this._max || null;
  }
  public set maxDateTime(value: Nullable<T>) {
    this._max = this.getValidDate(this.#dateTimeAdapter.deserialize(value));
    this.#changeDetector.markForCheck();
  }

  private _value: Nullable<T>;
  @Input()
  public get value(): Nullable<T> {
    return this._value;
  }
  public set value(value: Nullable<T>) {
    value = this.#dateTimeAdapter.deserialize(value);
    value = this.getValidDate(value);
    this._value = value;
    this.selected = value;
  }

  private _values: Array<T> = [];
  @Input()
  public get values(): Array<T> {
    return this._values;
  }
  public set values(values: Array<T>) {
    if (values && values.length > 0) {
      values = values.map((v) => {
        v = this.#dateTimeAdapter.deserialize(v);
        v = this.getValidDate(v);
        return v ? this.#dateTimeAdapter.clone(v) : null;
      });
      this._values = [...values];
      this.selecteds = [...values];
    } else {
      this._values = [];
      this.selecteds = [];
    }
  }

  /**
   * Limit to the amount of days that can be selected at once.
   */
  @Input()
  public rangeLimit: Nullable<number> = null;

  /**
   * Flag to show today button to jump to today's date. Defaults to `false`.
   */
  @Input({ transform: booleanAttribute })
  public showTodayButton = false;

  /**
   * Variable to hold the old max date time value for when we override it with rangeLimit
   */
  private _initialMaxDateTime: Nullable<T>;

  /**
   * Emits selected year in multi-year view
   * This doesn't imply a change on the selected date.
   */
  public readonly yearSelected = output<T>();

  /**
   * Emits selected month in year view
   * This doesn't imply a change on the selected date.
   */
  public readonly monthSelected = output<T>();

  /**
   * Emits selected date
   */
  public readonly dateSelected = output<T>();

  private _selected: Nullable<T>;
  public get selected(): Nullable<T> {
    return this._selected;
  }
  public set selected(value: Nullable<T>) {
    this._selected = value;
    this.#changeDetector.markForCheck();
  }

  private _selecteds: Array<T> = [];
  public get selecteds(): Array<T> {
    return this._selecteds;
  }

  public set selecteds(values: Array<T>) {
    this._selecteds = values;
    this.#changeDetector.markForCheck();
  }

  public get isInSingleMode(): boolean {
    return this.selectMode === 'single';
  }

  public get isInRangeMode(): boolean {
    return this.selectMode === 'range' || this.selectMode === 'rangeFrom' || this.selectMode === 'rangeTo';
  }

  private onModelChange: (v: T | Array<T>) => void = () => {
    /* noop */
  };

  private onModelTouched: () => void = () => {
    /* noop */
  };

  public ngOnInit(): void {
    this.container.picker = this;
  }

  public writeValue(value: unknown): void {
    if (this.isInSingleMode) {
      this.container.pickerMoment = this.value = value as Nullable<T>;
    } else {
      this.values = value as [Nullable<T>, Nullable<T>];
      this.container.pickerMoment = this._values[this.container.activeSelectedIndex];
    }
  }

  public registerOnChange(fn: (v: Nullable<T> | Array<Nullable<T>>) => void): void {
    this.onModelChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }

  // public setDisabledState(isDisabled: boolean): void {
  //   this.disabled = isDisabled;
  // }

  public select(date: Array<T> | T): void {
    if (this.disabled) {
      return;
    }

    if (Array.isArray(date)) {
      this.values = [...date];
    } else {
      this.value = date;
    }

    // If range limit is set, we need to set the max date time to the range limit, so days after the max range are not selectable
    if (this.rangeLimit && !this.values[1] && this.values[0]) {
      const rangeLimitDate = this.#dateTimeAdapter.addCalendarDays(this.values[0], this.rangeLimit - 1);
      if (!this.maxDateTime || this.#dateTimeAdapter.compare(this.maxDateTime, rangeLimitDate) > 0) {
        this._initialMaxDateTime = this.maxDateTime;
        this.maxDateTime = rangeLimitDate;
      }
    }

    // Reset the max date time to the initial value after a full range is selected
    if (this.rangeLimit && this.values[1]) {
      this.maxDateTime = this._initialMaxDateTime;
    }

    this.onModelChange(date);
    this.onModelTouched();
  }

  /**
   * Emits the selected year in multi-year view
   */
  public selectYear(normalizedYear: T): void {
    this.yearSelected.emit(normalizedYear);
  }

  /**
   * Emits selected month in year view
   */
  public selectMonth(normalizedMonth: T): void {
    this.monthSelected.emit(normalizedMonth);
  }

  /**
   * Emits the selected date
   */
  public selectDate(normalizedDate: T): void {
    this.dateSelected.emit(normalizedDate);
  }
}
