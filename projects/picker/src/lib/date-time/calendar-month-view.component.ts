import { getLocaleFirstDayOfWeek } from '@angular/common';
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

const DAYS_PER_WEEK = 7;
const WEEKS_PER_VIEW = 6;

@Component({
  standalone: false,
  selector: 'owl-date-time-month-view',
  exportAs: 'owlYearView',
  templateUrl: './calendar-month-view.component.html',
  styleUrls: ['./calendar-month-view.component.scss'],
  host: { 'class': 'owl-dt-calendar-view' },
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwlMonthViewComponent<T> implements OnInit, AfterContentInit {
  readonly #cdRef = inject(ChangeDetectorRef);
  readonly #dateTimeAdapter = inject<DateTimeAdapter<T>>(DateTimeAdapter, { optional: true });
  readonly #dateTimeFormats = inject<OwlDateTimeFormats>(OWL_DATE_TIME_FORMATS, { optional: true });
  readonly #destroyRef = inject(DestroyRef);

  /**
   * Whether to hide dates in other months at the start or end of the current month.
   */
  @Input()
  public hideOtherMonths = false;

  private isDefaultFirstDayOfWeek = true;

  private _firstDayOfWeek: number;
  /**
   * Set the first day of week.
   * Must be a number between `0` and `6` where:
   * - `0` = Sunday
   * - `6` = Saturday
   */
  @Input()
  public get firstDayOfWeek(): number {
    return this._firstDayOfWeek;
  }
  public set firstDayOfWeek(val: number) {
    if (val >= 0 && val <= 6 && val !== this._firstDayOfWeek) {
      this._firstDayOfWeek = val;
      this.isDefaultFirstDayOfWeek = false;

      if (this.initiated) {
        this.generateWeekDays();
        this.generateCalendar();
        this.#cdRef.markForCheck();
      }
    }
  }

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
      this.generateCalendar();
      this.#cdRef.markForCheck();
    }
  }

  /**
   * The currently selected date.
   */
  private _selected: Nullable<T>;
  @Input()
  public get selected(): Nullable<T> {
    return this._selected;
  }
  public set selected(value: Nullable<T>) {
    const oldSelected = this._selected;
    value = this.#dateTimeAdapter.deserialize(value);
    this._selected = this.getValidDate(value);

    if (!this.#dateTimeAdapter.isSameDay(oldSelected, this._selected)) {
      this.setSelectedDates();
    }
  }

  private _selecteds: Array<T> = [];
  @Input()
  public get selecteds(): Array<T> {
    return this._selecteds;
  }
  public set selecteds(values: Array<T>) {
    this._selecteds = values.map((value) => {
      value = this.#dateTimeAdapter.deserialize(value);
      return this.getValidDate(value);
    });
    this.setSelectedDates();
  }

  private _pickerMoment: T;
  @Input()
  public get pickerMoment(): T {
    return this._pickerMoment;
  }
  public set pickerMoment(value: T) {
    const oldMoment = this._pickerMoment;
    value = this.#dateTimeAdapter.deserialize(value);
    this._pickerMoment = this.getValidDate(value) || this.#dateTimeAdapter.now();

    this.firstDateOfMonth = this.#dateTimeAdapter.createDate(
      this.#dateTimeAdapter.getYear(this._pickerMoment),
      this.#dateTimeAdapter.getMonth(this._pickerMoment),
      1
    );

    if (!this.isSameMonth(oldMoment, this._pickerMoment) && this.initiated) {
      this.generateCalendar();
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
      this.generateCalendar();
      this.#cdRef.markForCheck();
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
      this.generateCalendar();
      this.#cdRef.markForCheck();
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
      this.generateCalendar();
      this.#cdRef.markForCheck();
    }
  }

  private _weekdays: Array<{ long: string; short: string; narrow: string }>;
  protected get weekdays(): Array<{ long: string; short: string; narrow: string }> {
    return this._weekdays;
  }

  private _days: Array<Array<CalendarCell>>;
  protected get days(): Array<Array<CalendarCell>> {
    return this._days;
  }

  protected get activeCell(): Maybe<number> {
    if (this.pickerMoment) {
      return this.#dateTimeAdapter.getDate(this.pickerMoment) + this.firstRowOffset - 1;
    }
    return undefined;
  }

  protected get isInSingleMode(): boolean {
    return this.selectMode === 'single';
  }

  protected get isInRangeMode(): boolean {
    return this.selectMode === 'range' || this.selectMode === 'rangeFrom' || this.selectMode === 'rangeTo';
  }

  private firstDateOfMonth: T;

  private initiated = false;

  /**
   * The date of the month that today falls on.
   */
  public todayDate: Nullable<number>;

  /**
   * An array to hold all selectedDates' value
   * the value is the day number in current month
   */
  public selectedDates: Array<number> = [];

  /**
   * the index of cell that contains the first date of the month
   */
  public firstRowOffset: number;

  /**
   * Callback to invoke when a new date is selected
   */
  public readonly selectedChange = output<Nullable<T>>();

  /**
   * Callback to invoke when any date is selected.
   */
  public readonly userSelection = output<void>();

  /**
   *  Emits when any date is activated.
   */
  public readonly pickerMomentChange = output<T>();

  /**
   *  The body of calendar table
   */
  @ViewChild(OwlCalendarBodyComponent, { static: true })
  protected calendarBodyElm: OwlCalendarBodyComponent;

  public ngOnInit(): void {
    this.updateFirstDayOfWeek(this.#dateTimeAdapter.getLocale());
    this.generateWeekDays();

    this.#dateTimeAdapter.localeChanges$.pipe(takeUntilDestroyed(this.#destroyRef)).subscribe((locale) => {
      this.updateFirstDayOfWeek(locale);
      this.generateWeekDays();
      this.generateCalendar();
      this.#cdRef.markForCheck();
    });
  }

  public ngAfterContentInit(): void {
    this.generateCalendar();
    this.initiated = true;
  }

  /**
   * Handle a calendarCell selected
   */
  public selectCalendarCell(cell: CalendarCell): void {
    // Cases in which the date would not be selected
    // 1, the calendar cell is NOT enabled (is NOT valid)
    // 2, the selected date is NOT in current picker's month and the hideOtherMonths is enabled
    if (!cell.enabled || (this.hideOtherMonths && cell.out)) {
      return;
    }

    this.selectDate(cell.value);
  }

  /**
   * Handle a new date selected
   */
  private selectDate(date: number): void {
    const daysDiff = date - 1;
    const selected = this.#dateTimeAdapter.addCalendarDays(this.firstDateOfMonth, daysDiff);

    this.selectedChange.emit(selected);
    this.userSelection.emit();
  }

  /**
   * Handle keydown event on calendar body
   */
  public handleCalendarKeydown(event: KeyboardEvent): void {
    let moment;
    switch (event.key) {
      // minus 1 day
      case KeyboardKeys.LEFT_ARROW:
        moment = this.#dateTimeAdapter.addCalendarDays(this.pickerMoment, -1);
        this.pickerMomentChange.emit(moment);
        break;

      // add 1 day
      case KeyboardKeys.RIGHT_ARROW:
        moment = this.#dateTimeAdapter.addCalendarDays(this.pickerMoment, 1);
        this.pickerMomentChange.emit(moment);
        break;

      // minus 1 week
      case KeyboardKeys.UP_ARROW:
        moment = this.#dateTimeAdapter.addCalendarDays(this.pickerMoment, -7);
        this.pickerMomentChange.emit(moment);
        break;

      // add 1 week
      case KeyboardKeys.DOWN_ARROW:
        moment = this.#dateTimeAdapter.addCalendarDays(this.pickerMoment, 7);
        this.pickerMomentChange.emit(moment);
        break;

      // move to first day of current month
      case KeyboardKeys.HOME:
        moment = this.#dateTimeAdapter.addCalendarDays(
          this.pickerMoment,
          1 - this.#dateTimeAdapter.getDate(this.pickerMoment)
        );
        this.pickerMomentChange.emit(moment);
        break;

      // move to last day of current month
      case KeyboardKeys.END:
        moment = this.#dateTimeAdapter.addCalendarDays(
          this.pickerMoment,
          this.#dateTimeAdapter.getNumDaysInMonth(this.pickerMoment) - this.#dateTimeAdapter.getDate(this.pickerMoment)
        );
        this.pickerMomentChange.emit(moment);
        break;

      // minus 1 month (or 1 year)
      case KeyboardKeys.PAGE_UP:
        moment =
          event.altKey ?
            this.#dateTimeAdapter.addCalendarYears(this.pickerMoment, -1)
          : this.#dateTimeAdapter.addCalendarMonths(this.pickerMoment, -1);
        this.pickerMomentChange.emit(moment);
        break;

      // add 1 month (or 1 year)
      case KeyboardKeys.PAGE_DOWN:
        moment =
          event.altKey ?
            this.#dateTimeAdapter.addCalendarYears(this.pickerMoment, 1)
          : this.#dateTimeAdapter.addCalendarMonths(this.pickerMoment, 1);
        this.pickerMomentChange.emit(moment);
        break;

      // select the pickerMoment
      case KeyboardKeys.ENTER:
        if (!this.dateFilter || this.dateFilter(this.pickerMoment)) {
          this.selectDate(this.#dateTimeAdapter.getDate(this.pickerMoment));
        }
        break;
      default:
        return;
    }

    this.focusActiveCell();
    event.preventDefault();
  }

  /**
   * Generate the calendar weekdays array
   */
  private generateWeekDays(): void {
    const longWeekdays = this.#dateTimeAdapter.getDayOfWeekNames('long');
    const shortWeekdays = this.#dateTimeAdapter.getDayOfWeekNames('short');
    const narrowWeekdays = this.#dateTimeAdapter.getDayOfWeekNames('narrow');
    const firstDayOfWeek = this.firstDayOfWeek;

    const weekdays = longWeekdays.map((long, i) => {
      return { long, short: shortWeekdays[i], narrow: narrowWeekdays[i] };
    });

    this._weekdays = weekdays.slice(firstDayOfWeek).concat(weekdays.slice(0, firstDayOfWeek));

    return;
  }

  /**
   * Generate the calendar days array
   */
  private generateCalendar(): void {
    if (!this.pickerMoment) {
      return;
    }

    this.todayDate = null;

    // the first weekday of the month
    const startWeekdayOfMonth = this.#dateTimeAdapter.getDay(this.firstDateOfMonth);
    const firstDayOfWeek = this.firstDayOfWeek;

    // the amount of days from the first date of the month
    // if it is < 0, it means the date is in previous month
    let daysDiff = 0 - ((startWeekdayOfMonth + (DAYS_PER_WEEK - firstDayOfWeek)) % DAYS_PER_WEEK);

    // the index of cell that contains the first date of the month
    this.firstRowOffset = Math.abs(daysDiff);

    this._days = [];
    for (let i = 0; i < WEEKS_PER_VIEW; i++) {
      const week = [];
      for (let j = 0; j < DAYS_PER_WEEK; j++) {
        const date = this.#dateTimeAdapter.addCalendarDays(this.firstDateOfMonth, daysDiff);
        const dateCell = this.createDateCell(date, daysDiff);

        // check if the date is today
        if (this.#dateTimeAdapter.isSameDay(this.#dateTimeAdapter.now(), date)) {
          this.todayDate = daysDiff + 1;
        }

        week.push(dateCell);
        daysDiff += 1;
      }
      this._days.push(week);
    }

    this.setSelectedDates();
  }

  private updateFirstDayOfWeek(locale: string): void {
    if (this.isDefaultFirstDayOfWeek) {
      try {
        this._firstDayOfWeek = getLocaleFirstDayOfWeek(locale);
      } catch {
        this._firstDayOfWeek = 0;
      }
    }
  }

  /**
   * Creates CalendarCell for days.
   */
  private createDateCell(date: T, daysDiff: number): CalendarCell {
    // total days of the month
    const daysInMonth = this.#dateTimeAdapter.getNumDaysInMonth(this.pickerMoment);
    const dateNum = this.#dateTimeAdapter.getDate(date);
    // const dateName = this.dateNames[dateNum - 1];
    const dateName = dateNum.toString();
    const ariaLabel = this.#dateTimeAdapter.format(date, this.#dateTimeFormats.dateA11yLabel);

    // check if the date if selectable
    const enabled = this.isDateEnabled(date);

    // check if date is not in current month
    const dayValue = daysDiff + 1;
    const out = dayValue < 1 || dayValue > daysInMonth;
    const cellClass = `owl-dt-day-${this.#dateTimeAdapter.getDay(date)}`;

    return new CalendarCell(dayValue, dateName, ariaLabel, enabled, out, cellClass);
  }

  /**
   * Check if the date is valid
   */
  private isDateEnabled(date: T): boolean {
    return (
      !!date &&
      (!this.dateFilter || this.dateFilter(date)) &&
      (!this.minDate || this.#dateTimeAdapter.compare(date, this.minDate) >= 0) &&
      (!this.maxDate || this.#dateTimeAdapter.compare(date, this.maxDate) <= 0)
    );
  }

  /**
   * Get a valid date object
   */
  private getValidDate(obj: unknown): Nullable<T> {
    return this.#dateTimeAdapter.isDateInstance(obj) && this.#dateTimeAdapter.isValid(obj) ? obj : null;
  }

  /**
   * Check if the give dates are none-null and in the same month
   */
  public isSameMonth(dateLeft: T, dateRight: T): boolean {
    return !!(
      dateLeft &&
      dateRight &&
      this.#dateTimeAdapter.isValid(dateLeft) &&
      this.#dateTimeAdapter.isValid(dateRight) &&
      this.#dateTimeAdapter.getYear(dateLeft) === this.#dateTimeAdapter.getYear(dateRight) &&
      this.#dateTimeAdapter.getMonth(dateLeft) === this.#dateTimeAdapter.getMonth(dateRight)
    );
  }

  /**
   * Set the selectedDates value.
   * In single mode, it has only one value which represent the selected date
   * In range mode, it would has two values, one for the fromValue and the other for the toValue
   */
  private setSelectedDates(): void {
    this.selectedDates = [];

    if (!this.firstDateOfMonth) {
      return;
    }

    if (this.isInSingleMode && this.selected) {
      const dayDiff = this.#dateTimeAdapter.differenceInCalendarDays(this.selected, this.firstDateOfMonth);
      this.selectedDates[0] = dayDiff + 1;
      return;
    }

    if (this.isInRangeMode && this.selecteds) {
      this.selectedDates = this.selecteds.map((selected) => {
        if (this.#dateTimeAdapter.isValid(selected)) {
          const dayDiff = this.#dateTimeAdapter.differenceInCalendarDays(selected, this.firstDateOfMonth);
          return dayDiff + 1;
        } else {
          return null;
        }
      });
    }
  }

  private focusActiveCell(): void {
    this.calendarBodyElm.focusActiveCell();
  }
}
