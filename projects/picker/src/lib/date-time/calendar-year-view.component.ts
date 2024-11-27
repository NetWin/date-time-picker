import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  Input,
  OnInit,
  ViewChild,
  inject,
  output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Maybe, Nullable } from '../types';
import { KeyboardKeys } from '../utils/keys';
import { DateTimeAdapter } from './adapter/date-time-adapter.class';
import { OWL_DATE_TIME_FORMATS, OwlDateTimeFormats } from './adapter/date-time-format.class';
import { CalendarCell, OwlCalendarBodyComponent } from './calendar-body.component';
import { SelectMode } from './date-time.class';

const MONTHS_PER_YEAR = 12;
const MONTHS_PER_ROW = 3;

@Component({
  standalone: false,
  selector: 'owl-date-time-year-view',
  exportAs: 'owlMonthView',
  templateUrl: './calendar-year-view.component.html',
  styleUrls: ['./calendar-year-view.component.scss'],
  host: { 'class': 'owl-dt-calendar-view' },
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwlYearViewComponent<T> implements OnInit, AfterContentInit {
  readonly #cdRef = inject(ChangeDetectorRef);
  readonly #dateTimeAdapter = inject<DateTimeAdapter<T>>(DateTimeAdapter, { optional: true });
  readonly #dateTimeFormats = inject<OwlDateTimeFormats>(OWL_DATE_TIME_FORMATS, { optional: true });
  readonly #destroyRef = inject(DestroyRef);

  /**
   * The select mode of the picker;
   */
  private _selectMode: SelectMode = 'single';
  @Input()
  public get selectMode(): SelectMode {
    return this._selectMode;
  }
  public set selectMode(val: SelectMode) {
    this._selectMode = val;
    if (this.initiated) {
      this.generateMonthList();
      this.#cdRef.markForCheck();
    }
  }

  /**
   *  The currently selected date.
   */
  private _selected: Nullable<T>;
  @Input()
  public get selected(): Nullable<T> {
    return this._selected;
  }
  public set selected(value: Nullable<T>) {
    value = this.#dateTimeAdapter.deserialize(value);
    this._selected = this.getValidDate(value);
    this.setSelectedMonths();
  }

  private _selecteds: Array<T> = [];
  @Input()
  public get selecteds(): Array<T> {
    return this._selecteds;
  }
  public set selecteds(values: Array<T>) {
    this._selecteds = [];
    for (const val of values) {
      const value = this.#dateTimeAdapter.deserialize(val);
      this._selecteds.push(this.getValidDate(value));
    }

    this.setSelectedMonths();
  }

  private _pickerMoment: Nullable<T>;
  @Input()
  public get pickerMoment(): Nullable<T> {
    return this._pickerMoment;
  }
  public set pickerMoment(value: T) {
    const oldMoment = this._pickerMoment;
    value = this.#dateTimeAdapter.deserialize(value);
    this._pickerMoment = this.getValidDate(value) || this.#dateTimeAdapter.now();

    if (!this.hasSameYear(oldMoment, this._pickerMoment) && this.initiated) {
      this.generateMonthList();
    }
  }

  /**
   * A function used to filter which dates are selectable
   */
  private _dateFilter: (date: T) => boolean;
  @Input()
  public get dateFilter(): (date: T) => boolean {
    return this._dateFilter;
  }
  public set dateFilter(filter: (date: T) => boolean) {
    this._dateFilter = filter;
    if (this.initiated) {
      this.generateMonthList();
    }
  }

  /**
   *  The minimum selectable date.
   */
  private _minDate: Nullable<T>;
  @Input()
  public get minDate(): Nullable<T> {
    return this._minDate;
  }
  public set minDate(value: Nullable<T>) {
    value = this.#dateTimeAdapter.deserialize(value);
    this._minDate = this.getValidDate(value);
    if (this.initiated) {
      this.generateMonthList();
    }
  }

  /**
   *  The maximum selectable date.
   */
  private _maxDate: Nullable<T>;
  @Input()
  public get maxDate(): Nullable<T> {
    return this._maxDate;
  }
  public set maxDate(value: Nullable<T>) {
    value = this.#dateTimeAdapter.deserialize(value);
    this._maxDate = this.getValidDate(value);
    if (this.initiated) {
      this.generateMonthList();
    }
  }

  private readonly monthNames: Array<string>;

  private _months: Array<Array<CalendarCell>>;
  protected get months(): Array<Array<CalendarCell>> {
    return this._months;
  }

  protected get activeCell(): Maybe<number> {
    if (this._pickerMoment) {
      return this.#dateTimeAdapter.getMonth(this._pickerMoment);
    }
    return undefined;
  }

  protected get isInSingleMode(): boolean {
    return this.selectMode === 'single';
  }

  protected get isInRangeMode(): boolean {
    return this.selectMode === 'range' || this.selectMode === 'rangeFrom' || this.selectMode === 'rangeTo';
  }

  private initiated = false;

  public todayMonth: Nullable<number>;

  /**
   * An array to hold all selectedDates' month value
   * the value is the month number in current year
   */
  public selectedMonths: Array<number> = [];

  /**
   * Callback to invoke when a new month is selected
   */
  public readonly monthChanged = output<T>();

  /**
   * Emits the selected year. This doesn't imply a change on the selected date
   */
  public readonly monthSelected = output<T>();

  /**
   *  Emits when any date is activated.
   */
  public readonly pickerMomentChange = output<T>();

  /**
   *  Emits when use keyboard enter to select a calendar cell
   */
  public readonly keyboardEnter = output<void>();

  /**
   *  The body of calendar table
   */
  @ViewChild(OwlCalendarBodyComponent, { static: true })
  protected calendarBodyElm: OwlCalendarBodyComponent;

  constructor() {
    this.monthNames = this.#dateTimeAdapter.getMonthNames('short');
  }

  public ngOnInit(): void {
    this.#dateTimeAdapter.localeChanges$.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe(() => {
      this.generateMonthList();
      this.#cdRef.markForCheck();
    });
  }

  public ngAfterContentInit(): void {
    this.generateMonthList();
    this.initiated = true;
  }

  /**
   * Handle a calendarCell selected
   */
  public selectCalendarCell(cell: CalendarCell): void {
    this.selectMonth(cell.value);
  }

  /**
   * Handle a new month selected
   */
  private selectMonth(month: number): void {
    const firstDateOfMonth = this.#dateTimeAdapter.createDate(
      this.#dateTimeAdapter.getYear(this.pickerMoment),
      month,
      1
    );

    this.monthSelected.emit(firstDateOfMonth);

    const daysInMonth = this.#dateTimeAdapter.getNumDaysInMonth(firstDateOfMonth);
    const result = this.#dateTimeAdapter.createDate(
      this.#dateTimeAdapter.getYear(this.pickerMoment),
      month,
      Math.min(daysInMonth, this.#dateTimeAdapter.getDate(this.pickerMoment)),
      this.#dateTimeAdapter.getHours(this.pickerMoment),
      this.#dateTimeAdapter.getMinutes(this.pickerMoment),
      this.#dateTimeAdapter.getSeconds(this.pickerMoment)
    );

    this.monthChanged.emit(result);
  }

  /**
   * Handle keydown event on calendar body
   */
  public handleCalendarKeydown(event: KeyboardEvent): void {
    let moment;
    switch (event.key) {
      // minus 1 month
      case KeyboardKeys.LEFT_ARROW:
        moment = this.#dateTimeAdapter.addCalendarMonths(this.pickerMoment, -1);
        this.pickerMomentChange.emit(moment);
        break;

      // add 1 month
      case KeyboardKeys.RIGHT_ARROW:
        moment = this.#dateTimeAdapter.addCalendarMonths(this.pickerMoment, 1);
        this.pickerMomentChange.emit(moment);
        break;

      // minus 3 months
      case KeyboardKeys.UP_ARROW:
        moment = this.#dateTimeAdapter.addCalendarMonths(this.pickerMoment, -3);
        this.pickerMomentChange.emit(moment);
        break;

      // add 3 months
      case KeyboardKeys.DOWN_ARROW:
        moment = this.#dateTimeAdapter.addCalendarMonths(this.pickerMoment, 3);
        this.pickerMomentChange.emit(moment);
        break;

      // move to first month of current year
      case KeyboardKeys.HOME:
        moment = this.#dateTimeAdapter.addCalendarMonths(
          this.pickerMoment,
          -this.#dateTimeAdapter.getMonth(this.pickerMoment)
        );
        this.pickerMomentChange.emit(moment);
        break;

      // move to last month of current year
      case KeyboardKeys.END:
        moment = this.#dateTimeAdapter.addCalendarMonths(
          this.pickerMoment,
          11 - this.#dateTimeAdapter.getMonth(this.pickerMoment)
        );
        this.pickerMomentChange.emit(moment);
        break;

      // minus 1 year (or 10 year)
      case KeyboardKeys.PAGE_UP:
        moment = this.#dateTimeAdapter.addCalendarYears(this.pickerMoment, event.altKey ? -10 : -1);
        this.pickerMomentChange.emit(moment);
        break;

      // add 1 year (or 10 year)
      case KeyboardKeys.PAGE_DOWN:
        moment = this.#dateTimeAdapter.addCalendarYears(this.pickerMoment, event.altKey ? 10 : 1);
        this.pickerMomentChange.emit(moment);
        break;

      // Select current month
      case KeyboardKeys.ENTER:
        this.selectMonth(this.#dateTimeAdapter.getMonth(this.pickerMoment));
        this.keyboardEnter.emit();
        break;
      default:
        return;
    }

    this.focusActiveCell();
    event.preventDefault();
  }

  /**
   * Generate the calendar month list
   */
  private generateMonthList(): void {
    if (!this.pickerMoment) {
      return;
    }

    this.setSelectedMonths();
    this.todayMonth = this.getMonthInCurrentYear(this.#dateTimeAdapter.now());

    this._months = [];
    for (let i = 0; i < MONTHS_PER_YEAR / MONTHS_PER_ROW; i++) {
      const row = [];

      for (let j = 0; j < MONTHS_PER_ROW; j++) {
        const month = j + i * MONTHS_PER_ROW;
        const monthCell = this.createMonthCell(month);
        row.push(monthCell);
      }

      this._months.push(row);
    }

    return;
  }

  /**
   * Creates an CalendarCell for the given month.
   */
  private createMonthCell(month: number): CalendarCell {
    const startDateOfMonth = this.#dateTimeAdapter.createDate(
      this.#dateTimeAdapter.getYear(this.pickerMoment),
      month,
      1
    );
    const ariaLabel = this.#dateTimeAdapter.format(startDateOfMonth, this.#dateTimeFormats.monthYearA11yLabel);
    const cellClass = `owl-dt-month-${month}`;
    return new CalendarCell(month, this.monthNames[month], ariaLabel, this.isMonthEnabled(month), false, cellClass);
  }

  /**
   * Check if the given month is enable
   */
  private isMonthEnabled(month: number): boolean {
    const firstDateOfMonth = this.#dateTimeAdapter.createDate(
      this.#dateTimeAdapter.getYear(this.pickerMoment),
      month,
      1
    );

    // If any date in the month is selectable,
    // we count the month as enable
    for (
      let date = firstDateOfMonth;
      this.#dateTimeAdapter.getMonth(date) === month;
      date = this.#dateTimeAdapter.addCalendarDays(date, 1)
    ) {
      if (
        !!date &&
        (!this.dateFilter || this.dateFilter(date)) &&
        (!this.minDate || this.#dateTimeAdapter.compare(date, this.minDate) >= 0) &&
        (!this.maxDate || this.#dateTimeAdapter.compare(date, this.maxDate) <= 0)
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Gets the month in this year that the given Date falls on.
   * Returns null if the given Date is in another year.
   */
  private getMonthInCurrentYear(date: Nullable<T>): number {
    if (this.getValidDate(date) && this.getValidDate(this._pickerMoment)) {
      const result = this.#dateTimeAdapter.compareYear(date, this._pickerMoment);

      // < 0 : the given date's year is before pickerMoment's year, we return -1 as selected month value.
      // > 0 : the given date's year is after pickerMoment's year, we return 12 as selected month value.
      // 0 : the give date's year is same as the pickerMoment's year, we return the actual month value.
      if (result < 0) {
        return -1;
      } else if (result > 0) {
        return 12;
      } else {
        return this.#dateTimeAdapter.getMonth(date);
      }
    } else {
      return null;
    }
  }

  /**
   * Set the selectedMonths value
   * In single mode, it has only one value which represent the month the selected date in
   * In range mode, it would has two values, one for the month the fromValue in and the other for the month the toValue in
   */
  private setSelectedMonths(): void {
    this.selectedMonths = [];
    if (this.isInSingleMode && this.selected) {
      this.selectedMonths[0] = this.getMonthInCurrentYear(this.selected);
    }

    if (this.isInRangeMode && this.selecteds) {
      this.selectedMonths[0] = this.getMonthInCurrentYear(this.selecteds[0]);
      this.selectedMonths[1] = this.getMonthInCurrentYear(this.selecteds[1]);
    }
  }

  /**
   * Check the given dates are in the same year
   */
  private hasSameYear(dateLeft: T, dateRight: T): boolean {
    return !!(
      dateLeft &&
      dateRight &&
      this.#dateTimeAdapter.getYear(dateLeft) === this.#dateTimeAdapter.getYear(dateRight)
    );
  }

  /**
   * Get a valid date object
   */
  private getValidDate(obj: unknown): Nullable<T> {
    return this.#dateTimeAdapter.isDateInstance(obj) && this.#dateTimeAdapter.isValid(obj) ? obj : null;
  }

  private focusActiveCell(): void {
    this.calendarBodyElm.focusActiveCell();
  }
}
