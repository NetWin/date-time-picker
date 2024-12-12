import type { NgDocPage } from '@ng-doc/core';
import { OwlNativeDateTimeModule } from '../../lib/date-time/adapter/native-date-time.module';
import { OwlDateTimeModule } from '../../lib/date-time/date-time.module';
import DocsCategory from '../ng-doc.category';
import { DateTimeInlineDemoComponent } from './date-time-inline-demo.component';

const DateTimeInlinePage: NgDocPage = {
  mdFile: './index.md',
  title: 'DateTimePicker',
  route: 'date-time-picker',
  imports: [OwlDateTimeModule, OwlNativeDateTimeModule],
  category: DocsCategory,
  playgrounds: {
    DateTimeInline: {
      target: DateTimeInlineDemoComponent,
      template: '<ng-doc-selector />'
    }
  }
};
export default DateTimeInlinePage;
