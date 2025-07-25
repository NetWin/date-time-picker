import { DOWN_ARROW, END, HOME, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, UP_ARROW } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchKeyboardEvent, dispatchMouseEvent } from '../../test-helpers';
import { OwlNativeDateTimeModule } from './adapter/native-date-time.module';
import { OwlMultiYearViewComponent } from './calendar-multi-year-view.component';
import { OwlDateTimeIntl } from './date-time-picker-intl.service';
import { OwlDateTimeModule } from './date-time.module';

const JAN = 0;
const YEAR_ROWS = 7;
const YEARS_PER_ROW = 3;

describe('OwlMultiYearViewComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OwlNativeDateTimeModule,
        OwlDateTimeModule,
        StandardMultiYearViewComponent,
        MultiYearViewWithDateFilterComponent
      ],
      providers: [OwlDateTimeIntl]
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
      const selectedElContent = multiYearViewElement.querySelector(
        '.owl-dt-calendar-cell-selected.owl-dt-calendar-cell-content'
      );
      expect(selectedElContent.innerHTML.trim()).toBe('2020');
    });

    it('should NOT show selected year if in different range', () => {
      testComponent.selected = new Date(2040, JAN, 10);
      fixture.detectChanges();

      const selectedElContent = multiYearViewElement.querySelector(
        '.owl-calendar-body-selected.owl-dt-calendar-cell-content'
      );
      expect(selectedElContent).toBeNull();
    });

    it('should fire change event on cell clicked', () => {
      const cellDecember = multiYearViewElement.querySelector('[aria-label="2030"]');
      dispatchMouseEvent(cellDecember, 'click');
      fixture.detectChanges();

      const selectedElContent = multiYearViewElement.querySelector(
        '.owl-dt-calendar-cell-active .owl-dt-calendar-cell-content'
      );
      console.info(selectedElContent);
      expect(selectedElContent.innerHTML.trim()).toBe('2030');
    });

    it('should mark active date', () => {
      const cell2017 = multiYearViewElement.querySelector('[aria-label="2018"]');
      expect((cell2017 as HTMLElement).innerText.trim()).toBe('2018');
      expect(cell2017.classList).toContain('owl-dt-calendar-cell-active');
    });

    it('should decrement year on left arrow press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body');
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2017, JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2016, JAN, 5));
    });

    it('should increment year on right arrow press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body');
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2019, JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2020, JAN, 5));
    });

    it('should go up a row on up arrow press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body');
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 - YEARS_PER_ROW, JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 - YEARS_PER_ROW * 2, JAN, 5));
    });

    it('should go down a row on down arrow press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body');
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 + YEARS_PER_ROW, JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 + YEARS_PER_ROW * 2, JAN, 5));
    });

    it('should go to first year in current range on home press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body');
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2016, JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2016, JAN, 5));
    });

    it('should go to last year in current range on end press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body');
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2036, JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2036, JAN, 5));
    });

    it('should go to same index in previous year range page up press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body');
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 - YEARS_PER_ROW * YEAR_ROWS, JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 - YEARS_PER_ROW * YEAR_ROWS * 2, JAN, 5));
    });

    it('should go to same index in next year range on page down press', () => {
      const calendarBodyEl = multiYearViewElement.querySelector('.owl-dt-calendar-body');
      dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 + YEARS_PER_ROW * YEAR_ROWS, JAN, 5));

      dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
      fixture.detectChanges();

      expect(multiYearViewInstance.pickerMoment).toEqual(new Date(2018 + YEARS_PER_ROW * YEAR_ROWS * 2, JAN, 5));
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
      const cell2018 = multiYearViewElement.querySelector('[aria-label="2018"]');
      const cell2019 = multiYearViewElement.querySelector('[aria-label="2019"]');
      expect(cell2019.classList).not.toContain('owl-dt-calendar-cell-disabled');
      expect(cell2018.classList).toContain('owl-dt-calendar-cell-disabled');
    });
  });
});

@Component({
  imports: [OwlMultiYearViewComponent],
  template: `
    <owl-date-time-multi-year-view
      [selected]="selected"
      [(pickerMoment)]="pickerMoment"
      (changeYear)="handleChange($event)">
    </owl-date-time-multi-year-view>
  `,
  changeDetection: ChangeDetectionStrategy.Default
})
class StandardMultiYearViewComponent {
  public selected = new Date(2020, JAN, 10);
  public pickerMoment = new Date(2018, JAN, 5);

  public handleChange(date: Date): void {
    this.pickerMoment = new Date(date);
  }
}

@Component({
  imports: [OwlMultiYearViewComponent],
  template: `
    <owl-date-time-multi-year-view
      [dateFilter]="dateFilter"
      [(pickerMoment)]="pickerMoment">
    </owl-date-time-multi-year-view>
  `,
  changeDetection: ChangeDetectionStrategy.Default
})
class MultiYearViewWithDateFilterComponent {
  public pickerMoment = new Date(2018, JAN, 1);
  public dateFilter(date: Date): boolean {
    return date.getFullYear() !== 2018;
  }
}
