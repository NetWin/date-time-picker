import {
  DOWN_ARROW,
  END,
  ENTER,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  UP_ARROW
} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  inject,
  output,
  viewChild
} from '@angular/core';
import { DateTimeAdapter } from './adapter/date-time-adapter.class';
import { CalendarCell, OwlCalendarBodyComponent } from './calendar-body.component';
import { OwlDateTimeIntl } from './date-time-picker-intl.service';
import { SelectMode } from './date-time.class';
import { OptionsTokens } from './options-provider';

@Component({
  standalone: false,
  selector: 'owl-date-time-multi-year-view',
  templateUrl: './calendar-multi-year-view.component.html',
  host: { 'class': 'owl-dt-calendar-view owl-dt-calendar-multi-year-view' },
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwlMultiYearViewComponent<T> implements AfterContentInit {
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly pickerIntl = inject(OwlDateTimeIntl);
  private readonly dateTimeAdapter = inject(DateTimeAdapter<T>, { optional: true });
  private readonly options = inject(OptionsTokens.all);

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
      this.setSelectedYears();
      this.cdRef.markForCheck();
    }
  }

  /** The currently selected date. */
  private _selected: T | null;
  @Input()
  public get selected(): T | null {
    return this._selected;
  }

  public set selected(value: T | null) {
    const oldSelected = this._selected;
    value = this.dateTimeAdapter.deserialize(value);
    this._selected = this.getValidDate(value);

    if (!this.dateTimeAdapter.isSameDay(oldSelected, this._selected)) {
      this.setSelectedYears();
    }
  }

  private _selecteds: Array<T> = [];
  @Input()
  public get selecteds(): Array<T> {
    return this._selecteds;
  }

  public set selecteds(values: Array<T>) {
    this._selecteds = values.map((v) => {
      v = this.dateTimeAdapter.deserialize(v);
      return this.getValidDate(v);
    });
    this.setSelectedYears();
  }

  private _pickerMoment: T | null;
  @Input()
  public get pickerMoment(): T | null {
    return this._pickerMoment;
  }

  public set pickerMoment(value: T) {
    const oldMoment = this._pickerMoment;
    value = this.dateTimeAdapter.deserialize(value);
    this._pickerMoment = this.getValidDate(value) || this.dateTimeAdapter.now();

    if (oldMoment && this._pickerMoment && !this.isSameYearList(oldMoment, this._pickerMoment)) {
      this.generateYearList();
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
      this.generateYearList();
    }
  }

  /** The minimum selectable date. */
  private _minDate: T | null;
  @Input()
  public get minDate(): T | null {
    return this._minDate;
  }

  public set minDate(value: T | null) {
    value = this.dateTimeAdapter.deserialize(value);
    this._minDate = this.getValidDate(value);
    if (this.initiated) {
      this.generateYearList();
    }
  }

  /** The maximum selectable date. */
  private _maxDate: T | null;
  @Input()
  public get maxDate(): T | null {
    return this._maxDate;
  }

  public set maxDate(value: T | null) {
    value = this.dateTimeAdapter.deserialize(value);
    this._maxDate = this.getValidDate(value);
    if (this.initiated) {
      this.generateYearList();
    }
  }

  private _todayYear: number;
  protected get todayYear(): number {
    return this._todayYear;
  }

  private _years: Array<Array<CalendarCell>>;
  protected get years(): Array<Array<CalendarCell>> {
    return this._years;
  }

  private _selectedYears: Array<number>;
  protected get selectedYears(): Array<number> {
    return this._selectedYears;
  }

  private initiated = false;

  protected get isInSingleMode(): boolean {
    return this.selectMode === 'single';
  }

  protected get isInRangeMode(): boolean {
    return this.selectMode === 'range' || this.selectMode === 'rangeFrom' || this.selectMode === 'rangeTo';
  }

  protected get activeCell(): number | undefined {
    if (this._pickerMoment) {
      return (
        this.dateTimeAdapter.getYear(this._pickerMoment) %
        (this.options.multiYear.yearsPerRow * this.options.multiYear.yearRows)
      );
    }
    return undefined;
  }

  protected get tableHeader(): string | undefined {
    if (this._years && this._years.length > 0) {
      return `${this._years[0][0].displayValue} - ${this._years[this.options.multiYear.yearRows - 1][this.options.multiYear.yearsPerRow - 1].displayValue}`;
    }
    return undefined;
  }

  protected get prevButtonLabel(): string {
    return this.pickerIntl.prevMultiYearLabel;
  }

  protected get nextButtonLabel(): string {
    return this.pickerIntl.nextMultiYearLabel;
  }

  /**
   * Callback to invoke when a new month is selected
   */
  public readonly changeYear = output<T>();

  /**
   * Emits the selected year. This doesn't imply a change on the selected date
   */
  public readonly yearSelected = output<T>();

  /** Emits when any date is activated. */
  public readonly pickerMomentChange = output<T>();

  /** Emits when use keyboard enter to select a calendar cell */
  public readonly keyboardEnter = output<void>();

  /** The body of calendar table */
  protected readonly calendarBodyElm = viewChild(OwlCalendarBodyComponent);

  public ngAfterContentInit(): void {
    this._todayYear = this.dateTimeAdapter.getYear(this.dateTimeAdapter.now());
    this.generateYearList();
    this.initiated = true;
  }

  /**
   * Handle a calendarCell selected
   */
  public selectCalendarCell(cell: CalendarCell): void {
    this.selectYear(cell.value);
  }

  private selectYear(year: number): void {
    this.yearSelected.emit(this.dateTimeAdapter.createDate(year, 0, 1));
    const firstDateOfMonth = this.dateTimeAdapter.createDate(year, this.dateTimeAdapter.getMonth(this.pickerMoment), 1);
    const daysInMonth = this.dateTimeAdapter.getNumDaysInMonth(firstDateOfMonth);
    const selected = this.dateTimeAdapter.createDate(
      year,
      this.dateTimeAdapter.getMonth(this.pickerMoment),
      Math.min(daysInMonth, this.dateTimeAdapter.getDate(this.pickerMoment)),
      this.dateTimeAdapter.getHours(this.pickerMoment),
      this.dateTimeAdapter.getMinutes(this.pickerMoment),
      this.dateTimeAdapter.getSeconds(this.pickerMoment)
    );

    this.changeYear.emit(selected);
  }

  /**
   * Generate the previous year list
   */
  public prevYearList(event: Event): void {
    this._pickerMoment = this.dateTimeAdapter.addCalendarYears(
      this.pickerMoment,
      -1 * this.options.multiYear.yearsPerRow * this.options.multiYear.yearRows
    );
    this.generateYearList();
    event.preventDefault();
  }

  /**
   * Generate the next year list
   */
  public nextYearList(event: Event): void {
    this._pickerMoment = this.dateTimeAdapter.addCalendarYears(
      this.pickerMoment,
      this.options.multiYear.yearsPerRow * this.options.multiYear.yearRows
    );
    this.generateYearList();
    event.preventDefault();
  }

  public generateYearList(): void {
    this._years = [];

    const pickerMomentYear = this.dateTimeAdapter.getYear(this._pickerMoment);
    const offset = pickerMomentYear % (this.options.multiYear.yearsPerRow * this.options.multiYear.yearRows);

    for (let i = 0; i < this.options.multiYear.yearRows; i++) {
      const row = [];

      for (let j = 0; j < this.options.multiYear.yearsPerRow; j++) {
        const year = pickerMomentYear - offset + (j + i * this.options.multiYear.yearsPerRow);
        const yearCell = this.createYearCell(year);
        row.push(yearCell);
      }

      this._years.push(row);
    }

    return;
  }

  /** Whether the previous period button is enabled. */
  public previousEnabled(): boolean {
    if (!this.minDate) {
      return true;
    }
    return !this.minDate || !this.isSameYearList(this._pickerMoment, this.minDate);
  }

  /** Whether the next period button is enabled. */
  public nextEnabled(): boolean {
    return !this.maxDate || !this.isSameYearList(this._pickerMoment, this.maxDate);
  }

  public handleCalendarKeydown(event: KeyboardEvent): void {
    let moment;
    switch (event.keyCode) {
      // minus 1 year
      case LEFT_ARROW:
        moment = this.dateTimeAdapter.addCalendarYears(this._pickerMoment, -1);
        this.pickerMomentChange.emit(moment);
        break;

      // add 1 year
      case RIGHT_ARROW:
        moment = this.dateTimeAdapter.addCalendarYears(this._pickerMoment, 1);
        this.pickerMomentChange.emit(moment);
        break;

      // minus 3 years
      case UP_ARROW:
        moment = this.dateTimeAdapter.addCalendarYears(this._pickerMoment, -1 * this.options.multiYear.yearsPerRow);
        this.pickerMomentChange.emit(moment);
        break;

      // add 3 years
      case DOWN_ARROW:
        moment = this.dateTimeAdapter.addCalendarYears(this._pickerMoment, this.options.multiYear.yearsPerRow);
        this.pickerMomentChange.emit(moment);
        break;

      // go to the first year of the year page
      case HOME:
        moment = this.dateTimeAdapter.addCalendarYears(
          this._pickerMoment,
          -this.dateTimeAdapter.getYear(this._pickerMoment) %
            (this.options.multiYear.yearsPerRow * this.options.multiYear.yearRows)
        );
        this.pickerMomentChange.emit(moment);
        break;

      // go to the last year of the year page
      case END:
        moment = this.dateTimeAdapter.addCalendarYears(
          this._pickerMoment,
          this.options.multiYear.yearsPerRow * this.options.multiYear.yearRows -
            (this.dateTimeAdapter.getYear(this._pickerMoment) %
              (this.options.multiYear.yearsPerRow * this.options.multiYear.yearRows)) -
            1
        );
        this.pickerMomentChange.emit(moment);
        break;

      // minus 1 year page (or 10 year pages)
      case PAGE_UP:
        moment = this.dateTimeAdapter.addCalendarYears(
          this.pickerMoment,
          event.altKey ?
            -10 * (this.options.multiYear.yearsPerRow * this.options.multiYear.yearRows)
          : -1 * (this.options.multiYear.yearsPerRow * this.options.multiYear.yearRows)
        );
        this.pickerMomentChange.emit(moment);
        break;

      // add 1 year page (or 10 year pages)
      case PAGE_DOWN:
        moment = this.dateTimeAdapter.addCalendarYears(
          this.pickerMoment,
          event.altKey ?
            10 * (this.options.multiYear.yearsPerRow * this.options.multiYear.yearRows)
          : this.options.multiYear.yearsPerRow * this.options.multiYear.yearRows
        );
        this.pickerMomentChange.emit(moment);
        break;

      case ENTER:
        this.selectYear(this.dateTimeAdapter.getYear(this._pickerMoment));
        this.keyboardEnter.emit();
        break;

      default:
        return;
    }

    this.focusActiveCell();
    event.preventDefault();
  }

  /**
   * Creates an CalendarCell for the given year.
   */
  private createYearCell(year: number): CalendarCell {
    const startDateOfYear = this.dateTimeAdapter.createDate(year, 0, 1);
    const ariaLabel = this.dateTimeAdapter.getYearName(startDateOfYear);
    const cellClass = `owl-dt-year-${year}`;
    return new CalendarCell(year, year.toString(), ariaLabel, this.isYearEnabled(year), false, cellClass);
  }

  private setSelectedYears(): void {
    this._selectedYears = [];

    if (this.isInSingleMode && this.selected) {
      this._selectedYears[0] = this.dateTimeAdapter.getYear(this.selected);
    }

    if (this.isInRangeMode && this.selecteds) {
      this._selectedYears = this.selecteds.map((selected) => {
        if (this.dateTimeAdapter.isValid(selected)) {
          return this.dateTimeAdapter.getYear(selected);
        } else {
          return null;
        }
      });
    }
  }

  /** Whether the given year is enabled. */
  private isYearEnabled(year: number): boolean {
    // disable if the year is greater than maxDate lower than minDate
    if (
      year === undefined ||
      year === null ||
      (this.maxDate && year > this.dateTimeAdapter.getYear(this.maxDate)) ||
      (this.minDate && year < this.dateTimeAdapter.getYear(this.minDate))
    ) {
      return false;
    }

    // enable if it reaches here and there's no filter defined
    if (!this.dateFilter) {
      return true;
    }

    const firstOfYear = this.dateTimeAdapter.createDate(year, 0, 1);

    // If any date in the year is enabled count the year as enabled.
    for (
      let date = firstOfYear;
      this.dateTimeAdapter.getYear(date) === year;
      date = this.dateTimeAdapter.addCalendarDays(date, 1)
    ) {
      if (this.dateFilter(date)) {
        return true;
      }
    }

    return false;
  }

  private isSameYearList(date1: T, date2: T): boolean {
    return (
      Math.floor(
        this.dateTimeAdapter.getYear(date1) / (this.options.multiYear.yearsPerRow * this.options.multiYear.yearRows)
      ) ===
      Math.floor(
        this.dateTimeAdapter.getYear(date2) / (this.options.multiYear.yearsPerRow * this.options.multiYear.yearRows)
      )
    );
  }

  /**
   * Get a valid date object
   */
  private getValidDate(obj: unknown): T | null {
    return this.dateTimeAdapter.isDateInstance(obj) && this.dateTimeAdapter.isValid(obj) ? obj : null;
  }

  private focusActiveCell(): void {
    this.calendarBodyElm().focusActiveCell();
  }
}
