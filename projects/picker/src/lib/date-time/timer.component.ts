import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  NgZone,
  output
} from '@angular/core';
import { take } from 'rxjs/operators';
import type { Nullable } from '../types';
import { DateTimeAdapter } from './adapter/date-time-adapter.class';
import { OwlDateTimeIntl } from './date-time-picker-intl.service';

@Component({
  standalone: false,
  exportAs: 'owlDateTimeTimer',
  selector: 'owl-date-time-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'owl-dt-timer',
    '[attr.tabindex]': '-1'
  }
})
export class OwlTimerComponent<T> {
  readonly #ngZone = inject(NgZone);
  readonly #elmRef = inject(ElementRef);
  readonly #pickerIntl = inject(OwlDateTimeIntl);
  readonly #cdRef = inject(ChangeDetectorRef);
  readonly #dateTimeAdapter = inject<DateTimeAdapter<T>>(DateTimeAdapter, { optional: true });

  /**
   *  The current picker moment
   */
  private _pickerMoment: T;
  @Input()
  public get pickerMoment(): T {
    return this._pickerMoment;
  }
  public set pickerMoment(value: T) {
    value = this.#dateTimeAdapter.deserialize(value);
    this._pickerMoment = this.getValidDate(value) || this.#dateTimeAdapter.now();
  }

  /**
   *  The minimum selectable date time.
   */
  private _minDateTime: Nullable<T>;
  @Input()
  public get minDateTime(): Nullable<T> {
    return this._minDateTime;
  }
  public set minDateTime(value: Nullable<T>) {
    value = this.#dateTimeAdapter.deserialize(value);
    this._minDateTime = this.getValidDate(value);
  }

  /**
   *  The maximum selectable date time.
   */
  private _maxDateTime: Nullable<T>;
  @Input()
  public get maxDateTime(): Nullable<T> {
    return this._maxDateTime;
  }
  public set maxDateTime(value: Nullable<T>) {
    value = this.#dateTimeAdapter.deserialize(value);
    this._maxDateTime = this.getValidDate(value);
  }

  private isPM = false; // a flag indicates the current timer moment is in PM or AM

  /**
   * Whether to show the second's timer
   */
  @Input()
  public showSecondsTimer: boolean;

  /**
   * Whether the timer is in hour12 format
   */
  @Input()
  public hour12Timer: boolean;

  /**
   * Hours to change per step
   */
  @Input()
  public stepHour = 1;

  /**
   * Minutes to change per step
   */
  @Input()
  public stepMinute = 1;

  /**
   * Seconds to change per step
   */
  @Input()
  public stepSecond = 1;

  public readonly selectedChange = output<T>();

  protected get hourValue(): number {
    return this.#dateTimeAdapter.getHours(this.pickerMoment);
  }

  /**
   * The value would be displayed in hourBox.
   * We need this because the value displayed in hourBox it not
   * the same as the hourValue when the timer is in hour12Timer mode.
   */
  protected get hourBoxValue(): number {
    let hours = this.hourValue;

    if (!this.hour12Timer) {
      return hours;
    } else {
      if (hours === 0) {
        hours = 12;
        this.isPM = false;
      } else if (hours > 0 && hours < 12) {
        this.isPM = false;
      } else if (hours === 12) {
        this.isPM = true;
      } else if (hours > 12 && hours < 24) {
        hours = hours - 12;
        this.isPM = true;
      }

      return hours;
    }
  }

  protected get minuteValue(): number {
    return this.#dateTimeAdapter.getMinutes(this.pickerMoment);
  }

  protected get secondValue(): number {
    return this.#dateTimeAdapter.getSeconds(this.pickerMoment);
  }

  protected get upHourButtonLabel(): string {
    return this.#pickerIntl.upHourLabel;
  }

  protected get downHourButtonLabel(): string {
    return this.#pickerIntl.downHourLabel;
  }

  protected get upMinuteButtonLabel(): string {
    return this.#pickerIntl.upMinuteLabel;
  }

  protected get downMinuteButtonLabel(): string {
    return this.#pickerIntl.downMinuteLabel;
  }

  protected get upSecondButtonLabel(): string {
    return this.#pickerIntl.upSecondLabel;
  }

  protected get downSecondButtonLabel(): string {
    return this.#pickerIntl.downSecondLabel;
  }

  protected get hour12ButtonLabel(): string {
    return this.isPM ? this.#pickerIntl.hour12PMLabel : this.#pickerIntl.hour12AMLabel;
  }

  /**
   * Focus to the host element
   */
  public focus(): void {
    this.#ngZone.runOutsideAngular(() => {
      this.#ngZone.onStable
        .asObservable()
        .pipe(take(1))
        .subscribe(() => {
          this.#elmRef.nativeElement.focus();
        });
    });
  }

  /**
   * Set the hour value via typing into timer box input
   * We need this to handle the hour value when the timer is in hour12 mode
   */
  public setHourValueViaInput(hours: number): void {
    if (this.hour12Timer && this.isPM && hours >= 1 && hours <= 11) {
      hours = hours + 12;
    } else if (this.hour12Timer && !this.isPM && hours === 12) {
      hours = 0;
    }

    this.setHourValue(hours);
  }

  public setHourValue(hours: number): void {
    const m = this.#dateTimeAdapter.setHours(this.pickerMoment, hours);
    this.selectedChange.emit(m);
    this.#cdRef.markForCheck();
  }

  public setMinuteValue(minutes: number): void {
    const m = this.#dateTimeAdapter.setMinutes(this.pickerMoment, minutes);
    this.selectedChange.emit(m);
    this.#cdRef.markForCheck();
  }

  public setSecondValue(seconds: number): void {
    const m = this.#dateTimeAdapter.setSeconds(this.pickerMoment, seconds);
    this.selectedChange.emit(m);
    this.#cdRef.markForCheck();
  }

  public setMeridiem(event: Event): void {
    this.isPM = !this.isPM;

    let hours = this.hourValue;
    if (this.isPM) {
      hours = hours + 12;
    } else {
      hours = hours - 12;
    }

    if (hours >= 0 && hours <= 23) {
      this.setHourValue(hours);
    }

    this.#cdRef.markForCheck();
    event.preventDefault();
  }

  /**
   * Check if the up hour button is enabled
   */
  public upHourEnabled(): boolean {
    return !this.maxDateTime || this.compareHours(this.stepHour, this.maxDateTime) < 1;
  }

  /**
   * Check if the down hour button is enabled
   */
  public downHourEnabled(): boolean {
    return !this.minDateTime || this.compareHours(-this.stepHour, this.minDateTime) > -1;
  }

  /**
   * Check if the up minute button is enabled
   */
  public upMinuteEnabled(): boolean {
    return !this.maxDateTime || this.compareMinutes(this.stepMinute, this.maxDateTime) < 1;
  }

  /**
   * Check if the down minute button is enabled
   */
  public downMinuteEnabled(): boolean {
    return !this.minDateTime || this.compareMinutes(-this.stepMinute, this.minDateTime) > -1;
  }

  /**
   * Check if the up second button is enabled
   */
  public upSecondEnabled(): boolean {
    return !this.maxDateTime || this.compareSeconds(this.stepSecond, this.maxDateTime) < 1;
  }

  /**
   * Check if the down second button is enabled
   */
  public downSecondEnabled(): boolean {
    return !this.minDateTime || this.compareSeconds(-this.stepSecond, this.minDateTime) > -1;
  }

  /**
   * PickerMoment's hour value +/- certain amount and compare it to the give date
   * 1 is after the comparedDate
   * -1 is before the comparedDate
   * 0 is equal the comparedDate
   */
  private compareHours(amount: number, comparedDate: T): number {
    const hours = this.#dateTimeAdapter.getHours(this.pickerMoment) + amount;
    const result = this.#dateTimeAdapter.setHours(this.pickerMoment, hours);
    return this.#dateTimeAdapter.compare(result, comparedDate);
  }

  /**
   * PickerMoment's minute value +/- certain amount and compare it to the give date
   * 1 is after the comparedDate
   * -1 is before the comparedDate
   * 0 is equal the comparedDate
   */
  private compareMinutes(amount: number, comparedDate: T): number {
    const minutes = this.#dateTimeAdapter.getMinutes(this.pickerMoment) + amount;
    const result = this.#dateTimeAdapter.setMinutes(this.pickerMoment, minutes);
    return this.#dateTimeAdapter.compare(result, comparedDate);
  }

  /**
   * PickerMoment's second value +/- certain amount and compare it to the give date
   * 1 is after the comparedDate
   * -1 is before the comparedDate
   * 0 is equal the comparedDate
   */
  private compareSeconds(amount: number, comparedDate: T): number {
    const seconds = this.#dateTimeAdapter.getSeconds(this.pickerMoment) + amount;
    const result = this.#dateTimeAdapter.setSeconds(this.pickerMoment, seconds);
    return this.#dateTimeAdapter.compare(result, comparedDate);
  }

  /**
   * Get a valid date object
   */
  private getValidDate(obj: unknown): Nullable<T> {
    return this.#dateTimeAdapter.isDateInstance(obj) && this.#dateTimeAdapter.isValid(obj) ? obj : null;
  }
}
