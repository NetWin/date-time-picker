import {
  AfterContentInit,
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  NgZone,
  output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { DateTimeAdapter } from './adapter/date-time-adapter.class';
import { OWL_DATE_TIME_FORMATS } from './adapter/date-time-format.class';
import { OwlDateTimeIntl } from './date-time-picker-intl.service';
import { DateView, DateViewType, SelectMode } from './date-time.class';

@Component({
  standalone: false,
  selector: 'owl-date-time-calendar',
  exportAs: 'owlDateTimeCalendar',
  templateUrl: './calendar.component.html',
  host: { 'class': 'owl-dt-calendar' },
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwlCalendarComponent<T> implements AfterContentInit, AfterViewChecked {
  private readonly elmRef = inject(ElementRef);
  private readonly pickerIntl = inject(OwlDateTimeIntl);
  private readonly ngZone = inject(NgZone);
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly dateTimeAdapter = inject(DateTimeAdapter<T>, { optional: true });
  private readonly dateTimeFormats = inject(OWL_DATE_TIME_FORMATS, { optional: true });

  DateView = DateView;

  @Input()
  get minDate(): T | null {
    return this._minDate;
  }

  set minDate(value: T | null) {
    value = this.dateTimeAdapter.deserialize(value);
    value = this.getValidDate(value);

    this._minDate =
      value ?
        this.dateTimeAdapter.createDate(
          this.dateTimeAdapter.getYear(value),
          this.dateTimeAdapter.getMonth(value),
          this.dateTimeAdapter.getDate(value)
        )
      : null;
  }

  @Input()
  get maxDate(): T | null {
    return this._maxDate;
  }

  set maxDate(value: T | null) {
    value = this.dateTimeAdapter.deserialize(value);
    value = this.getValidDate(value);

    this._maxDate =
      value ?
        this.dateTimeAdapter.createDate(
          this.dateTimeAdapter.getYear(value),
          this.dateTimeAdapter.getMonth(value),
          this.dateTimeAdapter.getDate(value)
        )
      : null;
  }

  @Input()
  get pickerMoment(): T {
    return this._pickerMoment;
  }

  set pickerMoment(value: T) {
    value = this.dateTimeAdapter.deserialize(value);
    this._pickerMoment = this.getValidDate(value) || this.dateTimeAdapter.now();
  }

  @Input()
  get selected(): T | null {
    return this._selected;
  }

  set selected(value: T | null) {
    value = this.dateTimeAdapter.deserialize(value);
    this._selected = this.getValidDate(value);
  }

  @Input()
  get selecteds(): Array<T> {
    return this._selecteds;
  }

  set selecteds(values: Array<T>) {
    this._selecteds = values.map((v) => {
      v = this.dateTimeAdapter.deserialize(v);
      return this.getValidDate(v);
    });
  }

  get periodButtonText(): string {
    return this.isMonthView ?
        this.dateTimeAdapter.format(this.pickerMoment, this.dateTimeFormats.monthYearLabel)
      : this.dateTimeAdapter.getYearName(this.pickerMoment);
  }

  get periodButtonLabel(): string {
    return this.isMonthView ? this.pickerIntl.switchToMultiYearViewLabel : this.pickerIntl.switchToMonthViewLabel;
  }

  get todayButtonLabel(): string {
    return this.pickerIntl.todayButtonLabel;
  }

  get prevButtonLabel(): string {
    if (this._currentView === DateView.MONTH) {
      return this.pickerIntl.prevMonthLabel;
    } else if (this._currentView === DateView.YEAR) {
      return this.pickerIntl.prevYearLabel;
    } else {
      return null;
    }
  }

  get nextButtonLabel(): string {
    if (this._currentView === DateView.MONTH) {
      return this.pickerIntl.nextMonthLabel;
    } else if (this._currentView === DateView.YEAR) {
      return this.pickerIntl.nextYearLabel;
    } else {
      return null;
    }
  }

  get currentView(): DateViewType {
    return this._currentView;
  }

  set currentView(view: DateViewType) {
    this._currentView = view;
    this.moveFocusOnNextTick = true;
  }

  get isInSingleMode(): boolean {
    return this.selectMode === 'single';
  }

  get isInRangeMode(): boolean {
    return this.selectMode === 'range' || this.selectMode === 'rangeFrom' || this.selectMode === 'rangeTo';
  }

  get showControlArrows(): boolean {
    return this._currentView !== DateView.MULTI_YEARS;
  }

  get isMonthView(): boolean {
    return this._currentView === DateView.MONTH;
  }

  public get isTodayAllowed(): boolean {
    if (!this.dateTimeAdapter) {
      return false;
    }
    const now = this.dateTimeAdapter.now();
    // Normalize 'today' to the start of the day, how minDate and maxDate are stored
    const today = this.dateTimeAdapter.createDate(
      this.dateTimeAdapter.getYear(now),
      this.dateTimeAdapter.getMonth(now),
      this.dateTimeAdapter.getDate(now)
    );

    if (this.minDate && this.dateTimeAdapter.compare(today, this.minDate) < 0) {
      return false;
    }

    if (this.maxDate && this.dateTimeAdapter.compare(today, this.maxDate) > 0) {
      return false;
    }

    return true;
  }

  /**
   * Date filter for the month and year view
   */
  @Input()
  public dateFilter: (date: T) => boolean;

  /**
   * Set the first day of week
   */
  @Input()
  public firstDayOfWeek: number;

  /** The minimum selectable date. */
  private _minDate: T | null;

  /** The maximum selectable date. */
  private _maxDate: T | null;

  /** The current picker moment */
  private _pickerMoment: T;

  @Input()
  public selectMode: SelectMode;

  /** The currently selected moment. */
  private _selected: T | null;

  private _selecteds: Array<T> = [];

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
   * Whether to hide dates in other months at the start or end of the current month.
   */
  @Input()
  public hideOtherMonths: boolean;

  /**
   * Flag to show today button to jump to today's date. Defaults to `false`.
   */
  @Input()
  public showTodayButton: boolean = false;

  /**
   * Emits when the currently picker moment changes.
   */
  public readonly pickerMomentChange = output<T>();

  /**
   * Emits when the selected date changes.
   */
  public readonly dateClicked = output<T>();

  /**
   * Emits when the currently selected date changes.
   */
  public readonly selectedChange = output<T>();

  /**
   * Emits when any date is selected.
   */
  public readonly userSelection = output<void>();

  /**
   * Emits the selected year. This doesn't imply a change on the selected date
   */
  public readonly yearSelected = output<T>();

  /**
   * Emits the selected month. This doesn't imply a change on the selected date
   */
  public readonly monthSelected = output<T>();

  private _currentView: DateViewType;

  constructor() {
    this.pickerIntl.changes.pipe(takeUntilDestroyed()).subscribe(() => {
      this.cdRef.markForCheck();
    });
  }

  /**
   * Used for scheduling that focus should be moved to the active cell on the next tick.
   * We need to schedule it, rather than do it immediately, because we have to wait
   * for Angular to re-evaluate the view children.
   */
  private moveFocusOnNextTick = false;

  /**
   * Date filter for the month and year view
   */
  public dateFilterForViews: (date: T | null) => boolean = (date: T) => {
    return (
      !!date &&
      (!this.dateFilter || this.dateFilter(date)) &&
      (!this.minDate || this.dateTimeAdapter.compare(date, this.minDate) >= 0) &&
      (!this.maxDate || this.dateTimeAdapter.compare(date, this.maxDate) <= 0)
    );
  };

  public ngAfterContentInit(): void {
    this._currentView = this.startView;
  }

  public ngAfterViewChecked(): void {
    if (this.moveFocusOnNextTick) {
      this.moveFocusOnNextTick = false;
      this.focusActiveCell();
    }
  }

  /**
   * Toggle between month view and year view
   */
  public toggleViews(): void {
    let nextView = null;
    if (this._currentView === DateView.MONTH) {
      nextView = DateView.MULTI_YEARS;
    } else {
      if (this.multiyearOnly) {
        nextView = DateView.MULTI_YEARS;
      } else if (this.yearOnly) {
        nextView = this._currentView === DateView.YEAR ? DateView.MULTI_YEARS : DateView.YEAR;
      } else {
        nextView = DateView.MONTH;
      }
    }
    this.currentView = nextView;
  }

  /**
   * Handles user clicks on the previous button.
   */
  public previousClicked(): void {
    this.pickerMoment =
      this.isMonthView ?
        this.dateTimeAdapter.addCalendarMonths(this.pickerMoment, -1)
      : this.dateTimeAdapter.addCalendarYears(this.pickerMoment, -1);

    this.pickerMomentChange.emit(this.pickerMoment);
  }

  /**
   * Handles user clicks on the next button.
   */
  public nextClicked(): void {
    this.pickerMoment =
      this.isMonthView ?
        this.dateTimeAdapter.addCalendarMonths(this.pickerMoment, 1)
      : this.dateTimeAdapter.addCalendarYears(this.pickerMoment, 1);

    this.pickerMomentChange.emit(this.pickerMoment);
  }

  public jumpToToday(): void {
    const now = this.dateTimeAdapter.now();
    let today = this.dateTimeAdapter.setHours(now, 0);
    today = this.dateTimeAdapter.setMinutes(today, 0);
    today = this.dateTimeAdapter.setSeconds(today, 0);

    this.handlePickerMomentChange(today);
    this.dateSelected(today);
  }

  public dateSelected(date: T): void {
    if (!this.dateFilterForViews(date)) {
      return;
    }

    this.dateClicked.emit(date);
    this.selectedChange.emit(date);

    /*if ((this.isInSingleMode && !this.dateTimeAdapter.isSameDay(date, this.selected)) ||
            this.isInRangeMode) {
            this.selectedChange.emit(date);
        }*/
  }

  /**
   * Change the pickerMoment value and switch to a specific view
   */
  public goToDateInView(date: T, view: DateViewType): void {
    this.handlePickerMomentChange(date);
    if (
      (!this.yearOnly && !this.multiyearOnly) ||
      (this.multiyearOnly && view !== DateView.MONTH && view !== DateView.YEAR) ||
      (this.yearOnly && view !== DateView.MONTH)
    ) {
      this.currentView = view;
    }
    return;
  }

  /**
   * Change the pickerMoment value
   */
  public handlePickerMomentChange(date: T): void {
    this.pickerMoment = this.dateTimeAdapter.clampDate(date, this.minDate, this.maxDate);
    this.pickerMomentChange.emit(this.pickerMoment);
    return;
  }

  public userSelected(): void {
    this.userSelection.emit();
  }

  /**
   * Whether the previous period button is enabled.
   */
  public prevButtonEnabled(): boolean {
    return !this.minDate || !this.isSameView(this.pickerMoment, this.minDate);
  }

  /**
   * Whether the next period button is enabled.
   */
  public nextButtonEnabled(): boolean {
    return !this.maxDate || !this.isSameView(this.pickerMoment, this.maxDate);
  }

  /**
   * Focus to the host element
   */
  public focusActiveCell(): void {
    this.ngZone.runOutsideAngular(() => {
      this.ngZone.onStable
        .asObservable()
        .pipe(take(1))
        .subscribe(() => {
          this.elmRef.nativeElement.querySelector('.owl-dt-calendar-cell-active').focus();
        });
    });
  }

  public selectYearInMultiYearView(normalizedYear: T): void {
    this.yearSelected.emit(normalizedYear);
  }

  public selectMonthInYearView(normalizedMonth: T): void {
    this.monthSelected.emit(normalizedMonth);
  }

  /**
   * Whether the two dates represent the same view in the current view mode (month or year).
   */
  private isSameView(date1: T, date2: T): boolean {
    if (this._currentView === DateView.MONTH) {
      return !!(
        date1 &&
        date2 &&
        this.dateTimeAdapter.getYear(date1) === this.dateTimeAdapter.getYear(date2) &&
        this.dateTimeAdapter.getMonth(date1) === this.dateTimeAdapter.getMonth(date2)
      );
    } else if (this._currentView === DateView.YEAR) {
      return !!(date1 && date2 && this.dateTimeAdapter.getYear(date1) === this.dateTimeAdapter.getYear(date2));
    } else {
      return false;
    }
  }

  /**
   * Get a valid date object
   */
  private getValidDate(obj: unknown): T | null {
    return this.dateTimeAdapter.isDateInstance(obj) && this.dateTimeAdapter.isValid(obj) ? obj : null;
  }
}
