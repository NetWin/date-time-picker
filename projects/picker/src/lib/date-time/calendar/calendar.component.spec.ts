import { ENTER, RIGHT_ARROW } from '@angular/cdk/keycodes';
import { Component, NgZone } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  inject
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  MONTHS,
  MockNgZone,
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent
} from '../../../test-helpers';
import { OwlNativeDateTimeModule } from '../adapter';
import { OwlMonthViewComponent } from '../calendar-month-view';
import { OwlMultiYearViewComponent } from '../calendar-multi-year-view';
import { OwlYearViewComponent } from '../calendar-year-view';
import { DateView } from '../date-time';
import { OwlDateTimeIntl } from '../date-time-intl.service';
import { OwlDateTimeModule } from '../date-time.module';
import { OwlCalendarComponent } from './calendar.component';

describe('OwlCalendarComponent', () => {
  let zone: MockNgZone;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        OwlNativeDateTimeModule,
        OwlDateTimeModule,
        StandardCalendarComponent,
        CalendarWithMinMaxComponent,
        CalendarWithDateFilterComponent
      ],
      providers: [
        OwlDateTimeIntl,
        { provide: NgZone, useFactory: () => (zone = new MockNgZone()) }
      ]
    }).compileComponents();
  });

  describe('standard calendar', () => {
    let fixture: ComponentFixture<StandardCalendarComponent>;
    let testComponent: StandardCalendarComponent;
    let calendarElement: HTMLElement;
    let periodButton: HTMLElement;
    let calendarInstance: OwlCalendarComponent<Date>;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardCalendarComponent);
      fixture.detectChanges();

      const calendarDebugElement = fixture.debugElement.query(By.directive(OwlCalendarComponent));
      calendarElement = calendarDebugElement.nativeElement;

      periodButton = calendarElement.querySelector<HTMLElement>('.owl-dt-control-period-button')!;
      calendarInstance = calendarDebugElement.componentInstance;
      testComponent = fixture.componentInstance;
    });

    it('should be in month view with specified month active', () => {
      expect(calendarInstance.currentView).toBe(DateView.MONTH);
      expect(calendarInstance.pickerMoment).toEqual(new Date(2018, MONTHS.JAN, 31));
    });

    it('should select date in month view', () => {
      const monthCell = calendarElement.querySelector<HTMLElement>('[aria-label="January 31, 2018"]')!;
      monthCell.click();

      fixture.detectChanges();
      expect(calendarInstance.currentView).toBe(DateView.MONTH);
      expect(testComponent.selected).toEqual(new Date(2018, MONTHS.JAN, 31));
    });

    it('should emit the selected month on cell clicked in year view', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe(DateView.MULTI_YEARS);
      expect(calendarInstance.pickerMoment).toEqual(new Date(2018, MONTHS.JAN, 31));

      let activeCell = calendarElement.querySelector<HTMLElement>('.owl-dt-calendar-cell-active')!;
      activeCell.click();

      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe(DateView.YEAR);

      activeCell = calendarElement.querySelector<HTMLElement>('.owl-dt-calendar-cell-active')!;
      activeCell.click();

      const normalizedMonth = fixture.componentInstance.selectedMonth;
      expect(normalizedMonth.getMonth()).toEqual(0);
    });

    it('should emit the selected year on cell clicked in multi-years view', () => {
      periodButton.click();
      fixture.detectChanges();

      expect(calendarInstance.currentView).toBe(DateView.MULTI_YEARS);
      expect(calendarInstance.pickerMoment).toEqual(new Date(2018, MONTHS.JAN, 31));

      const activeCell = calendarElement.querySelector<HTMLElement>('.owl-dt-calendar-cell-active')!;
      activeCell.click();

      fixture.detectChanges();

      const normalizedYear: Date = fixture.componentInstance.selectedYear;
      expect(normalizedYear.getFullYear()).toEqual(2018);
    });

    it('should re-render when the i18n labels have changed', inject([OwlDateTimeIntl], (intl: OwlDateTimeIntl) => {
      const button = fixture.debugElement.nativeElement.querySelector('.owl-dt-control-period-button');

      intl.switchToMultiYearViewLabel = 'Go to multi-year view?';
      intl.changes.next();
      fixture.detectChanges();

      expect(button.getAttribute('aria-label')).toBe('Go to multi-year view?');
    }));

    it('should set all buttons to be `type="button"`', () => {
      const invalidButtons = calendarElement.querySelectorAll('button:not([type="button"])');
      expect(invalidButtons.length).toBe(0);
    });

    describe('a11y', () => {
      describe('calendar body', () => {
        let calendarMainEl: HTMLElement;

        beforeEach(() => {
          calendarMainEl = calendarElement.querySelector<HTMLElement>('.owl-dt-calendar-main')!;
          expect(calendarMainEl).not.toBeNull();

          dispatchFakeEvent(calendarMainEl, 'focus');
          fixture.detectChanges();
        });

        it('should initially set pickerMoment', () => {
          expect(calendarInstance.pickerMoment).toEqual(new Date(2018, MONTHS.JAN, 31));
        });

        it('should make the calendar main focusable', () => {
          expect(calendarMainEl.getAttribute('tabindex')).toBe('-1');
        });

        it('should not move focus to the active cell on init', () => {
          const activeCell = calendarMainEl.querySelector<HTMLElement>('.owl-dt-calendar-cell-active')!;

          spyOn(activeCell, 'focus').and.callThrough();
          fixture.detectChanges();
          zone.simulateZoneExit();

          expect(activeCell.focus).not.toHaveBeenCalled();
        });

        it('should move focus to the active cell when the view changes', () => {
          const activeCell = calendarMainEl.querySelector<HTMLElement>('.owl-dt-calendar-cell-active')!;

          spyOn(activeCell, 'focus').and.callThrough();
          fixture.detectChanges();
          zone.simulateZoneExit();

          expect(activeCell.focus).not.toHaveBeenCalled();

          calendarInstance.currentView = DateView.MULTI_YEARS;
          fixture.detectChanges();
          zone.simulateZoneExit();

          expect(activeCell.focus).toHaveBeenCalled();
        });

        describe('year view', () => {
          beforeEach(() => {
            dispatchMouseEvent(periodButton, 'click');
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe(DateView.MULTI_YEARS);

            const activeCell = calendarMainEl.querySelector<HTMLElement>('.owl-dt-calendar-cell-active')!;
            activeCell.click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe(DateView.YEAR);
          });

          it('should return to month view on enter', () => {
            const tableBodyEl = calendarMainEl.querySelector<HTMLElement>('.owl-dt-calendar-body')!;

            dispatchKeyboardEvent(tableBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            dispatchKeyboardEvent(tableBodyEl, 'keydown', ENTER);
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe(DateView.MONTH);
            expect(calendarInstance.pickerMoment).toEqual(new Date(2018, MONTHS.FEB, 28));
            expect(testComponent.selected).toBeUndefined();
          });
        });

        describe('multi-years view', () => {
          beforeEach(() => {
            dispatchMouseEvent(periodButton, 'click');
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe(DateView.MULTI_YEARS);
          });

          it('should return to year view on enter', () => {
            const tableBodyEl = calendarMainEl.querySelector<HTMLElement>('.owl-dt-calendar-body')!;

            dispatchKeyboardEvent(tableBodyEl, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            dispatchKeyboardEvent(tableBodyEl, 'keydown', ENTER);
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe(DateView.YEAR);
            expect(calendarInstance.pickerMoment).toEqual(new Date(2019, MONTHS.JAN, 31));
            expect(testComponent.selected).toBeUndefined();
          });
        });
      });
    });
  });

  describe('calendar with min and max', () => {
    let fixture: ComponentFixture<CalendarWithMinMaxComponent>;
    let testComponent: CalendarWithMinMaxComponent;
    let calendarElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarWithMinMaxComponent);
      fixture.detectChanges();

      const calendarDebugElement = fixture.debugElement.query(By.directive(OwlCalendarComponent));
      calendarElement = calendarDebugElement.nativeElement;

      testComponent = fixture.componentInstance;
    });

    it('should re-render the month view when the minDate changes', () => {
      const monthViewDebugElm = fixture.debugElement.query(By.directive(OwlMonthViewComponent));
      const monthViewComp = monthViewDebugElm.componentInstance;
      expect(monthViewComp).toBeTruthy();

      spyOn(monthViewComp, 'generateCalendar').and.callThrough();
      testComponent.minDate = new Date(2017, MONTHS.NOV, 1);
      fixture.detectChanges();

      expect(monthViewComp.generateCalendar).toHaveBeenCalled();
    });

    it('should re-render the month view when the maxDate changes', () => {
      const monthViewDebugElm = fixture.debugElement.query(By.directive(OwlMonthViewComponent));
      const monthViewComp = monthViewDebugElm.componentInstance;
      expect(monthViewComp).toBeTruthy();

      spyOn(monthViewComp, 'generateCalendar').and.callThrough();
      testComponent.maxDate = new Date(2017, MONTHS.NOV, 1);
      fixture.detectChanges();

      expect(monthViewComp.generateCalendar).toHaveBeenCalled();
    });

    it('should re-render the year view when the minDate changes', () => {
      fixture.detectChanges();
      const periodButton = calendarElement.querySelector<HTMLElement>('.owl-dt-control-period-button')!;
      periodButton.click();
      fixture.detectChanges();

      const activeCell = calendarElement.querySelector<HTMLElement>('.owl-dt-calendar-cell-active')!;
      activeCell.click();
      fixture.detectChanges();

      const yearViewDebugElm = fixture.debugElement.query(By.directive(OwlYearViewComponent));
      const yearViewComp = yearViewDebugElm.componentInstance;
      expect(yearViewComp).toBeTruthy();

      spyOn(yearViewComp, 'generateMonthList').and.callThrough();
      testComponent.minDate = new Date(2017, MONTHS.NOV, 1);
      fixture.detectChanges();

      expect(yearViewComp.generateMonthList).toHaveBeenCalled();
    });

    it('should re-render the year view when the maxDate changes', () => {
      fixture.detectChanges();
      const periodButton = calendarElement.querySelector<HTMLElement>('.owl-dt-control-period-button')!;
      periodButton.click();
      fixture.detectChanges();

      const activeCell = calendarElement.querySelector<HTMLElement>('.owl-dt-calendar-cell-active')!;
      activeCell.click();
      fixture.detectChanges();

      const yearViewDebugElm = fixture.debugElement.query(By.directive(OwlYearViewComponent));
      const yearViewComp = yearViewDebugElm.componentInstance;
      expect(yearViewComp).toBeTruthy();

      spyOn(yearViewComp, 'generateMonthList').and.callThrough();
      testComponent.maxDate = new Date(2017, MONTHS.NOV, 1);
      fixture.detectChanges();

      expect(yearViewComp.generateMonthList).toHaveBeenCalled();
    });

    it('should re-render the multi-years view when the minDate changes', () => {
      fixture.detectChanges();
      const periodButton = calendarElement.querySelector<HTMLElement>('.owl-dt-control-period-button')!;
      periodButton.click();
      fixture.detectChanges();

      const multiYearsViewDebugElm = fixture.debugElement.query(By.directive(OwlMultiYearViewComponent));
      const multiYearsViewComp = multiYearsViewDebugElm.componentInstance;
      expect(multiYearsViewComp).toBeTruthy();

      spyOn(multiYearsViewComp, 'generateYearList').and.callThrough();
      testComponent.minDate = new Date(2017, MONTHS.NOV, 1);
      fixture.detectChanges();

      expect(multiYearsViewComp.generateYearList).toHaveBeenCalled();
    });

    it('should re-render the multi-years view when the maxDate changes', () => {
      fixture.detectChanges();
      const periodButton = calendarElement.querySelector<HTMLElement>('.owl-dt-control-period-button')!;
      periodButton.click();
      fixture.detectChanges();

      const multiYearsViewDebugElm = fixture.debugElement.query(By.directive(OwlMultiYearViewComponent));
      const multiYearsViewComp = multiYearsViewDebugElm.componentInstance;
      expect(multiYearsViewComp).toBeTruthy();

      spyOn(multiYearsViewComp, 'generateYearList').and.callThrough();
      testComponent.maxDate = new Date(2017, MONTHS.NOV, 1);
      fixture.detectChanges();

      expect(multiYearsViewComp.generateYearList).toHaveBeenCalled();
    });
  });

  describe('calendar with date filter', () => {
    let fixture: ComponentFixture<CalendarWithDateFilterComponent>;
    let testComponent: CalendarWithDateFilterComponent;
    let calendarElement: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(CalendarWithDateFilterComponent);
      fixture.detectChanges();

      const calendarDebugElement = fixture.debugElement.query(By.directive(OwlCalendarComponent));
      calendarElement = calendarDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
    });

    it('should disable and prevent selection of filtered dates', () => {
      const monthCell = calendarElement.querySelector<HTMLElement>('[aria-label="January 2, 2018"]')!;
      expect(testComponent.selected).toBeFalsy();

      monthCell.click();
      fixture.detectChanges();

      expect(testComponent.selected).toEqual(new Date(2018, MONTHS.JAN, 2));
    });
  });
});

@Component({
  standalone: true,
  template: `
    <owl-date-time-calendar
      [pickerMoment]="pickerMoment"
      [selectMode]="selectMode"
      [(selected)]="selected"
      (monthSelected)="selectedMonth=$event"
      (yearSelected)="selectedYear=$event">
    </owl-date-time-calendar>
  `,
  imports: [OwlCalendarComponent]
})
class StandardCalendarComponent {
  public selectMode = 'single';
  public selected?: Date;
  public selectedYear?: Date;
  public selectedMonth?: Date;
  public pickerMoment = new Date(2018, MONTHS.JAN, 31);
}

@Component({
  standalone: true,
  template: `
    <owl-date-time-calendar
      [maxDate]="maxDate"
      [minDate]="minDate"
      [pickerMoment]="pickerMoment"
      [selectMode]="selectMode">
    </owl-date-time-calendar>
  `,
  imports: [OwlCalendarComponent]
})
class CalendarWithMinMaxComponent {
  public selectMode = 'single';
  public startAt?: Date;
  public minDate = new Date(2016, MONTHS.JAN, 1);
  public maxDate = new Date(2019, MONTHS.JAN, 1);
  public pickerMoment = new Date(2018, MONTHS.JAN, 31);
}

@Component({
  standalone: true,
  template: `
    <owl-date-time-calendar
      [dateFilter]="dateFilter"
      [pickerMoment]="pickerMoment"
      [selectMode]="selectMode"
      [(selected)]="selected">
    </owl-date-time-calendar>
  `,
  imports: [OwlCalendarComponent]
})
class CalendarWithDateFilterComponent {
  public selectMode = 'single';
  public selected?: Date;
  public pickerMoment = new Date(2018, MONTHS.JAN, 31);

  public dateFilter(date: Date): boolean {
    return !(date.getDate() % 2) && date.getMonth() !== MONTHS.NOV;
  }
}
