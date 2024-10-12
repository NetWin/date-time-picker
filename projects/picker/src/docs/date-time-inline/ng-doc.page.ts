import type { NgDocPage } from '@ng-doc/core';
import { OwlNativeDateTimeModule } from '../../lib/date-time/adapter/native-date-time.module';
import { OwlDateTimeInlineComponent } from '../../lib/date-time/date-time-inline.component';
import { OwlDateTimeModule } from '../../lib/date-time/date-time.module';
import DocsCategory from '../ng-doc.category';

const DateTimeInlinePage: NgDocPage = {
  mdFile: './index.md',
  title: 'DateTimePicker',
  route: 'date-time-picker',
  imports: [OwlDateTimeModule, OwlNativeDateTimeModule],
  category: DocsCategory,
  playgrounds: {
    DateTimeInline: {
      target: OwlDateTimeInlineComponent,
      defaults: { pickerType: 'both', selectMode: 'single' },
      inputs: { pickerType: 'both', selectMode: 'single' },
      template: '<div style="padding: 10px"><ng-doc-selector /></div>'
    }
  }
};
export default DateTimeInlinePage;
