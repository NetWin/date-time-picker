import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OwlDialogModule } from '../dialog/dialog.module';
import { OwlCalendarComponent } from './calendar';
import { OwlCalendarBodyComponent } from './calendar-body';
import { OwlMonthViewComponent } from './calendar-month-view';
import { OwlMultiYearViewComponent } from './calendar-multi-year-view';
import { OwlYearViewComponent } from './calendar-year-view';
import { OwlDateTimeInlineComponent } from './date-time-inline';
import { OwlDateTimeTriggerDirective } from './date-time-inline-trigger/date-time-trigger.directive';
import { OwlDateTimeIntl } from './date-time-intl.service';
import { OWL_DTPICKER_SCROLL_STRATEGY_PROVIDER, OwlDateTimeComponent } from './date-time-picker';
import { OwlDateTimeContainerComponent } from './date-time-picker-container';
import { OwlDateTimeInputDirective } from './date-time-picker-input';
import { optionsProviders } from './options-provider';
import { OwlTimerComponent } from './timer';
import { OwlTimerBoxComponent } from './timer-box';

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    OwlDialogModule,
    A11yModule
  ],
  exports: [
    OwlCalendarComponent,
    OwlTimerComponent,
    OwlDateTimeTriggerDirective,
    OwlDateTimeInputDirective,
    OwlDateTimeComponent,
    OwlDateTimeInlineComponent,
    OwlMultiYearViewComponent,
    OwlYearViewComponent,
    OwlMonthViewComponent,
  ],
  declarations: [
    OwlDateTimeTriggerDirective,
    OwlDateTimeInputDirective,
    OwlDateTimeComponent,
    OwlDateTimeContainerComponent,
    OwlMultiYearViewComponent,
    OwlYearViewComponent,
    OwlMonthViewComponent,
    OwlTimerComponent,
    OwlTimerBoxComponent,
    OwlCalendarComponent,
    OwlCalendarBodyComponent,
    OwlDateTimeInlineComponent,
  ],
  providers: [
    OwlDateTimeIntl,
    OWL_DTPICKER_SCROLL_STRATEGY_PROVIDER,
    ...optionsProviders,
  ]
})
export class OwlDateTimeModule {
}
