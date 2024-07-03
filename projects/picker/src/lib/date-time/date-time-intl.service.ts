import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OwlDateTimeIntl {

  /**
   * Stream that emits whenever the labels here are changed. Use this to notify
   * components if the labels have changed after initialization.
   */
  public readonly changes: Subject<void> = new Subject<void>();

  /** A label for the up second button (used by screen readers).  */
  public upSecondLabel = 'Add a second';

  /** A label for the down second button (used by screen readers).  */
  public downSecondLabel = 'Minus a second';

  /** A label for the up minute button (used by screen readers).  */
  public upMinuteLabel = 'Add a minute';

  /** A label for the down minute button (used by screen readers).  */
  public downMinuteLabel = 'Minus a minute';

  /** A label for the up hour button (used by screen readers).  */
  public upHourLabel = 'Add a hour';

  /** A label for the down hour button (used by screen readers).  */
  public downHourLabel = 'Minus a hour';

  /** A label for the previous month button (used by screen readers). */
  public prevMonthLabel = 'Previous month';

  /** A label for the next month button (used by screen readers). */
  public nextMonthLabel = 'Next month';

  /** A label for the previous year button (used by screen readers). */
  public prevYearLabel = 'Previous year';

  /** A label for the next year button (used by screen readers). */
  public nextYearLabel = 'Next year';

  /** A label for the previous multi-year button (used by screen readers). */
  public prevMultiYearLabel = 'Previous 21 years';

  /** A label for the next multi-year button (used by screen readers). */
  public nextMultiYearLabel = 'Next 21 years';

  /** A label for the 'switch to month view' button (used by screen readers). */
  public switchToMonthViewLabel = 'Change to month view';

  /** A label for the 'switch to year view' button (used by screen readers). */
  public switchToMultiYearViewLabel = 'Choose month and year';

  /** A label for the cancel button */
  public cancelBtnLabel = 'Cancel';

  /** A label for the set button */
  public setBtnLabel = 'Set';

  /** A label for the range 'from' in picker info */
  public rangeFromLabel = 'From';

  /** A label for the range 'to' in picker info */
  public rangeToLabel = 'To';

  /** A label for the hour12 button (AM) */
  public hour12AMLabel = 'AM';

  /** A label for the hour12 button (PM) */
  public hour12PMLabel = 'PM';
}
