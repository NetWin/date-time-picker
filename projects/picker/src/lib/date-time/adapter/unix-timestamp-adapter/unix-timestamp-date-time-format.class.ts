import { OwlDateTimeFormats } from '../date-time-format.class';

/**
 * @deprecated Use the `OWL_NATIVE_DATE_TIME_FORMATS` instead.
 */
export const OWL_UNIX_TIMESTAMP_DATE_TIME_FORMATS: OwlDateTimeFormats = {
  fullPickerInput: {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  },
  datePickerInput: { year: 'numeric', month: 'numeric', day: 'numeric' },
  timePickerInput: { hour: 'numeric', minute: 'numeric' },
  monthYearLabel: { year: 'numeric', month: 'short' },
  dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
  monthYearA11yLabel: { year: 'numeric', month: 'long' }
};
