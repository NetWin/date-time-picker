import { DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW, SPACE, UP_ARROW } from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { DateTimeAdapter } from './adapter/date-time-adapter.class';
import { OwlCalendarComponent } from './calendar.component';
import { OwlDateTimeIntl } from './date-time-picker-intl.service';
import { OwlDateTime, PickerType } from './date-time.class';
import { OwlTimerComponent } from './timer.component';

@Component({
  standalone: false,
  exportAs: 'owlDateTimeContainer',
  selector: 'owl-date-time-container',
  templateUrl: './date-time-picker-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  preserveWhitespaces: false,
  host: {
    '[attr.id]': 'picker.id',
    '[class.owl-dt-container-disabled]': 'picker.disabled',
    'class': 'owl-dt-container owl-dt-inline-container'
  }
})
export class OwlDateTimeContainerComponent<T> implements OnInit, AfterContentInit {
  private readonly cdRef = inject(ChangeDetectorRef);
  private readonly elmRef = inject(ElementRef);
  private readonly pickerIntl = inject(OwlDateTimeIntl);
  private readonly dateTimeAdapter = inject(DateTimeAdapter, { optional: true });

  @ViewChild(OwlCalendarComponent)
  protected calendar: OwlCalendarComponent<T>;

  @ViewChild(OwlTimerComponent)
  protected timer: OwlTimerComponent<T>;

  public picker: OwlDateTime<T>;
  public activeSelectedIndex = 0; // The current active SelectedIndex in range select mode (0: 'from', 1: 'to')

  // retain start and end time
  private retainStartTime: T;
  private retainEndTime: T;

  @Input()
  public showTodayButton: boolean = false;

  /**
   * The current picker moment. This determines which time period is shown and which date is
   * highlighted when using keyboard navigation.
   */
  private _clamPickerMoment: T;

  get pickerMoment(): T {
    return this._clamPickerMoment;
  }

  set pickerMoment(value: T) {
    if (value) {
      this._clamPickerMoment = this.dateTimeAdapter.clampDate(value, this.picker.minDateTime, this.picker.maxDateTime);
    }
    this.cdRef.markForCheck();
  }

  get pickerType(): PickerType {
    return this.picker.pickerType;
  }

  /**
   * The range 'from' label
   */
  get fromLabel(): string {
    return this.pickerIntl.rangeFromLabel;
  }

  /**
   * The range 'to' label
   */
  get toLabel(): string {
    return this.pickerIntl.rangeToLabel;
  }

  /**
   * The range 'from' formatted value
   */
  get fromFormattedValue(): string {
    const value = this.picker.selecteds[0];
    return value ? this.dateTimeAdapter.format(value, this.picker.displayFormat) : '';
  }

  /**
   * The range 'to' formatted value
   */
  get toFormattedValue(): string {
    const value = this.picker.selecteds[1];
    return value ? this.dateTimeAdapter.format(value, this.picker.displayFormat) : '';
  }

  get containerElm(): HTMLElement {
    return this.elmRef.nativeElement;
  }

  public ngOnInit(): void {
    if (this.picker.selectMode === 'range') {
      if (this.picker.selecteds[0]) {
        this.retainStartTime = this.dateTimeAdapter.clone(this.picker.selecteds[0]);
      }
      if (this.picker.selecteds[1]) {
        this.retainEndTime = this.dateTimeAdapter.clone(this.picker.selecteds[1]);
      }
    }
  }

  public ngAfterContentInit(): void {
    this.initPicker();
  }

  public dateSelected(date: T): void {
    let result;

    if (this.picker.isInSingleMode) {
      result = this.dateSelectedInSingleMode(date);
      if (result) {
        this.pickerMoment = result;
        this.picker.select(result);
      }
      return;
    }

    if (this.picker.isInRangeMode) {
      result = this.dateSelectedInRangeMode(date);
      if (result) {
        this.pickerMoment = result[this.activeSelectedIndex];
        this.picker.select(result);
      }
    }
  }

  public timeSelected(time: T): void {
    this.pickerMoment = this.dateTimeAdapter.clone(time);

    if (!this.picker.dateTimeChecker(this.pickerMoment)) {
      return;
    }

    if (this.picker.isInSingleMode) {
      this.picker.select(this.pickerMoment);
      return;
    }

    if (this.picker.isInRangeMode) {
      const selecteds = [...this.picker.selecteds];

      // check if the 'from' is after 'to' or 'to'is before 'from'
      // In this case, we set both the 'from' and 'to' the same value
      if (
        (this.activeSelectedIndex === 0 &&
          selecteds[1] &&
          this.dateTimeAdapter.compare(this.pickerMoment, selecteds[1]) === 1) ||
        (this.activeSelectedIndex === 1 &&
          selecteds[0] &&
          this.dateTimeAdapter.compare(this.pickerMoment, selecteds[0]) === -1)
      ) {
        selecteds[0] = this.pickerMoment;
        selecteds[1] = this.pickerMoment;
      } else {
        selecteds[this.activeSelectedIndex] = this.pickerMoment;
      }

      if (selecteds[0]) {
        this.retainStartTime = this.dateTimeAdapter.clone(selecteds[0]);
      }
      if (selecteds[1]) {
        this.retainEndTime = this.dateTimeAdapter.clone(selecteds[1]);
      }
      this.picker.select(selecteds);
    }
  }

  /**
   * Handle click on inform radio group
   */
  public handleClickOnInfoGroup(event: Event, index: number): void {
    this.setActiveSelectedIndex(index);
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handle click on inform radio group
   */
  public handleKeydownOnInfoGroup(event: KeyboardEvent, next: HTMLElement, index: number): void {
    switch (event.keyCode) {
      case DOWN_ARROW:
      case RIGHT_ARROW:
      case UP_ARROW:
      case LEFT_ARROW:
        next.focus();
        this.setActiveSelectedIndex(index === 0 ? 1 : 0);
        event.preventDefault();
        event.stopPropagation();
        break;

      case SPACE:
        this.setActiveSelectedIndex(index);
        event.preventDefault();
        event.stopPropagation();
        break;

      default:
        return;
    }
  }

  /**
   * Set the value of activeSelectedIndex
   */
  private setActiveSelectedIndex(index: number): void {
    if (this.picker.selectMode === 'range' && this.activeSelectedIndex !== index) {
      this.activeSelectedIndex = index;

      const selected = this.picker.selecteds[this.activeSelectedIndex];
      if (this.picker.selecteds && selected) {
        this.pickerMoment = this.dateTimeAdapter.clone(selected);
      }
    }
    return;
  }

  private initPicker(): void {
    this.pickerMoment = this.picker.startAt || this.dateTimeAdapter.now();
    this.activeSelectedIndex = this.picker.selectMode === 'rangeTo' ? 1 : 0;
  }

  /**
   * Select calendar date in single mode,
   * it returns null when date is not selected.
   */
  private dateSelectedInSingleMode(date: T): T | null {
    if (this.dateTimeAdapter.isSameDay(date, this.picker.selected)) {
      return null;
    }

    return this.updateAndCheckCalendarDate(date);
  }

  /**
   * Select dates in range Mode
   */
  private dateSelectedInRangeMode(date: T): Array<T> | null {
    let from = this.picker.selecteds[0];
    let to = this.picker.selecteds[1];

    const result = this.updateAndCheckCalendarDate(date);

    if (!result) {
      return null;
    }

    // if the given calendar day is after or equal to 'from',
    // set ths given date as 'to'
    // otherwise, set it as 'from' and set 'to' to null
    if (this.picker.selectMode === 'range') {
      if (
        this.picker.selecteds?.length &&
        !to &&
        from &&
        this.dateTimeAdapter.differenceInCalendarDays(result, from) >= 0
      ) {
        if (this.picker.endAt && !this.retainEndTime) {
          to = this.dateTimeAdapter.createDate(
            this.dateTimeAdapter.getYear(result),
            this.dateTimeAdapter.getMonth(result),
            this.dateTimeAdapter.getDate(result),
            this.dateTimeAdapter.getHours(this.picker.endAt),
            this.dateTimeAdapter.getMinutes(this.picker.endAt),
            this.dateTimeAdapter.getSeconds(this.picker.endAt)
          );
        } else if (this.retainEndTime) {
          to = this.dateTimeAdapter.createDate(
            this.dateTimeAdapter.getYear(result),
            this.dateTimeAdapter.getMonth(result),
            this.dateTimeAdapter.getDate(result),
            this.dateTimeAdapter.getHours(this.retainEndTime),
            this.dateTimeAdapter.getMinutes(this.retainEndTime),
            this.dateTimeAdapter.getSeconds(this.retainEndTime)
          );
        } else {
          to = result;
        }
        this.activeSelectedIndex = 1;
      } else {
        if (this.picker.startAt && !this.retainStartTime) {
          from = this.dateTimeAdapter.createDate(
            this.dateTimeAdapter.getYear(result),
            this.dateTimeAdapter.getMonth(result),
            this.dateTimeAdapter.getDate(result),
            this.dateTimeAdapter.getHours(this.picker.startAt),
            this.dateTimeAdapter.getMinutes(this.picker.startAt),
            this.dateTimeAdapter.getSeconds(this.picker.startAt)
          );
        } else if (this.retainStartTime) {
          from = this.dateTimeAdapter.createDate(
            this.dateTimeAdapter.getYear(result),
            this.dateTimeAdapter.getMonth(result),
            this.dateTimeAdapter.getDate(result),
            this.dateTimeAdapter.getHours(this.retainStartTime),
            this.dateTimeAdapter.getMinutes(this.retainStartTime),
            this.dateTimeAdapter.getSeconds(this.retainStartTime)
          );
        } else {
          from = result;
        }
        to = null;
        this.activeSelectedIndex = 0;
      }
    } else if (this.picker.selectMode === 'rangeFrom') {
      from = result;

      // if the from value is after the to value, set the to value as null
      if (to && this.dateTimeAdapter.compare(from, to) > 0) {
        to = null;
      }
    } else if (this.picker.selectMode === 'rangeTo') {
      to = result;

      // if the from value is after the to value, set the from value as null
      if (from && this.dateTimeAdapter.compare(from, to) > 0) {
        from = null;
      }
    }

    return [from, to];
  }

  /**
   * Update the given calendar date's time and check if it is valid
   * Because the calendar date has 00:00:00 as default time, if the picker type is 'both',
   * we need to update the given calendar date's time before selecting it.
   * if it is valid, return the updated dateTime
   * if it is not valid, return null
   */
  private updateAndCheckCalendarDate(date: T): T {
    let result;

    // if the picker is 'both', update the calendar date's time value
    if (this.picker.pickerType === 'both') {
      result = this.dateTimeAdapter.createDate(
        this.dateTimeAdapter.getYear(date),
        this.dateTimeAdapter.getMonth(date),
        this.dateTimeAdapter.getDate(date),
        this.dateTimeAdapter.getHours(this.pickerMoment),
        this.dateTimeAdapter.getMinutes(this.pickerMoment),
        this.dateTimeAdapter.getSeconds(this.pickerMoment)
      );
      result = this.dateTimeAdapter.clampDate(result, this.picker.minDateTime, this.picker.maxDateTime);
    } else {
      result = this.dateTimeAdapter.clone(date);
    }

    // check the updated dateTime
    return this.picker.dateTimeChecker(result) ? result : null;
  }
}
