import { NgModule } from '@angular/core';
import { OwlCalendarBodyComponent } from './calendar-body.component';
import { OwlMonthViewComponent } from './calendar-month-view.component';
import { OwlMultiYearViewComponent } from './calendar-multi-year-view.component';
import { OwlYearViewComponent } from './calendar-year-view.component';
import { OwlCalendarComponent } from './calendar.component';
import { OwlDateTimeInlineComponent } from './date-time-inline.component';
import { OwlDateTimeContainerComponent } from './date-time-picker-container.component';
import { OwlDateTimeIntl } from './date-time-picker-intl.service';
import { NumberFixedLenPipe } from './numberedFixLen.pipe';
import { optionsProviders } from './options-provider';
import { OwlTimerBoxComponent } from './timer-box.component';
import { OwlTimerComponent } from './timer.component';

@NgModule({
  exports: [
    OwlCalendarComponent,
    OwlTimerComponent,
    OwlDateTimeInlineComponent,
    OwlMultiYearViewComponent,
    OwlYearViewComponent,
    OwlMonthViewComponent
  ],
  declarations: [
    OwlDateTimeContainerComponent,
    OwlMultiYearViewComponent,
    OwlYearViewComponent,
    OwlMonthViewComponent,
    OwlTimerComponent,
    OwlTimerBoxComponent,
    OwlCalendarComponent,
    OwlCalendarBodyComponent,
    NumberFixedLenPipe,
    OwlDateTimeInlineComponent
  ],
  providers: [OwlDateTimeIntl, ...optionsProviders]
})
export class OwlDateTimeModule {}
