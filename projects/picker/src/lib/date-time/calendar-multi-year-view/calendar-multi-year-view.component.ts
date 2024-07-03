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
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewChild,
  inject
} from '@angular/core';
import { DateFilter } from '../../types/date-filter';
import { DateTimeAdapter } from '../adapter';
import { CalendarCell, OwlCalendarBodyComponent } from '../calendar-body';
import { SelectMode } from '../date-time';
import { OwlDateTimeIntl } from '../date-time-intl.service';
import { OptionsTokens } from '../options-provider';

@Component({
  standalone: true,
  selector: 'owl-date-time-multi-year-view',
  templateUrl: './calendar-multi-year-view.component.html',
  styleUrl: './calendar-multi-year-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OwlCalendarBodyComponent]
})

export class OwlMultiYearViewComponent<T> implements AfterContentInit {

  readonly #cdRef = inject(ChangeDetectorRef);

  readonly #pickerIntl = inject(OwlDateTimeIntl);

  readonly #dateTimeAdapter = inject<DateTimeAdapter<T>>(DateTimeAdapter, { optional: true });

  readonly #options = inject(OptionsTokens.multiYear);

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
      this.#cdRef.markForCheck();
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
    const deserialized = this.#dateTimeAdapter.deserialize(value);
    this._selected = this.getValidDate(deserialized);

    if (!this.#dateTimeAdapter.isSameDay(oldSelected, this._selected)) {
      this.setSelectedYears();
    }
  }

  private _selecteds: Array<T> = [];
  @Input()
  public get selecteds(): Array<T> {
    return this._selecteds;
  }
  public set selecteds(values: Array<T>) {
    this._selecteds = values.map((value) => {
      const deserialized = this.#dateTimeAdapter.deserialize(value);
      return this.getValidDate(deserialized);
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
    const deserialized = this.#dateTimeAdapter.deserialize(value);
    this._pickerMoment = this.getValidDate(deserialized) || this.#dateTimeAdapter.now();

    if (oldMoment && this._pickerMoment &&
      !this.isSameYearList(oldMoment, this._pickerMoment)) {
      this.generateYearList();
    }
  }

  /**
   * A function used to filter which dates are selectable
   */
  private _dateFilter: DateFilter<T>;
  @Input()
  public get dateFilter(): DateFilter<T> {
    return this._dateFilter;
  }
  public set dateFilter(filter: DateFilter<T>) {
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
    const deserialized = this.#dateTimeAdapter.deserialize(value);
    this._minDate = this.getValidDate(deserialized);
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
    const deserialized = this.#dateTimeAdapter.deserialize(value);
    this._maxDate = this.getValidDate(deserialized);
    if (this.initiated) {
      this.generateYearList();
    }
  }

  /**
   * Callback to invoke when a new month is selected
   */
  @Output() public readonly monthSelected = new EventEmitter<T>();

  /**
   * Emits the selected year. This doesn't imply a change on the selected date
   */
  @Output() public readonly yearSelected = new EventEmitter<T>();

  /** Emits when any date is activated. */
  @Output() public readonly pickerMomentChange = new EventEmitter<T>();

  /** Emits when use keyboard enter to select a calendar cell */
  @Output() public readonly keyboardEnter = new EventEmitter<void>();

  /** The body of calendar table */
  @ViewChild(OwlCalendarBodyComponent, { static: true })
  public calendarBodyElm: OwlCalendarBodyComponent;

  @HostBinding('class.owl-dt-calendar-view')
  public readonly owlDTCalendarView = true;

  @HostBinding('class.owl-dt-calendar-multi-year-view')
  public readonly owlDTCalendarMultiYearView = true;

  private _todayYear: number;
  public get todayYear(): number {
    return this._todayYear;
  }

  private _years: Array<Array<CalendarCell>>;
  public get years(): Array<Array<CalendarCell>> {
    return this._years;
  }

  private _selectedYears: Array<number>;
  public get selectedYears(): Array<number> {
    return this._selectedYears;
  }

  private initiated = false;

  public get isInSingleMode(): boolean {
    return this.selectMode === 'single';
  }

  public get isInRangeMode(): boolean {
    return (
      this.selectMode === 'range' ||
      this.selectMode === 'rangeFrom' ||
      this.selectMode === 'rangeTo'
    );
  }

  public get activeCell(): number | undefined {
    if (!this._pickerMoment) {
      return undefined;
    }
    const year = this.#dateTimeAdapter.getYear(this._pickerMoment);
    return year % (this.#options.yearsPerRow * this.#options.yearRows);
  }

  public get tableHeader(): string {
    if (this._years?.length) {
      const firstYear = this._years[0][0].displayValue;
      const lastYear = this._years[this.#options.yearRows - 1][this.#options.yearsPerRow - 1].displayValue;
      return `${firstYear} - ${lastYear}`;
    }
    return '';
  }

  public get prevButtonLabel(): string {
    return this.#pickerIntl.prevMultiYearLabel;
  }

  public get nextButtonLabel(): string {
    return this.#pickerIntl.nextMultiYearLabel;
  }

  public ngAfterContentInit(): void {
    this._todayYear = this.#dateTimeAdapter.getYear(this.#dateTimeAdapter.now());
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
    this.yearSelected.emit(this.#dateTimeAdapter.createDate(year, 0, 1));
    const firstDateOfMonth = this.#dateTimeAdapter.createDate(
      year,
      this.#dateTimeAdapter.getMonth(this.pickerMoment),
      1
    );
    const daysInMonth = this.#dateTimeAdapter.getNumDaysInMonth(firstDateOfMonth);
    const selected = this.#dateTimeAdapter.createDate(
      year,
      this.#dateTimeAdapter.getMonth(this.pickerMoment),
      Math.min(daysInMonth, this.#dateTimeAdapter.getDate(this.pickerMoment)),
      this.#dateTimeAdapter.getHours(this.pickerMoment),
      this.#dateTimeAdapter.getMinutes(this.pickerMoment),
      this.#dateTimeAdapter.getSeconds(this.pickerMoment)
    );

    this.monthSelected.emit(selected);
  }

  /**
   * Generate the previous year list
   */
  public prevYearList(event: Event): void {
    this._pickerMoment = this.#dateTimeAdapter.addCalendarYears(this.pickerMoment, -1 * this.#options.yearsPerRow * this.#options.yearRows);
    this.generateYearList();
    event.preventDefault();
  }

  /**
   * Generate the next year list
   */
  public nextYearList(event: Event): void {
    this._pickerMoment = this.#dateTimeAdapter.addCalendarYears(this.pickerMoment, this.#options.yearsPerRow * this.#options.yearRows);
    this.generateYearList();
    event.preventDefault();
  }

  public generateYearList(): void {
    this._years = [];

    const pickerMomentYear = this.#dateTimeAdapter.getYear(this._pickerMoment);
    const offset = pickerMomentYear % (this.#options.yearsPerRow * this.#options.yearRows);

    for (let i = 0; i < this.#options.yearRows; i++) {
      const row = [];

      for (let j = 0; j < this.#options.yearsPerRow; j++) {
        const year = pickerMomentYear - offset + (j + i * this.#options.yearsPerRow);
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
        moment = this.#dateTimeAdapter.addCalendarYears(this._pickerMoment, -1);
        this.pickerMomentChange.emit(moment);
        break;

      // add 1 year
      case RIGHT_ARROW:
        moment = this.#dateTimeAdapter.addCalendarYears(this._pickerMoment, 1);
        this.pickerMomentChange.emit(moment);
        break;

      // minus 3 years
      case UP_ARROW:
        moment = this.#dateTimeAdapter.addCalendarYears(this._pickerMoment, -1 * this.#options.yearsPerRow);
        this.pickerMomentChange.emit(moment);
        break;

      // add 3 years
      case DOWN_ARROW:
        moment = this.#dateTimeAdapter.addCalendarYears(this._pickerMoment, this.#options.yearsPerRow);
        this.pickerMomentChange.emit(moment);
        break;

      // go to the first year of the year page
      case HOME:
        moment = this.#dateTimeAdapter.addCalendarYears(this._pickerMoment,
          -this.#dateTimeAdapter.getYear(this._pickerMoment) % (this.#options.yearsPerRow * this.#options.yearRows));
        this.pickerMomentChange.emit(moment);
        break;

      // go to the last year of the year page
      case END:
        moment = this.#dateTimeAdapter.addCalendarYears(this._pickerMoment,
          (this.#options.yearsPerRow * this.#options.yearRows) - this.#dateTimeAdapter.getYear(this._pickerMoment) % (this.#options.yearsPerRow * this.#options.yearRows) - 1);
        this.pickerMomentChange.emit(moment);
        break;

      // minus 1 year page (or 10 year pages)
      case PAGE_UP:
        moment = this.#dateTimeAdapter.addCalendarYears(this.pickerMoment, event.altKey ? -10 * (this.#options.yearsPerRow * this.#options.yearRows) : -1 * (this.#options.yearsPerRow * this.#options.yearRows));
        this.pickerMomentChange.emit(moment);
        break;

      // add 1 year page (or 10 year pages)
      case PAGE_DOWN:
        moment = this.#dateTimeAdapter.addCalendarYears(this.pickerMoment, event.altKey ? 10 * (this.#options.yearsPerRow * this.#options.yearRows) : (this.#options.yearsPerRow * this.#options.yearRows));
        this.pickerMomentChange.emit(moment);
        break;

      case ENTER:
        this.selectYear(this.#dateTimeAdapter.getYear(this._pickerMoment));
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
    const startDateOfYear = this.#dateTimeAdapter.createDate(year, 0, 1);
    const ariaLabel = this.#dateTimeAdapter.getYearName(startDateOfYear);
    const cellClass = `owl-dt-year-${year}`;
    return new CalendarCell(year, year.toString(), ariaLabel, this.isYearEnabled(year), false, cellClass);
  }

  private setSelectedYears(): void {

    this._selectedYears = [];

    if (this.isInSingleMode && this.selected) {
      this._selectedYears[0] = this.#dateTimeAdapter.getYear(this.selected);
    }

    if (this.isInRangeMode && this.selecteds) {
      this._selectedYears = this.selecteds.map((selected) => {
        if (this.#dateTimeAdapter.isValid(selected)) {
          return this.#dateTimeAdapter.getYear(selected);
        } else {
          return null;
        }
      });
    }
  }

  /** Whether the given year is enabled. */
  private isYearEnabled(year: number): boolean {
    // disable if the year is greater than maxDate lower than minDate
    if (year === undefined || year === null ||
      (this.maxDate && year > this.#dateTimeAdapter.getYear(this.maxDate)) ||
      (this.minDate && year < this.#dateTimeAdapter.getYear(this.minDate))) {
      return false;
    }

    // enable if it reaches here and there's no filter defined
    if (!this.dateFilter) {
      return true;
    }

    const firstOfYear = this.#dateTimeAdapter.createDate(year, 0, 1);

    // If any date in the year is enabled count the year as enabled.
    for (let date = firstOfYear; this.#dateTimeAdapter.getYear(date) === year;
      date = this.#dateTimeAdapter.addCalendarDays(date, 1)) {
      if (this.dateFilter(date)) {
        return true;
      }
    }

    return false;
  }

  private isSameYearList(date1: T, date2: T): boolean {
    return Math.floor(this.#dateTimeAdapter.getYear(date1) / (this.#options.yearsPerRow * this.#options.yearRows)) ===
      Math.floor(this.#dateTimeAdapter.getYear(date2) / (this.#options.yearsPerRow * this.#options.yearRows));
  }

  /**
   * Get a valid date object
   */
  private getValidDate(obj: unknown): T | null {
    if (!this.#dateTimeAdapter.isDateInstance(obj)) return null;
    if (!this.#dateTimeAdapter.isValid(obj)) return null;
    return obj;
  }

  private focusActiveCell(): void {
    this.calendarBodyElm.focusActiveCell();
  }
}
