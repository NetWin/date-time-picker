import {
  booleanAttribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  inject,
  Input,
  numberAttribute,
  Output,
  Provider
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateView, PickerType, SelectMode } from '../types';
import { DateTimeAdapter } from './adapter/date-time-adapter.class';
import { OWL_DATE_TIME_FORMATS } from './adapter/date-time-format.class';
import { OwlDateTimeIntl } from './date-time-picker-intl.service';

const OWL_DATETIME_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => OwlDateTimeInlineComponent),
  multi: true
};

let nextUniqueComponentId = 0;

@Component({
  selector: 'owl-date-time-inline',
  templateUrl: './date-time-inline.component.html',
  styleUrls: ['./date-time-inline.component.scss'],
  host: {
    '[class.owl-dt-container-disabled]': 'disabled',
    'class': 'owl-dt-inline owl-dt-container owl-dt-inline-container'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false,
  providers: [OWL_DATETIME_VALUE_ACCESSOR]
})
export class OwlDateTimeInlineComponent implements ControlValueAccessor {
  public readonly id: string;

  readonly #changeDetector = inject(ChangeDetectorRef);

  readonly #pickerIntl = inject(OwlDateTimeIntl);

  readonly #dateTimeFormats = inject(OWL_DATE_TIME_FORMATS, { optional: true });

  readonly #dateTimeAdapter = inject<DateTimeAdapter<Date>>(DateTimeAdapter, { optional: true });

  /**
   * Whether the timer is in hour12 format
   */
  @Input({ transform: booleanAttribute })
  public hour12Timer = false;

  /**
   * The view that the calendar should start in.
   */
  @Input()
  public startView: DateView = DateView.MONTH;

  /**
   * Whether to should only the year and multi-year views.
   */
  @Input({ transform: booleanAttribute })
  public yearOnly = false;

  /**
   * Whether to should only the multi-year view.
   */
  @Input({ transform: booleanAttribute })
  public multiyearOnly = false;

  /**
   * Hours to change per step
   */
  @Input()
  public stepHour: number = 1;

  /**
   * Minutes to change per step
   */
  @Input()
  public stepMinute: number = 1;

  /**
   * Seconds to change per step
   */
  @Input()
  public stepSecond: number = 1;

  /**
   * Set the first day of week.
   * Has to be a number between 0 (Sunday) and 6 (Saturday)
   */
  private _firstDayOfWeek: number;
  @Input()
  public get firstDayOfWeek(): number {
    return this._firstDayOfWeek;
  }
  public set firstDayOfWeek(value: number) {
    value = numberAttribute(value, undefined);
    if (value > 6 || value < 0) {
      this._firstDayOfWeek = undefined;
    } else {
      this._firstDayOfWeek = value;
    }
  }

  /**
   * Whether to hide dates in other months at the start or end of the current month.
   */

  @Input({ transform: booleanAttribute })
  public hideOtherMonths: boolean = false;

  protected get formatOptions(): Intl.DateTimeFormatOptions {
    if (this.pickerType === 'both') {
      return this.#dateTimeFormats.fullPickerInput;
    }

    if (this.pickerType === 'calendar') {
      return this.#dateTimeFormats.datePickerInput;
    }

    return this.#dateTimeFormats.timePickerInput;
  }

  /**
   * Date Time Checker to check if the give dateTime is selectable
   */
  public dateTimeChecker = (dateTime: Date): boolean => {
    return (
      !!dateTime &&
      (!this.dateTimeFilter || this.dateTimeFilter(dateTime)) &&
      (!this.min || this.#dateTimeAdapter.compare(dateTime, this.min) >= 0) &&
      (!this.max || this.#dateTimeAdapter.compare(dateTime, this.max) <= 0)
    );
  };

  protected getValidDate(obj: unknown): Date | null {
    return this.#dateTimeAdapter.isDateInstance(obj) && this.#dateTimeAdapter.isValid(obj) ? obj : null;
  }

  /**
   * Set the {@link PickerType} of the dateTime picker
   */
  @Input()
  public pickerType: PickerType = 'both';

  /**
   * Whether the picker is disabled or not
   */
  @Input({ transform: booleanAttribute })
  public disabled = false;

  /**
   * Whether to show the second's timer
   */
  @Input({ transform: booleanAttribute })
  public showSecondsTimer = false;

  /**
   * Which select mode to use:
   * - 'single'
   * - 'range'
   * - 'rangeFrom'
   * - 'rangeTo'
   */
  @Input()
  public selectMode: SelectMode = 'single';

  /**
   * The date to open the calendar to initially.
   */
  private _startAt: Date | null;
  @Input()
  public get startAt(): Date | null {
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
  public set startAt(date: Date | null) {
    this._startAt = this.getValidDate(this.#dateTimeAdapter.deserialize(date));
  }

  /**
   * The date to open for range calendar.
   */
  private _endAt: Date | null;
  @Input()
  public get endAt(): Date | null {
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
  public set endAt(date: Date | null) {
    this._endAt = this.getValidDate(this.#dateTimeAdapter.deserialize(date));
  }

  /**
   * @deprecated use `dateTimeFilter` instead!
   */
  @Input()
  public owlDateTimeFilter: ((date: Date | null) => boolean) | null = null;

  @Input()
  public dateTimeFilter: ((date: Date | null) => boolean) | null = null;

  // TODO: remove this getter when `owlDateTimeFilter` is removed
  protected get dateTimeFilterGetter(): ((date: Date | null) => boolean) | null {
    return this.dateTimeFilter || this.owlDateTimeFilter;
  }

  private _min: Date | null;
  /**
   * The minimum valid date.
   */
  @Input()
  public get min(): Date | null {
    return this._min || null;
  }
  public set min(value: Date | null) {
    this._min = this.getValidDate(this.#dateTimeAdapter.deserialize(value));
    this.#changeDetector.markForCheck();
  }

  private _max: Date | null;
  /**
   * The maximum valid date.
   */
  @Input()
  public get max(): Date | null {
    return this._max || null;
  }
  public set max(value: Date | null) {
    this._max = this.getValidDate(this.#dateTimeAdapter.deserialize(value));
    this.#changeDetector.markForCheck();
  }

  private _value: Date | null;
  @Input()
  public get value(): Date | null {
    return this._value;
  }

  public set value(value: Date | null) {
    value = this.#dateTimeAdapter.deserialize(value);
    value = this.getValidDate(value);
    this._value = value;
    this.selected = value;
  }

  private _values: Array<Date> = [];
  @Input()
  public get values(): Array<Date> | null {
    return this._values;
  }
  public set values(values: Array<Date>) {
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
   * Emits selected year in multi-year view
   * This doesn't imply a change on the selected date.
   */
  @Output()
  public readonly yearSelected = new EventEmitter<Date>();

  /**
   * Emits selected month in year view
   * This doesn't imply a change on the selected date.
   */
  @Output()
  public readonly monthSelected = new EventEmitter<Date>();

  /**
   * Emits selected date
   */
  @Output()
  public readonly dateSelected = new EventEmitter<Date>();

  protected activeSelectedIndex = 0; // The current active SelectedIndex in range select mode (0: 'from', 1: 'to')

  private _selected: Date | null;
  protected get selected(): Date | null {
    return this._selected;
  }
  protected set selected(value: Date | null) {
    this._selected = value;
    this.#changeDetector.markForCheck();
  }

  private _selecteds: Array<Date> = [];
  protected get selecteds(): Array<Date> {
    return this._selecteds;
  }

  protected set selecteds(values: Array<Date>) {
    this._selecteds = values;
    this.#changeDetector.markForCheck();
  }

  /**
   * Returns whether the picker is in single mode
   */
  protected get isInSingleMode(): boolean {
    return this.selectMode === 'single';
  }

  /**
   * Returns whether the picker is in range mode (range, rangeFrom, rangeTo)
   */
  protected get isInRangeMode(): boolean {
    return this.selectMode === 'range' || this.selectMode === 'rangeFrom' || this.selectMode === 'rangeTo';
  }

  /**
   * The range 'from' label
   */
  protected get fromLabel(): string {
    return this.#pickerIntl.rangeFromLabel;
  }

  /**
   * The range 'to' label
   */
  protected get toLabel(): string {
    return this.#pickerIntl.rangeToLabel;
  }

  /**
   * The range 'from' formatted value
   */
  protected get fromFormattedValue(): string {
    const value = this.selecteds[0];
    return value ? this.#dateTimeAdapter.format(value, this.formatOptions) : '';
  }

  /**
   * The range 'to' formatted value
   */
  protected get toFormattedValue(): string {
    const value = this.selecteds[1];
    return value ? this.#dateTimeAdapter.format(value, this.formatOptions) : '';
  }

  private onModelChange: (v: Date | Array<Date>) => void = () => {
    /* noop */
  };

  private onModelTouched: () => void = () => {
    /* noop */
  };

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

    this.id = `owl-dt-picker-${nextUniqueComponentId++}`;
  }

  public writeValue(value: Date): void {
    if (this.isInSingleMode) {
      this.selected = value;
      this.value = this.selected;
    } else {
      // Handle the case where the second selected date is before the first selected date
      // In this case "go back" and treat the value as the first selected date
      if (this.activeSelectedIndex === 1) {
        if (value.getTime() < this.selecteds[0].getTime()) {
          this.activeSelectedIndex = 0;
        }
      }

      // Set the correct value according to the active selected index
      if (this.activeSelectedIndex === 0) {
        this.selecteds = [value, null];
      } else {
        this.selecteds[1] = value;
      }

      // Set the values to the selecteds
      this.values = [...this.selecteds];
      this.activeSelectedIndex = (this.activeSelectedIndex + 1) % 2;
    }
  }

  public registerOnChange(fn: (v: Date | Array<Date>) => void): void {
    this.onModelChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public select(date: Array<Date> | Date): void {
    if (this.disabled) {
      return;
    }

    if (Array.isArray(date)) {
      this.values = [...date];
    } else {
      this.value = date;
    }
    this.onModelChange(date);
    this.onModelTouched();
  }

  /**
   * Emits the selected year in multi-year view
   */
  public selectYear(normalizedYear: Date): void {
    this.yearSelected.emit(normalizedYear);
  }

  /**
   * Emits selected month in year view
   */
  public selectMonth(normalizedMonth: Date): void {
    this.writeValue(normalizedMonth);
    this.monthSelected.emit(normalizedMonth);
  }

  /**
   * Emits the selected date
   */
  public selectDate(normalizedDate: Date): void {
    this.writeValue(normalizedDate);
    this.dateSelected.emit(normalizedDate);
  }

  /**
   * Sets the active "selected" index in range mode.
   * - 0 for 'from'
   * - 1 for 'to'
   */
  protected setActiveSelectedIndex(index: number): void {
    if (this.selectMode === 'range' && this.activeSelectedIndex !== index) {
      this.activeSelectedIndex = index;

      const selected = this.selecteds[this.activeSelectedIndex];
      if (this.selecteds && selected) {
        this.value = this.#dateTimeAdapter.clone(selected);
      }
    }
    return;
  }

  /**
   * Handle click on inform radio group
   */
  protected handleKeydownOnInfoGroup(event: KeyboardEvent, next: HTMLElement, index: number): void {
    let handled = false;

    switch (event.key) {
      // Navigate between the radio group options with arrow keys
      case 'ArrowDown':
      case 'ArrowRight':
      case 'ArrowUp':
      case 'ArrowLeft':
        next.focus();
        this.setActiveSelectedIndex(index === 0 ? 1 : 0);
        handled = true;
        break;

      // Select the active selected index when space is pressed
      case ' ':
        this.setActiveSelectedIndex(index);
        handled = true;
        break;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}
