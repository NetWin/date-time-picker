import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, EventEmitter,
  forwardRef,
  HostBinding,
  inject,
  Input,
  OnInit,
  Output,
  Provider,
  ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DateFilter } from '../../types/date-filter';
import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OwlDateTimeFormats } from '../adapter';
import {
  OwlDateTime,
  PickerType,
  SelectMode
} from '../date-time';
import { OwlDateTimeContainerComponent } from '../date-time-picker-container';

const OWL_DATETIME_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => OwlDateTimeInlineComponent),
  multi: true
};

@Component({
  standalone: true,
  selector: 'owl-date-time-inline',
  templateUrl: './date-time-inline.component.html',
  styleUrl: './date-time-inline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OWL_DATETIME_VALUE_ACCESSOR],
  imports:[OwlDateTimeContainerComponent]
})
export class OwlDateTimeInlineComponent<T> extends OwlDateTime<T> implements OnInit, ControlValueAccessor {

  readonly #changeDetector = inject(ChangeDetectorRef);

  protected override dateTimeAdapter = inject<DateTimeAdapter<T>>(DateTimeAdapter, { optional: true });

  protected override dateTimeFormats = inject<OwlDateTimeFormats>(OWL_DATE_TIME_FORMATS, { optional: true });

  @ViewChild(OwlDateTimeContainerComponent, { static: true })
  public container: OwlDateTimeContainerComponent<T>;

  /**
   * Set the type of the dateTime picker
   *      'both' -- show both calendar and timer
   *      'calendar' -- show only calendar
   *      'timer' -- show only timer
   */
  private _pickerType: PickerType = 'both';
  @Input()
  public get pickerType(): PickerType {
    return this._pickerType;
  }

  public set pickerType(val: PickerType) {
    if (val !== this._pickerType) {
      this._pickerType = val;
    }
  }

  private _disabled = false;
  @Input()
  public override get disabled(): boolean {
    return !!this._disabled;
  }

  public override set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  private _selectMode: SelectMode = 'single';
  @Input()
  public get selectMode(): SelectMode {
    return this._selectMode;
  }

  public set selectMode(mode: SelectMode) {
    if (
      mode !== 'single' &&
      mode !== 'range' &&
      mode !== 'rangeFrom' &&
      mode !== 'rangeTo'
    ) {
      throw Error('OwlDateTime Error: invalid selectMode value!');
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
    } else if (
      this.selectMode === 'range' ||
      this.selectMode === 'rangeFrom'
    ) {
      return this.values[0] || null;
    } else if (this.selectMode === 'rangeTo') {
      return this.values[1] || null;
    } else {
      return null;
    }
  }

  public set startAt(date: T | null) {
    this._startAt = this.getValidDate(
      this.dateTimeAdapter.deserialize(date)
    );
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
    } else if (
      this.selectMode === 'range' ||
      this.selectMode === 'rangeFrom'
    ) {
      return this.values[1] || null;
    } else {
      return null;
    }
  }

  public set endAt(date: T | null) {
    this._endAt = this.getValidDate(
      this.dateTimeAdapter.deserialize(date)
    );
  }

  private _dateTimeFilter: DateFilter<T>;
  @Input('owlDateTimeFilter')
  public get dateTimeFilter(): DateFilter<T> {
    return this._dateTimeFilter;
  }

  public set dateTimeFilter(filter: DateFilter<T>) {
    this._dateTimeFilter = filter;
  }

  /** The minimum valid date. */
  private _min: T | null;

  public get minDateTime(): T | null {
    return this._min || null;
  }

  // TODO: fix this
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('min')
  public set minDateTime(value: T | null) {
    this._min = this.getValidDate(this.dateTimeAdapter.deserialize(value));
    this.#changeDetector.markForCheck();
  }

  /** The maximum valid date. */
  private _max: T | null;

  public get maxDateTime(): T | null {
    return this._max || null;
  }

  // TODO: fix this
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('max')
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
    const deserialized = this.dateTimeAdapter.deserialize(value);
    const validated = this.getValidDate(deserialized);
    this._value = validated;
    this.selected = validated;
  }

  private _values: Array<T> = [];
  @Input()
  public get values(): Array<T> {
    return this._values;
  }

  public set values(values: Array<T>) {
    if (values?.length > 0) {
      values = values.map(value => {
        const deserialized = this.dateTimeAdapter.deserialize(value);
        const validated = this.getValidDate(deserialized);
        return validated ? this.dateTimeAdapter.clone(validated) : null;
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
  public readonly yearSelected = new EventEmitter<T>();

  /**
   * Emits selected month in year view
   * This doesn't imply a change on the selected date.
   */
  @Output()
  public readonly monthSelected = new EventEmitter<T>();

  /**
   * Emits selected date
   */
  @Output()
  public readonly dateSelected = new EventEmitter<T>();

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

  public readonly opened = true;

  public readonly pickerMode = 'inline';

  public get isInSingleMode(): boolean {
    return this._selectMode === 'single';
  }

  public get isInRangeMode(): boolean {
    return (
      this._selectMode === 'range' ||
      this._selectMode === 'rangeFrom' ||
      this._selectMode === 'rangeTo'
    );
  }

  @HostBinding('class.owl-dt-inline')
  public owlDTInlineClass = true;

  private onModelChange: (value: T | Array<T> | null) => void = () => { /** noop */ };
  private onModelTouched: () => void = () => { /** noop */ };

  public ngOnInit(): void {
    this.container.picker = this;
  }

  public writeValue(value: T | Array<T>): void {
    if (this.isInSingleMode) {
      this.value = value as T;
      this.container.pickerMoment = value as T;
    } else {
      this.values = value as Array<T>;
      this.container.pickerMoment = this._values[
        this.container.activeSelectedIndex
      ];
    }
  }

  public registerOnChange(fn: (value: T | null) => void): void {
    this.onModelChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onModelTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
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
