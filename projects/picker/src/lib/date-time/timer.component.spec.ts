import { ChangeDetectionStrategy, Component, DebugElement, EventEmitter, NgZone } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent } from '../../test-helpers';
import { OwlNativeDateTimeModule } from './adapter/native-date-time.module';
import { OwlDateTimeIntl } from './date-time-picker-intl.service';
import { OwlDateTimeModule } from './date-time.module';
import { OwlTimerComponent } from './timer.component';

const JAN = 0;
const FEB = 1;

class MockNgZone extends NgZone {
  public override onStable = new EventEmitter(false);
  constructor() {
    super({ enableLongStackTrace: false });
  }
  public override run<T>(fn: () => T): T {
    return fn();
  }
  public override runOutsideAngular<T>(fn: () => T): T {
    return fn();
  }
  public simulateZoneExit(): void {
    this.onStable.emit(null);
  }
}

describe('OwlTimerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwlNativeDateTimeModule, OwlDateTimeModule, StandardTimerComponent],
      providers: [
        OwlDateTimeIntl,
        {
          provide: NgZone,
          useFactory: () => new MockNgZone()
        }
      ]
    }).compileComponents();
  });

  describe('standard timer', () => {
    let fixture: ComponentFixture<StandardTimerComponent>;
    let testComponent: StandardTimerComponent;
    let timerDebugElement: DebugElement;
    let timerElement: HTMLElement;
    let timerInstance: OwlTimerComponent<Date>;

    beforeEach(() => {
      fixture = TestBed.createComponent(StandardTimerComponent);
      fixture.detectChanges();

      timerDebugElement = fixture.debugElement.query(By.directive(OwlTimerComponent));
      timerElement = timerDebugElement.nativeElement;
      testComponent = fixture.componentInstance;
      timerInstance = timerDebugElement.componentInstance;
    });

    it('should have two timer boxes if showSecondsTimer set to false', () => {
      const timerBoxes = timerElement.querySelectorAll('owl-date-time-timer-box');
      expect(timerInstance.showSecondsTimer()).toBeFalsy();
      expect(timerBoxes.length).toBe(2);
    });

    it('should have three timer boxes if showSecondsTimer set to true', () => {
      testComponent.showSecondsTimer = true;
      fixture.detectChanges();

      const timerBoxes = timerElement.querySelectorAll('owl-date-time-timer-box');
      expect(timerInstance.showSecondsTimer()).toBeTruthy();
      expect(timerBoxes.length).toBe(3);
    });

    it('should NOT have the hour12 toggle button if hour12Timer set to false', () => {
      const toggleBtn = timerElement.querySelector('button.owl-dt-timer-hour12-box');
      expect(timerInstance.hour12Timer()).toBeFalsy();
      expect(toggleBtn).toBeFalsy();
    });

    it('should have the hour12 toggle button if hour12Timer set to true', () => {
      testComponent.hour12Timer = true;
      fixture.detectChanges();

      const toggleBtn = timerElement.querySelector('button.owl-dt-timer-hour12-box');
      expect(timerInstance.hour12Timer()).toBeTruthy();
      expect(toggleBtn).toBeTruthy();
    });

    it('should dispatch an event when a timer arrow button clicked', fakeAsync(() => {
      spyOn(testComponent, 'handleSelectedChange');
      expect(testComponent.handleSelectedChange).not.toHaveBeenCalled();

      testComponent.showSecondsTimer = true;
      fixture.detectChanges();

      const arrowBtns = timerElement.querySelectorAll<HTMLButtonElement>('button.owl-dt-control-arrow-button');
      expect(arrowBtns.length).toBe(6);

      for (const btn of Array.from(arrowBtns)) {
        btn.click();
        fixture.detectChanges();
        flush();
      }

      expect(testComponent.handleSelectedChange).toHaveBeenCalledTimes(6);
    }));

    it('should dispatch an event when hour12 toggle button clicked', fakeAsync(() => {
      spyOn(testComponent, 'handleSelectedChange');
      expect(testComponent.handleSelectedChange).not.toHaveBeenCalled();

      testComponent.hour12Timer = true;
      fixture.detectChanges();

      const toggleBtn = timerElement.querySelector<HTMLButtonElement>('button.owl-dt-timer-hour12-box');

      toggleBtn.click();
      fixture.detectChanges();
      flush();

      expect(testComponent.handleSelectedChange).toHaveBeenCalledTimes(1);
    }));

    it('should add or minus stepHour hours when hour arrow button clicked', fakeAsync(() => {
      expect(timerInstance.stepHour()).toBe(1);

      const arrowBtns = timerElement.querySelectorAll<HTMLButtonElement>('button.owl-dt-control-arrow-button');
      expect(arrowBtns.length).toBe(4);

      arrowBtns[0].click();
      fixture.detectChanges();
      flush();
      expect(testComponent.pickerMoment).toEqual(new Date(2018, JAN, 31, 13, 30, 30));

      arrowBtns[1].click();
      fixture.detectChanges();
      flush();
      expect(testComponent.pickerMoment).toEqual(new Date(2018, JAN, 31, 12, 30, 30));

      testComponent.stepHour = 2;
      fixture.detectChanges();
      expect(timerInstance.stepHour()).toBe(2);

      arrowBtns[0].click();
      fixture.detectChanges();
      flush();
      expect(testComponent.pickerMoment).toEqual(new Date(2018, JAN, 31, 14, 30, 30));

      arrowBtns[1].click();
      fixture.detectChanges();
      flush();
      expect(testComponent.pickerMoment).toEqual(new Date(2018, JAN, 31, 12, 30, 30));
    }));

    it('should add or minus stepMinute minutes when minute arrow button clicked', fakeAsync(() => {
      expect(timerInstance.stepMinute()).toBe(1);

      const arrowBtns = timerElement.querySelectorAll<HTMLButtonElement>('button.owl-dt-control-arrow-button');
      expect(arrowBtns.length).toBe(4);

      arrowBtns[2].click();
      fixture.detectChanges();
      flush();
      expect(testComponent.pickerMoment).toEqual(new Date(2018, JAN, 31, 12, 31, 30));

      arrowBtns[3].click();
      fixture.detectChanges();
      flush();
      expect(testComponent.pickerMoment).toEqual(new Date(2018, JAN, 31, 12, 30, 30));

      testComponent.stepMinute = 2;
      fixture.detectChanges();
      expect(timerInstance.stepMinute()).toBe(2);

      arrowBtns[2].click();
      fixture.detectChanges();
      flush();
      expect(testComponent.pickerMoment).toEqual(new Date(2018, JAN, 31, 12, 32, 30));

      arrowBtns[3].click();
      fixture.detectChanges();
      flush();
      expect(testComponent.pickerMoment).toEqual(new Date(2018, JAN, 31, 12, 30, 30));
    }));

    it('should add or minus stepSecond seconds when second arrow button clicked', fakeAsync(() => {
      expect(timerInstance.stepSecond()).toBe(1);

      testComponent.showSecondsTimer = true;
      fixture.detectChanges();
      const arrowBtns = timerElement.querySelectorAll<HTMLButtonElement>('button.owl-dt-control-arrow-button');
      expect(arrowBtns.length).toBe(6);

      arrowBtns[4].click();
      fixture.detectChanges();
      flush();
      expect(testComponent.pickerMoment).toEqual(new Date(2018, JAN, 31, 12, 30, 31));

      arrowBtns[5].click();
      fixture.detectChanges();
      flush();
      expect(testComponent.pickerMoment).toEqual(new Date(2018, JAN, 31, 12, 30, 30));

      testComponent.stepSecond = 2;
      fixture.detectChanges();
      expect(timerInstance.stepSecond()).toBe(2);

      arrowBtns[4].click();
      fixture.detectChanges();
      flush();
      expect(testComponent.pickerMoment).toEqual(new Date(2018, JAN, 31, 12, 30, 32));

      arrowBtns[5].click();
      fixture.detectChanges();
      flush();
      expect(testComponent.pickerMoment).toEqual(new Date(2018, JAN, 31, 12, 30, 30));
    }));

    it('should toggle between PM and AM when hour12 toggle button clicked', fakeAsync(() => {
      testComponent.hour12Timer = true;
      fixture.detectChanges();

      const toggleBtn = timerElement.querySelector<HTMLButtonElement>('button.owl-dt-timer-hour12-box');
      expect(toggleBtn.innerHTML).toContain('PM');

      toggleBtn.click();
      fixture.detectChanges();
      flush();

      expect(toggleBtn.innerHTML).toContain('AM');
      expect(testComponent.pickerMoment).toEqual(new Date(2018, JAN, 31, 0, 30, 30));
    }));

    it('should disable all down arrow button if pickerMoment equals to minDateTime', () => {
      testComponent.showSecondsTimer = true;
      fixture.detectChanges();
      const arrowBtns = timerElement.querySelectorAll<HTMLButtonElement>('button.owl-dt-control-arrow-button');
      expect(arrowBtns.length).toBe(6);

      testComponent.pickerMoment = new Date(testComponent.minDateTime);
      fixture.detectChanges();

      // up arrow buttons
      expect(arrowBtns[0].hasAttribute('disabled')).toBe(false);
      expect(arrowBtns[2].hasAttribute('disabled')).toBe(false);
      expect(arrowBtns[4].hasAttribute('disabled')).toBe(false);

      // down arrow buttons
      expect(arrowBtns[1].hasAttribute('disabled')).toBe(true);
      expect(arrowBtns[3].hasAttribute('disabled')).toBe(true);
      expect(arrowBtns[5].hasAttribute('disabled')).toBe(true);
    });

    it('should disable all up arrow button if pickerMoment equals to maxDateTime', () => {
      testComponent.showSecondsTimer = true;
      fixture.detectChanges();
      const arrowBtns = timerElement.querySelectorAll<HTMLButtonElement>('button.owl-dt-control-arrow-button');
      expect(arrowBtns.length).toBe(6);

      testComponent.pickerMoment = new Date(testComponent.maxDateTime);
      fixture.detectChanges();

      // up arrow buttons
      expect(arrowBtns[0].hasAttribute('disabled')).toBe(true);
      expect(arrowBtns[2].hasAttribute('disabled')).toBe(true);
      expect(arrowBtns[4].hasAttribute('disabled')).toBe(true);

      // down arrow buttons
      expect(arrowBtns[1].hasAttribute('disabled')).toBe(false);
      expect(arrowBtns[3].hasAttribute('disabled')).toBe(false);
      expect(arrowBtns[5].hasAttribute('disabled')).toBe(false);
    });

    it('should not reformat input text while field is focused', fakeAsync(() => {
      const timeCells = timerElement.querySelectorAll<HTMLInputElement>('.owl-dt-timer-input');

      dispatchFakeEvent(timeCells[0], 'focusin');
      timeCells[0].value = '5';
      dispatchFakeEvent(timeCells[0], 'input');
      setTimeout(() => {
        /* noop */
      }, 1000);

      timeCells[1].value = '8';
      dispatchFakeEvent(timeCells[1], 'input');
      setTimeout(() => {
        /* noop */
      }, 1000);

      fixture.detectChanges();

      expect(timeCells[0].value).toEqual('5');
      expect(timeCells[1].value).toEqual('8');

      flush();
    }));
  });
});

@Component({
  template: `
    <owl-date-time-timer
      [hour12Timer]="hour12Timer"
      [maxDateTime]="maxDateTime"
      [minDateTime]="minDateTime"
      [pickerMoment]="pickerMoment"
      [showSecondsTimer]="showSecondsTimer"
      [stepHour]="stepHour"
      [stepMinute]="stepMinute"
      [stepSecond]="stepSecond"
      (selectedChange)="handleSelectedChange($event)"></owl-date-time-timer>
  `,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [OwlTimerComponent]
})
class StandardTimerComponent {
  public stepHour = 1;
  public stepMinute = 1;
  public stepSecond = 1;
  public hour12Timer = false;
  public showSecondsTimer = false;
  public pickerMoment = new Date(2018, JAN, 31, 12, 30, 30);
  public minDateTime = new Date(2018, JAN, 29, 12, 30, 30);
  public maxDateTime = new Date(2018, FEB, 1, 12, 30, 30);

  public handleSelectedChange(val: Date): void {
    this.pickerMoment = val;
  }
}
