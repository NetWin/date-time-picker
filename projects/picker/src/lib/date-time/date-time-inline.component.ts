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
  type Provider,
  viewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OwlDateTimeContainerComponent } from './date-time-picker-container.component';
import { OwlDateTime, PickerType, SelectMode } from './date-time.class';

const OWL_DATETIME_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => OwlDateTimeInlineComponent),
  multi: true
};

@Component({
  standalone: false,
  selector: 'owl-date-time-inline',
  templateUrl: './date-time-inline.component.html',
  host: { 'class': 'owl-dt-inline' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false,
  providers: [OWL_DATETIME_VALUE_ACCESSOR]
})
export class OwlDateTimeInlineComponent<T> extends OwlDateTime<T> implements OnInit, ControlValueAccessor {
  readonly #changeDetector = inject(ChangeDetectorRef);

  protected readonly container = viewChild(OwlDateTimeContainerComponent);

  /**
   * Set the type of the dateTime picker
   *      'both' -- show both calendar and timer
   *      'calendar' -- show only calendar
   *      'timer' -- show only timer
   */
  @Input()
  public pickerType: PickerType;

  @Input({ transform: booleanAttribute })
  public disabled: boolean = false;

  private _selectMode: SelectMode = 'single';
  @Input()
  public get selectMode(): SelectMode {
    return this._selectMode;
  }
  public set selectMode(mode: SelectMode) {
    if (mode !== 'single' && mode !== 'range' && mode !== 'rangeFrom' && mode !== 'rangeTo') {
      mode = 'single';
    }
    this._selectMode = mode;
  }

  /** The date to open the calendar to initially. */
  private _startAt: T | null;
  @Input()
  public get startAt(): T | null {
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
  public set startAt(date: T | null) {
    this._startAt = this.getValidDate(this.dateTimeAdapter.deserialize(date));
  }

  /** The date to open for range calendar. */
  private _endAt: T | null;
  @Input()
  public get endAt(): T | null {
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
  public set endAt(date: T | null) {
    this._endAt = this.getValidDate(this.dateTimeAdapter.deserialize(date));
  }

  private _dateTimeFilter: (date: T | null) => boolean;
  @Input('owlDateTimeFilter')
  public get dateTimeFilter(): (date: T | null) => boolean {
    return this._dateTimeFilter;
  }
  public set dateTimeFilter(filter: (date: T | null) => boolean) {
    this._dateTimeFilter = filter;
  }

  /** The minimum valid date. */
  private _min: T | null;

  @Input('min')
  public get minDateTime(): T | null {
    return this._min || null;
  }
  public set minDateTime(value: T | null) {
    this._min = this.getValidDate(this.dateTimeAdapter.deserialize(value));
    this.#changeDetector.markForCheck();
  }

  /** The maximum valid date. */
  private _max: T | null;

  @Input('max')
  public get maxDateTime(): T | null {
    return this._max || null;
  }
  public set maxDateTime(value: T | null) {
    this._max = this.getValidDate(this.dateTimeAdapter.deserialize(value));
    this.#changeDetector.markForCheck();
  }

  private _value: T | null;
  @Input()
  public get value(): T | null {
    return this._value;
  }
  public set value(value: T | null) {
    value = this.dateTimeAdapter.deserialize(value);
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
        v = this.dateTimeAdapter.deserialize(v);
        v = this.getValidDate(v);
        return v ? this.dateTimeAdapter.clone(v) : null;
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
  public rangeLimit: number | null = null;

  /**
   * Flag to show today button to jump to today's date. Defaults to `false`.
   */
  @Input({ transform: booleanAttribute })
  public showTodayButton = false;

  /**
   * Variable to hold the old max date time value for when we override it with rangeLimit
   */
  private _initialMaxDateTime: T | null;

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

  private _selected: T | null;
  public get selected(): T | null {
    return this._selected;
  }
  public set selected(value: T | null) {
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

  public override readonly opened = true;

  public get isInSingleMode(): boolean {
    return this._selectMode === 'single';
  }

  public get isInRangeMode(): boolean {
    return this._selectMode === 'range' || this._selectMode === 'rangeFrom' || this._selectMode === 'rangeTo';
  }

  private onModelChange: (v: T | Array<T>) => void = () => {
    /* noop */
  };

  private onModelTouched: () => void = () => {
    /* noop */
  };

  public ngOnInit(): void {
    this.container().picker = this;
  }

  public writeValue(value: unknown): void {
    if (this.isInSingleMode) {
      this.value = value as T;
      this.container().pickerMoment = value as T;
    } else {
      this.values = value as Array<T>;
      this.container().pickerMoment = this._values[this.container().activeSelectedIndex];
    }
  }

  public registerOnChange(fn: (v: T | Array<T>) => void): void {
    this.onModelChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }

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
      const rangeLimitDate = this.dateTimeAdapter.addCalendarDays(this.values[0], this.rangeLimit - 1);
      if (!this.maxDateTime || this.dateTimeAdapter.compare(this.maxDateTime, rangeLimitDate) > 0) {
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
