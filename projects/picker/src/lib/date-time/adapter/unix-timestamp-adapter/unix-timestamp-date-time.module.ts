import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { DateTimeAdapter } from '../date-time-adapter.class';
import { OWL_DATE_TIME_FORMATS } from '../date-time-format.class';
import { UnixTimestampDateTimeAdapter } from './unix-timestamp-date-time-adapter.class';
import { OWL_UNIX_TIMESTAMP_DATE_TIME_FORMATS } from './unix-timestamp-date-time-format.class';

/**
 * @deprecated use `NativeDateTimeModule` instead.
 */
@NgModule({
  imports: [PlatformModule],
  providers: [{ provide: DateTimeAdapter, useClass: UnixTimestampDateTimeAdapter }]
})
export class UnixTimestampDateTimeModule {}

/**
 * @deprecated use `NativeDateTimeModule` instead.
 */
@NgModule({
  imports: [UnixTimestampDateTimeModule],
  providers: [
    {
      provide: OWL_DATE_TIME_FORMATS,
      useValue: OWL_UNIX_TIMESTAMP_DATE_TIME_FORMATS
    }
  ]
})
export class OwlUnixTimestampDateTimeModule {}
