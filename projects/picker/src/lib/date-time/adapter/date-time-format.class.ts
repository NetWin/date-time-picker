/**
 * date-time-format.class
 */

import { InjectionToken } from '@angular/core';

export type OwlDateTimeFormats = {
  fullPickerInput: Partial<Intl.DateTimeFormatOptions>;
  datePickerInput: Partial<Intl.DateTimeFormatOptions>;
  timePickerInput: Partial<Intl.DateTimeFormatOptions>;
  monthYearLabel: Partial<Intl.DateTimeFormatOptions>;
  dateA11yLabel: Partial<Intl.DateTimeFormatOptions>;
  monthYearA11yLabel: Partial<Intl.DateTimeFormatOptions>;
};

/** InjectionToken for date time picker that can be used to override default format. */
export const OWL_DATE_TIME_FORMATS = new InjectionToken<OwlDateTimeFormats>('OWL_DATE_TIME_FORMATS');
