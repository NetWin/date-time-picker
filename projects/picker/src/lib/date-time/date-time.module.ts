/**
 * date-time.module
 */

import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { OwlCalendarBodyComponent } from './calendar-body.component';
import { OwlMonthViewComponent } from './calendar-month-view.component';
import { OwlMultiYearViewComponent } from './calendar-multi-year-view.component';
import { OwlYearViewComponent } from './calendar-year-view.component';
import { OwlCalendarComponent } from './calendar.component';
import { OwlDateTimeInlineComponent } from './date-time-inline.component';
import { OwlDateTimeContainerComponent } from './date-time-picker-container.component';
import { OwlDateTimeIntl } from './date-time-picker-intl.service';
import { optionsProviders } from './options-provider';
import { OwlTimerBoxComponent } from './timer-box.component';
import { OwlTimerComponent } from './timer.component';

@NgModule({
  imports: [A11yModule],
  exports: [
    OwlCalendarComponent,
    OwlDateTimeInlineComponent,
    OwlMonthViewComponent,
    OwlMultiYearViewComponent,
    OwlTimerComponent,
    OwlYearViewComponent
  ],
  declarations: [
    OwlCalendarBodyComponent,
    OwlCalendarComponent,
    OwlDateTimeContainerComponent,
    OwlDateTimeInlineComponent,
    OwlMonthViewComponent,
    OwlMultiYearViewComponent,
    OwlTimerBoxComponent,
    OwlTimerComponent,
    OwlYearViewComponent
  ],
  providers: [OwlDateTimeIntl, ...optionsProviders]
})
export class OwlDateTimeModule {}
