import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OwlCalendarBodyComponent } from './calendar-body.component';
import { OwlMonthViewComponent } from './calendar-month-view.component';
import { OwlMultiYearViewComponent } from './calendar-multi-year-view.component';
import { OwlYearViewComponent } from './calendar-year-view.component';
import { OwlCalendarComponent } from './calendar.component';
import { OwlDateTimeInlineComponent } from './date-time-inline.component';
import { OwlDateTimeIntl } from './date-time-picker-intl.service';
import { optionsProviders } from './options-provider';
import { OwlTimerBoxComponent } from './timer-box.component';
import { OwlTimerComponent } from './timer.component';

@NgModule({
  imports: [CommonModule, A11yModule],
  exports: [
    OwlDateTimeInlineComponent,
    // TODO: remove all following exports in one of the next major versions
    OwlCalendarComponent,
    OwlTimerComponent,
    OwlMultiYearViewComponent,
    OwlYearViewComponent,
    OwlMonthViewComponent
  ],
  declarations: [
    OwlMultiYearViewComponent,
    OwlYearViewComponent,
    OwlMonthViewComponent,
    OwlTimerComponent,
    OwlTimerBoxComponent,
    OwlCalendarComponent,
    OwlCalendarBodyComponent,
    OwlDateTimeInlineComponent
  ],
  providers: [OwlDateTimeIntl, ...optionsProviders]
})
export class OwlDateTimeModule {}
