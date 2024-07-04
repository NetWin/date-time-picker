import {
  DOWN_ARROW,
  END,
  ENTER,
  HOME,
  LEFT_ARROW,
  PAGE_DOWN,
  PAGE_UP,
  RIGHT_ARROW,
  UP_ARROW
} from '@angular/cdk/keycodes';
import { registerLocaleData } from '@angular/common';
import localeDutch from '@angular/common/locales/nl';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MONTHS, dispatchKeyboardEvent } from '../../../test-helpers';
import { DateTimeAdapter, OwlNativeDateTimeModule } from '../adapter';
import { OwlDateTimeIntl } from '../date-time-intl.service';
import { OwlDateTimeModule } from '../date-time.module';
import { OwlMonthViewComponent } from './calendar-month-view.component';

describe('OwlMonthViewComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        OwlNativeDateTimeModule,
        OwlDateTimeModule,
        StandardMonthViewComponent,
        MonthViewWithDateFilterComponent
      ],
      providers: [OwlDateTimeIntl]
    }).compileComponents();
  });

  describe('standard month view', () => {
    let fixture: ComponentFixture<StandardMonthViewComponent>;
    let testComponent: StandardMonthViewComponent;
    let monthViewDebugElement: DebugElement;
    let monthViewElement: HTMLElement;
    let monthViewInstance: OwlMonthViewComponent<Date>;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardMonthViewComponent);
      fixture.detectChanges();

      const componentPredicate = By.directive(OwlMonthViewComponent);
      monthViewDebugElement = fixture.debugElement.query(componentPredicate);
      monthViewElement = monthViewDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
      monthViewInstance = monthViewDebugElement.componentInstance;
    });

    it('should have 42 calendar day cells', () => {
      const cellEls = monthViewElement.querySelectorAll('.owl-dt-calendar-cell');
      expect(cellEls.length).toBe(42);
    });

    it('should show selected date if in same month', () => {
      const selectedEl = monthViewElement.querySelector('.owl-dt-calendar-cell-selected')!;
      expect(selectedEl.innerHTML.trim()).toBe('10');
    });

    it('should NOT show selected date if in different month', () => {
      testComponent.selected = new Date(2018, MONTHS.MAR, 10);
      fixture.detectChanges();
      const selectedEl = monthViewElement.querySelector('.owl-dt-calendar-cell-selected');
      expect(selectedEl).toBeNull();
    });

    it('should mark active date', () => {
      const selector = '.owl-dt-calendar-cell-active .owl-dt-calendar-cell-content';
      const selectedElContent = monthViewElement.querySelector(selector)!;
      expect(selectedElContent.innerHTML.trim()).toBe('5');
    });

    it('should set Sunday as first day of week by default', () => {
      expect(monthViewInstance.firstDayOfWeek).toBe(0);
      const weekdayCells = monthViewElement.querySelectorAll('.owl-dt-weekday');
      expect(weekdayCells[0].getAttribute('aria-label')).toBe('Sunday');
    });

    it('should set Monday as first day of week if firstDayOfWeek set to 1', () => {
      monthViewInstance.firstDayOfWeek = 1;
      fixture.detectChanges();
      const weekdayCells = monthViewElement.querySelectorAll('.owl-dt-weekday');
      expect(weekdayCells[0].getAttribute('aria-label')).toBe('Monday');
    });

    it('should set Saturday as first day of week if firstDayOfWeek set to 6', () => {
      monthViewInstance.firstDayOfWeek = 6;
      fixture.detectChanges();
      const weekdayCells = monthViewElement.querySelectorAll('.owl-dt-weekday');
      expect(weekdayCells[0].getAttribute('aria-label')).toBe('Saturday');
    });

    it('should decrement date on left arrow press', () => {
      const calendarBodyEl = monthViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
      fixture.detectChanges();
      expect(testComponent.pickerMoment).toEqual(new Date(2018, MONTHS.JAN, 4));

      monthViewInstance.pickerMoment = new Date(2017, MONTHS.JAN, 1);
      fixture.detectChanges();

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
      fixture.detectChanges();

      expect(testComponent.pickerMoment).toEqual(new Date(2016, MONTHS.DEC, 31));
    });

    it('should increment date on right arrow press', () => {
      const calendarBodyEl = monthViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();

      expect(testComponent.pickerMoment).toEqual(new Date(2018, MONTHS.JAN, 6));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();

      expect(testComponent.pickerMoment).toEqual(new Date(2018, MONTHS.JAN, 7));
    });

    it('should go up a row on up arrow press', () => {
      const calendarBodyEl = monthViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
      fixture.detectChanges();

      expect(testComponent.pickerMoment).toEqual(new Date(2017, MONTHS.DEC, 29));

      monthViewInstance.pickerMoment = new Date(2017, MONTHS.JAN, 7);
      fixture.detectChanges();

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
      fixture.detectChanges();

      expect(testComponent.pickerMoment).toEqual(new Date(2016, MONTHS.DEC, 31));
    });

    it('should go down a row on down arrow press', () => {
      const calendarBodyEl = monthViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(testComponent.pickerMoment).toEqual(new Date(2018, MONTHS.JAN, 12));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(testComponent.pickerMoment).toEqual(new Date(2018, MONTHS.JAN, 19));
    });

    it('should go to beginning of the month on home press', () => {
      monthViewInstance.pickerMoment = new Date(2018, MONTHS.JAN, 7);
      fixture.detectChanges();

      const calendarBodyEl = monthViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
      fixture.detectChanges();

      expect(testComponent.pickerMoment).toEqual(new Date(2018, MONTHS.JAN, 1));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
      fixture.detectChanges();

      expect(testComponent.pickerMoment).toEqual(new Date(2018, MONTHS.JAN, 1));
    });

    it('should go to end of the month on end press', () => {
      monthViewInstance.pickerMoment = new Date(2018, MONTHS.JAN, 7);
      fixture.detectChanges();

      const calendarBodyEl = monthViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
      fixture.detectChanges();

      expect(testComponent.pickerMoment).toEqual(new Date(2018, MONTHS.JAN, 31));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
      fixture.detectChanges();

      expect(testComponent.pickerMoment).toEqual(new Date(2018, MONTHS.JAN, 31));
    });

    it('should go back one month on page up press', () => {
      const calendarBodyEl = monthViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
      fixture.detectChanges();

      expect(testComponent.pickerMoment).toEqual(new Date(2017, MONTHS.DEC, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
      fixture.detectChanges();

      expect(testComponent.pickerMoment).toEqual(new Date(2017, MONTHS.NOV, 5));
    });

    it('should go forward one month on page down press', () => {
      const calendarBodyEl = monthViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
      fixture.detectChanges();

      expect(testComponent.pickerMoment).toEqual(new Date(2018, MONTHS.FEB, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
      fixture.detectChanges();

      expect(testComponent.pickerMoment).toEqual(new Date(2018, MONTHS.MAR, 5));
    });

    it('should select active date on enter', () => {
      const calendarBodyEl = monthViewElement.querySelector('.owl-dt-calendar-body')!;
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
      fixture.detectChanges();

      expect(testComponent.selected).toEqual(new Date(2018, MONTHS.JAN, 10));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
      fixture.detectChanges();

      expect(testComponent.selected).toEqual(new Date(2018, MONTHS.JAN, 4));
    });
  });

  describe('month view with date filter', () => {
    let fixture: ComponentFixture<MonthViewWithDateFilterComponent>;
    let monthViewNativeElement: Element;

    beforeEach(() => {
      fixture = TestBed.createComponent(MonthViewWithDateFilterComponent);
      fixture.detectChanges();

      const monthViewDebugElement = fixture.debugElement.query(By.directive(OwlMonthViewComponent));
      monthViewNativeElement = monthViewDebugElement.nativeElement;
    });

    it('should disable filtered dates', () => {
      const cellOne = monthViewNativeElement.querySelector('[aria-label="January 1, 2018"]')!;
      const cellTwo = monthViewNativeElement.querySelector('[aria-label="January 2, 2018"]')!;
      expect(cellOne.classList).toContain('owl-dt-calendar-cell-disabled');
      expect(cellTwo.classList).not.toContain('owl-dt-calendar-cell-disabled');
    });
  });


  describe('standard month view (locale tests)', () => {
    let fixture: ComponentFixture<StandardMonthViewComponent>;
    let adapter: DateTimeAdapter<unknown>;
    let monthViewDebugElement: DebugElement;
    let monthViewElement: HTMLElement;

    beforeAll(() => {
      registerLocaleData(localeDutch);
    });

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardMonthViewComponent);

      adapter = TestBed.inject(DateTimeAdapter);
      monthViewDebugElement = fixture.debugElement.query(By.directive(OwlMonthViewComponent));
      monthViewElement = monthViewDebugElement.nativeElement;
    });

    it('should derive the first day of the week based on the active locale', () => {
      adapter.setLocale('nl-NL');

      fixture.detectChanges();
      const weekdayCells = monthViewElement.querySelectorAll('.owl-dt-weekday');
      expect(weekdayCells[0].getAttribute('aria-label')).toBe('maandag');
    });

    it('should fallback to Sunday as first day of the week when when locale data is missing', () => {
      adapter.setLocale('unknown');

      fixture.detectChanges();
      const weekdayCells = monthViewElement.querySelectorAll('.owl-dt-weekday');
      expect(weekdayCells[0].getAttribute('aria-label')).toBe('Sunday');
    });

    it('should update the default day of the week when locale changes', () => {
      adapter.setLocale('nl-NL');

      fixture.detectChanges();
      const weekdayCellsNl = monthViewElement.querySelectorAll('.owl-dt-weekday');
      expect(weekdayCellsNl[0].getAttribute('aria-label')).toBe('maandag');

      adapter.setLocale('en-US');

      fixture.detectChanges();
      const weekdayCellsUs = monthViewElement.querySelectorAll('.owl-dt-weekday');
      expect(weekdayCellsUs[0].getAttribute('aria-label')).toBe('Sunday');
    });
  });
});

@Component({
  standalone: true,
  template: `
    <owl-date-time-month-view
      [(pickerMoment)]="pickerMoment"
      [(selected)]="selected">
    </owl-date-time-month-view>
  `,
  imports: [OwlMonthViewComponent]
})
class StandardMonthViewComponent {
  public selected = new Date(2018, MONTHS.JAN, 10);
  public pickerMoment = new Date(2018, MONTHS.JAN, 5);
}

@Component({
  standalone: true,
  template: `
    <owl-date-time-month-view
      [dateFilter]="dateFilter"
      [(pickerMoment)]="pickerMoment">
    </owl-date-time-month-view>
  `,
  imports: [OwlMonthViewComponent]
})
class MonthViewWithDateFilterComponent {
  public pickerMoment = new Date(2018, MONTHS.JAN, 1);
  public dateFilter(date: Date): boolean {
    return date.getDate() % 2 === 0;
  }
}
