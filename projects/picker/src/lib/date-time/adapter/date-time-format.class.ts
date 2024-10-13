import { InjectionToken } from '@angular/core';

export type OwlDateTimeFormats = {
  fullPickerInput: Pick<Intl.DateTimeFormatOptions, 'year' | 'month' | 'day' | 'hour' | 'minute'>;
  datePickerInput: Pick<Intl.DateTimeFormatOptions, 'year' | 'month' | 'day'>;
  timePickerInput: Pick<Intl.DateTimeFormatOptions, 'hour' | 'minute'>;
  monthYearLabel: Pick<Intl.DateTimeFormatOptions, 'year' | 'month'>;
  dateA11yLabel: Pick<Intl.DateTimeFormatOptions, 'year' | 'month' | 'day'>;
  monthYearA11yLabel: Pick<Intl.DateTimeFormatOptions, 'year' | 'month'>;
};

/** InjectionToken for date time picker that can be used to override default format. */
export const OWL_DATE_TIME_FORMATS = new InjectionToken<OwlDateTimeFormats>('OWL_DATE_TIME_FORMATS');
