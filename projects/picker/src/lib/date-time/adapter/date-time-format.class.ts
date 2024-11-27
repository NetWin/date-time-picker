import { InjectionToken } from '@angular/core';

export interface OwlDateTimeFormats {
  fullPickerInput: Intl.DateTimeFormatOptions;
  datePickerInput: Intl.DateTimeFormatOptions;
  timePickerInput: Intl.DateTimeFormatOptions;
  monthYearLabel: Intl.DateTimeFormatOptions;
  dateA11yLabel: Intl.DateTimeFormatOptions;
  monthYearA11yLabel: Intl.DateTimeFormatOptions;
}

/**
 *  InjectionToken for date time picker that can be used to override default format.
 */
export const OWL_DATE_TIME_FORMATS = new InjectionToken<OwlDateTimeFormats>('OWL_DATE_TIME_FORMATS');
