/**
 * unix-timestamp-date-time-adapter.class
 */

import { Platform } from '@angular/cdk/platform';
import { inject, Injectable } from '@angular/core';
import { range } from '../../../utils/array.utils';
import {
  DEFAULT_DATE_NAMES,
  DEFAULT_DAY_OF_WEEK_NAMES,
  DEFAULT_MONTH_NAMES,
  SUPPORTS_INTL_API
} from '../../../utils/constants';
import { createDate, getNumDaysInMonth } from '../../../utils/date.utils';
import { DateTimeAdapter, OWL_DATE_TIME_LOCALE } from '../date-time-adapter.class';

@Injectable()
export class UnixTimestampDateTimeAdapter extends DateTimeAdapter<number> {
  private readonly owlDateTimeLocale = inject(OWL_DATE_TIME_LOCALE, { optional: true });
  private readonly platform = inject(Platform);

  constructor() {
    super();
    super.setLocale(this.owlDateTimeLocale);

    // IE does its own time zone correction, so we disable this on IE.
    this.useUtcForDisplay = !this.platform.TRIDENT;
    this._clampDate = this.platform.TRIDENT || this.platform.EDGE;
  }

  /** Whether to clamp the date between 1 and 9999 to avoid IE and Edge errors. */
  private readonly _clampDate: boolean;

  /**
   * Whether to use `timeZone: 'utc'` with `Intl.DateTimeFormat` when formatting dates.
   * Without this `Intl.DateTimeFormat` sometimes chooses the wrong timeZone, which can throw off
   * the result. (e.g. in the en-US locale `new Date(1800, 7, 14).toLocaleDateString()`
   * will produce `'8/13/1800'`.
   */
  public useUtcForDisplay: boolean;

  /**
   * Strip out unicode LTR and RTL characters. Edge and IE insert these into formatted dates while
   * other browsers do not. We remove them to make output consistent and because they interfere with
   * date parsing.
   */
  private static search_ltr_rtl_pattern = '/[\u200e\u200f]/g';
  private static stripDirectionalityCharacters(str: string): string {
    return str.replace(UnixTimestampDateTimeAdapter.search_ltr_rtl_pattern, '');
  }

  /**
   * When converting Date object to string, javascript built-in functions may return wrong
   * results because it applies its internal DST rules. The DST rules around the world change
   * very frequently, and the current valid rule is not always valid in previous years though.
   * We work around this problem building a new Date object which has its internal UTC
   * representation with the local date and time.
   */
  private static _format(dtf: Intl.DateTimeFormat, date: Date): string {
    const d = new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
      )
    );
    return dtf.format(d);
  }

  public addCalendarDays(date: number, amount: number): number {
    const result = new Date(date);
    amount = Number(amount);
    result.setDate(result.getDate() + amount);
    return result.getTime();
  }

  public addCalendarMonths(date: number, amount: number): number {
    const result = new Date(date);
    amount = Number(amount);

    const desiredMonth = result.getMonth() + amount;
    const dateWithDesiredMonth = new Date(0);
    dateWithDesiredMonth.setFullYear(result.getFullYear(), desiredMonth, 1);
    dateWithDesiredMonth.setHours(0, 0, 0, 0);

    const daysInMonth = this.getNumDaysInMonth(dateWithDesiredMonth.getTime());
    // Set the last day of the new month
    // if the original date was the last day of the longer month
    result.setMonth(desiredMonth, Math.min(daysInMonth, result.getDate()));
    return result.getTime();
  }

  public addCalendarYears(date: number, amount: number): number {
    return this.addCalendarMonths(date, amount * 12);
  }

  public clone(date: number): number {
    return date;
  }

  public createDate(
    year: number,
    month: number,
    date: number,
    hours: number = 0,
    minutes: number = 0,
    seconds: number = 0
  ): number {
    return createDate(year, month, date, hours, minutes, seconds).getTime();
  }

  public differenceInCalendarDays(dateLeft: number, dateRight: number): number {
    if (this.isValid(dateLeft) && this.isValid(dateRight)) {
      const dateLeftStartOfDay = this.createDate(
        this.getYear(dateLeft),
        this.getMonth(dateLeft),
        this.getDate(dateLeft)
      );
      const dateRightStartOfDay = this.createDate(
        this.getYear(dateRight),
        this.getMonth(dateRight),
        this.getDate(dateRight)
      );

      const timeStampLeft =
        this.getTime(dateLeftStartOfDay) - new Date(dateLeftStartOfDay).getTimezoneOffset() * this.milliseondsInMinute;
      const timeStampRight =
        this.getTime(dateRightStartOfDay) -
        new Date(dateRightStartOfDay).getTimezoneOffset() * this.milliseondsInMinute;
      return Math.round((timeStampLeft - timeStampRight) / this.millisecondsInDay);
    } else {
      return null;
    }
  }

  public format(date: number, displayFormat: Intl.DateTimeFormatOptions): string {
    if (!this.isValid(date)) {
      throw Error('JSNativeDate: Cannot format invalid date.');
    }

    const jsDate = new Date(date);

    if (SUPPORTS_INTL_API) {
      if (this._clampDate && (jsDate.getFullYear() < 1 || jsDate.getFullYear() > 9999)) {
        jsDate.setFullYear(Math.max(1, Math.min(9999, jsDate.getFullYear())));
      }

      displayFormat = { ...displayFormat, timeZone: 'utc' };
      const dtf = new Intl.DateTimeFormat(this.locale, displayFormat);
      return UnixTimestampDateTimeAdapter.stripDirectionalityCharacters(
        UnixTimestampDateTimeAdapter._format(dtf, jsDate)
      );
    }

    return UnixTimestampDateTimeAdapter.stripDirectionalityCharacters(jsDate.toDateString());
  }

  public getDate(date: number): number {
    return new Date(date).getDate();
  }

  public getDateNames(): Array<string> {
    if (SUPPORTS_INTL_API) {
      const dtf = new Intl.DateTimeFormat(this.locale, {
        day: 'numeric',
        timeZone: 'utc'
      });
      return range(31, (i) =>
        UnixTimestampDateTimeAdapter.stripDirectionalityCharacters(
          UnixTimestampDateTimeAdapter._format(dtf, new Date(2017, 0, i + 1))
        )
      );
    }
    return DEFAULT_DATE_NAMES;
  }

  public getDay(date: number): number {
    return new Date(date).getDay();
  }

  public getDayOfWeekNames(style: Intl.DateTimeFormatOptions['weekday']): Array<string> {
    if (SUPPORTS_INTL_API) {
      const dtf = new Intl.DateTimeFormat(this.locale, {
        weekday: style,
        timeZone: 'utc'
      });
      return range(7, (i) =>
        UnixTimestampDateTimeAdapter.stripDirectionalityCharacters(
          UnixTimestampDateTimeAdapter._format(dtf, new Date(2017, 0, i + 1))
        )
      );
    }

    return DEFAULT_DAY_OF_WEEK_NAMES[style];
  }

  public getHours(date: number): number {
    return new Date(date).getHours();
  }

  public getMinutes(date: number): number {
    return new Date(date).getMinutes();
  }

  public getMonth(date: number): number {
    return new Date(date).getMonth();
  }

  public getMonthNames(style: Intl.DateTimeFormatOptions['month']): Array<string> {
    if (SUPPORTS_INTL_API) {
      const dtf = new Intl.DateTimeFormat(this.locale, { month: style, timeZone: 'utc' });
      return range(12, (i) => {
        return UnixTimestampDateTimeAdapter.stripDirectionalityCharacters(
          UnixTimestampDateTimeAdapter._format(dtf, new Date(2017, i, 1))
        );
      });
    }
    return DEFAULT_MONTH_NAMES[style];
  }

  public getNumDaysInMonth(date: number): number {
    return getNumDaysInMonth(new Date(date));
  }

  public getSeconds(date: number): number {
    return new Date(date).getSeconds();
  }

  public getTime(date: number): number {
    return date;
  }

  public getYear(date: number): number {
    return new Date(date).getFullYear();
  }

  public getYearName(date: number): string {
    if (SUPPORTS_INTL_API) {
      const dtf = new Intl.DateTimeFormat(this.locale, {
        year: 'numeric',
        timeZone: 'utc'
      });
      return UnixTimestampDateTimeAdapter.stripDirectionalityCharacters(
        UnixTimestampDateTimeAdapter._format(dtf, new Date(date))
      );
    }
    return String(this.getYear(date));
  }

  public invalid(): number {
    return NaN;
  }

  public isDateInstance(obj: unknown): obj is number {
    return typeof obj === 'number';
  }

  public isEqual(dateLeft: number, dateRight: number): boolean {
    if (this.isValid(dateLeft) && this.isValid(dateRight)) {
      return dateLeft === dateRight;
    } else {
      return false;
    }
  }

  public isSameDay(dateLeft: number, dateRight: number): boolean {
    if (this.isValid(dateLeft) && this.isValid(dateRight)) {
      const dateLeftStartOfDay = new Date(dateLeft);
      const dateRightStartOfDay = new Date(dateRight);
      dateLeftStartOfDay.setHours(0, 0, 0, 0);
      dateRightStartOfDay.setHours(0, 0, 0, 0);
      return dateLeftStartOfDay.getTime() === dateRightStartOfDay.getTime();
    } else {
      return false;
    }
  }

  public isValid(date: number): boolean {
    return (date || date === 0) && !isNaN(date);
  }

  public now(): number {
    return new Date().getTime();
  }

  public parse(value: number | string | null): number {
    // There is no way using the native JS Date to set the parse format or locale
    if (typeof value === 'number') {
      return value;
    }
    return value ? new Date(Date.parse(value)).getTime() : null;
  }

  public setHours(date: number, amount: number): number {
    const result = new Date(date);
    result.setHours(amount);
    return result.getTime();
  }

  public setMinutes(date: number, amount: number): number {
    const result = new Date(date);
    result.setMinutes(amount);
    return result.getTime();
  }

  public setSeconds(date: number, amount: number): number {
    const result = new Date(date);
    result.setSeconds(amount);
    return result.getTime();
  }

  public toIso8601(date: number): string {
    return new Date(date).toISOString();
  }
}
