import { InjectionToken } from '@angular/core';

export interface OwlDateTimeFormats {
  parseInput: unknown;
  fullPickerInput: unknown;
  datePickerInput: unknown;
  timePickerInput: unknown;
  monthYearLabel: unknown;
  dateA11yLabel: unknown;
  monthYearA11yLabel: unknown;
}

/** InjectionToken for date time picker that can be used to override default format. */
export const OWL_DATE_TIME_FORMATS = new InjectionToken<OwlDateTimeFormats>('OWL_DATE_TIME_FORMATS');
