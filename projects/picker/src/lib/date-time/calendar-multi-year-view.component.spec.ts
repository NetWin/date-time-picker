/**
 * calendar-multi-year-view.component.spec
 */

import {
  DOWN_ARROW,
  END,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  UP_ARROW
} from '@angular/cdk/keycodes';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MONTHS, dispatchKeyboardEvent, dispatchMouseEvent } from '../../test-helpers';
import { OwlNativeDateTimeModule } from './adapter/native-date-time.module';
import { OwlMultiYearViewComponent } from './calendar-multi-year-view.component';
import { OwlDateTimeIntl } from './date-time-picker-intl.service';
import { OwlDateTimeModule } from './date-time.module';
import { Options, OptionsTokens } from './options-provider';

const YEAR_ROWS = 7;
const YEARS_PER_ROW = 3;

describe('OwlMultiYearViewComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OwlNativeDateTimeModule, OwlDateTimeModule],
      declarations: [
        StandardMultiYearViewComponent,
        MultiYearViewWithDateFilterComponent
      ],
      providers: [
        OwlDateTimeIntl,
        {
          provide: OptionsTokens.multiYear,
          useFactory: () => {
            return {
              yearRows: YEAR_ROWS,
              yearsPerRow: YEARS_PER_ROW,
            } satisfies Options['multiYear']
          }
        }
      ]
    }).compileComponents();
  });

  describe('standard multi-years view', () => {
    let fixture: ComponentFixture<StandardMultiYearViewComponent>;
    let testComponent: StandardMultiYearViewComponent;
    let multiYearViewDebugElement: DebugElement;
    let multiYearViewElement: HTMLElement;
    let multiYearViewInstance: OwlMultiYearViewComponent<Date>;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardMultiYearViewComponent);
      fixture.detectChanges();

      multiYearViewDebugElement = fixture.debugElement.query(By.directive(OwlMultiYearViewComponent));
      multiYearViewElement = multiYearViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
      multiYearViewInstance = multiYearViewDebugElement.componentInstance;
    });

    it('should have correct number of years', () => {
      const cellEls = multiYearViewElement.querySelectorAll('.owl-dt-calendar-cell');
      expect(cellEls.length).toBe(YEARS_PER_ROW * YEAR_ROWS);
    });

    it('should shows selected year if in same range', () => {
      const selector = '.owl-dt-calendar-cell-selected.owl-dt-calendar-cell-content';
      const selectedElContent = multiYearViewElement.querySelector(selector)!;
      expect(selectedElContent.innerHTML.trim()).toBe('2020');
    });

    it('should NOT show selected year if in different range', () => {
      testComponent.selected = new Date(2040, MONTHS.JAN, 10);
      fixture.detectChanges();

      const selector = '.owl-calendar-body-selected.owl-dt-calendar-cell-content';
      const selectedElContent = multiYearViewElement.querySelector(selector);
      expect(selectedElContent).toBeNull();
    });

    it('should fire change event on cell clicked', () => {
      const cellDecember = multiYearViewElement.querySelector('[aria-label="2030"]')!;
      dispatchMouseEvent(cellDecember, 'click');
      fixture.detectChanges();

      const selector = '.owl-dt-calendar-cell-active .owl-dt-calendar-cell-content';
      const selectedElContent = multiYearViewElement.querySelector(selector)!;
      expect(selectedElContent.innerHTML.trim()).toBe('2030');
    });

    it('should mark active date', () => {
      const cell2017 = multiYearViewElement.querySelector<HTMLElement>('[aria-label="2018"]')!;
      expect((cell2017).innerText.trim()).toBe('2018');
      expect(cell2017.classList).toContain('owl-dt-calendar-cell-active');
    });

    it('should decrement year on left arrow press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2017, MONTHS.JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2016, MONTHS.JAN, 5));
    });

    it('should increment year on right arrow press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2019, MONTHS.JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2020, MONTHS.JAN, 5));
    });

    it('should go up a row on up arrow press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 - YEARS_PER_ROW, MONTHS.JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 - YEARS_PER_ROW * 2, MONTHS.JAN, 5));
    });

    it('should go down a row on down arrow press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 + YEARS_PER_ROW, MONTHS.JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 + YEARS_PER_ROW * 2, MONTHS.JAN, 5));
    });

    it('should go to first year in current range on home press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2016, MONTHS.JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2016, MONTHS.JAN, 5));
    });

    it('should go to last year in current range on end press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2036, MONTHS.JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2036, MONTHS.JAN, 5));
    });

    it('should go to same index in previous year range page up press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 - YEARS_PER_ROW * YEAR_ROWS, MONTHS.JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 - YEARS_PER_ROW * YEAR_ROWS * 2, MONTHS.JAN, 5));
    });

    it('should go to same index in next year range on page down press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 + YEARS_PER_ROW * YEAR_ROWS, MONTHS.JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 + YEARS_PER_ROW * YEAR_ROWS * 2, MONTHS.JAN, 5));
    });
  });

  describe('multi-years view with date filter', () => {
    let fixture: ComponentFixture<MultiYearViewWithDateFilterComponent>;
    let multiYearViewElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(MultiYearViewWithDateFilterComponent);
      fixture.detectChanges();

      const multiYearViewDebugElement = fixture.debugElement.query(By.directive(OwlMultiYearViewComponent));
      multiYearViewElement = multiYearViewDebugElement.nativeElement;
    });

    it('should disable filtered years', () => {
      const cell2018 = multiYearViewElement.querySelector('[aria-label="2018"]')!;
      const cell2019 = multiYearViewElement.querySelector('[aria-label="2019"]')!;
      expect(cell2019.classList).not.toContain('owl-dt-calendar-cell-disabled');
      expect(cell2018.classList).toContain('owl-dt-calendar-cell-disabled');
    });
  });
});

@Component({
  template: `
    <owl-date-time-multi-year-view
      [selected]="selected"
      [(pickerMoment)]="pickerMoment"
      (change)="handleChange($event)">
    </owl-date-time-multi-year-view>
  `
})
class StandardMultiYearViewComponent {
  public selected = new Date(2020, MONTHS.JAN, 10);
  public pickerMoment = new Date(2018, MONTHS.JAN, 5);
  public handleChange(date: Date): void {
    this.pickerMoment = new Date(date);
  }
}

@Component({
  template: `
    <owl-date-time-multi-year-view
      [(pickerMoment)]="pickerMoment"
      [dateFilter]="dateFilter">
    </owl-date-time-multi-year-view>
  `
})
class MultiYearViewWithDateFilterComponent {
  public pickerMoment = new Date(2018, MONTHS.JAN, 1);
  public dateFilter(date: Date) {
    return date.getFullYear() !== 2018;
  }
}
