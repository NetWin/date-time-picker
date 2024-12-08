/**
 * calendar-body.component.spec
 */
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CalendarCell, OwlCalendarBodyComponent } from './calendar-body.component';

describe('OwlCalendarBodyComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        OwlCalendarBodyComponent,

        // Test components
        StandardCalendarBodyComponent
      ]
    }).compileComponents();
  });

  describe('standard CalendarBodyComponent', () => {
    let fixture: ComponentFixture<StandardCalendarBodyComponent>;
    let testComponent: StandardCalendarBodyComponent;
    let calendarBodyNativeElement: Element;
    let rowEls: NodeListOf<Element>;
    let cellEls: NodeListOf<Element>;

    const refreshElementLists = (): void => {
      rowEls = calendarBodyNativeElement.querySelectorAll('tr');
      cellEls = calendarBodyNativeElement.querySelectorAll('.owl-dt-calendar-cell');
    };

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardCalendarBodyComponent);
      fixture.detectChanges();

      const calendarBodyDebugElement = fixture.debugElement.query(By.directive(OwlCalendarBodyComponent));
      calendarBodyNativeElement = calendarBodyDebugElement.nativeElement;
      testComponent = fixture.componentInstance;

      refreshElementLists();
    });

    it('should create body', () => {
      expect(rowEls.length).toBe(2);
      expect(cellEls.length).toBe(14);
    });

    it('should highlight today', () => {
      const todayCell = calendarBodyNativeElement.querySelector('.owl-dt-calendar-cell-today');
      expect(todayCell).not.toBeNull();
      expect(todayCell.innerHTML.trim()).toBe('3');
    });

    it('should highlight selected', () => {
      const selectedCell = calendarBodyNativeElement.querySelector('.owl-dt-calendar-cell-selected');
      expect(selectedCell).not.toBeNull();
      expect(selectedCell.innerHTML.trim()).toBe('4');
    });

    it('cell should be selected on click', () => {
      spyOn(testComponent, 'handleSelect');
      expect(testComponent.handleSelect).not.toHaveBeenCalled();
      const todayElement = calendarBodyNativeElement.querySelector('.owl-dt-calendar-cell-today') as HTMLElement;
      todayElement.click();
      fixture.detectChanges();

      expect(testComponent.handleSelect).toHaveBeenCalled();
    });

    it('should mark active date', () => {
      expect((cellEls[10] as HTMLElement).innerText.trim()).toBe('11');
      expect(cellEls[10].classList).toContain('owl-dt-calendar-cell-active');
    });

    it('should have aria-current set for today', () => {
      const currentCells = calendarBodyNativeElement.querySelectorAll('.owl-dt-calendar-cell[aria-current]');
      expect(currentCells.length).toBe(1);
      const todayCell = calendarBodyNativeElement.querySelector('.owl-dt-calendar-cell-today');
      expect(currentCells[0].getAttribute('aria-current')).toBe('date');
      expect(currentCells[0].firstChild).toBe(todayCell);
    });

    it('should have aria-selected set on selected cells', () => {
      const calendarCells = calendarBodyNativeElement.querySelectorAll('.owl-dt-calendar-cell');
      const selectedCells = calendarBodyNativeElement.querySelectorAll('.owl-dt-calendar-cell[aria-selected=true]');
      const nonSelectedCells = calendarBodyNativeElement.querySelectorAll('.owl-dt-calendar-cell[aria-selected=false]');
      expect(nonSelectedCells.length).toBe(calendarCells.length - selectedCells.length);
      const selectedCell = calendarBodyNativeElement.querySelector('.owl-dt-calendar-cell-selected');
      expect(selectedCells[0].firstChild).toBe(selectedCell);
    });
  });
});

@Component({
  standalone: false,
  template: ` <table
    [activeCell]="activeCell"
    [rows]="rows"
    [selectMode]="'single'"
    [selectedValues]="selectedValues"
    [todayValue]="todayValue"
    (select)="handleSelect()"
    owl-date-time-calendar-body></table>`,
  changeDetection: ChangeDetectionStrategy.Default
})
class StandardCalendarBodyComponent {
  public rows = [
    [1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11, 12, 13, 14]
  ].map((r) => r.map(createCell));
  public todayValue = 3;
  public selectedValues = [4];
  public activeCell = 10;

  public handleSelect(): void {
    // Do nothing
  }
}

function createCell(value: number): CalendarCell {
  return new CalendarCell(value, `${value}`, `${value}-label`, true);
}
