/**
 * date-time-picker-trigger.directive
 */

import {
  AfterContentInit,
  ChangeDetectorRef,
  Directive,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { Subscription, merge, of } from 'rxjs';
import { OwlDateTimeComponent } from './date-time-picker.component';

@Directive({
  standalone: false,
  selector: '[owlDateTimeTrigger]',
  host: {
    '(click)': 'handleClickOnHost($event)',
    '[class.owl-dt-trigger-disabled]': 'owlDTTriggerDisabledClass'
  }
})
export class OwlDateTimeTriggerDirective<T> implements OnChanges, AfterContentInit, OnDestroy {
  @Input('owlDateTimeTrigger') public dtPicker: OwlDateTimeComponent<T>;

  private _disabled: boolean;
  @Input()
  public get disabled(): boolean {
    return this._disabled === undefined ? this.dtPicker.disabled : !!this._disabled;
  }
  public set disabled(value: boolean) {
    this._disabled = value;
  }

  protected get owlDTTriggerDisabledClass(): boolean {
    return this.disabled;
  }

  private stateChanges = Subscription.EMPTY;

  constructor(protected changeDetector: ChangeDetectorRef) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if ('datepicker' in changes) {
      this.watchStateChanges();
    }
  }

  public ngAfterContentInit(): void {
    this.watchStateChanges();
  }

  public ngOnDestroy(): void {
    this.stateChanges.unsubscribe();
  }

  public handleClickOnHost(event: Event): void {
    if (this.dtPicker) {
      this.dtPicker.open();
      event.stopPropagation();
    }
  }

  private watchStateChanges(): void {
    this.stateChanges.unsubscribe();

    const inputDisabled = this.dtPicker?.dtInput?.disabledChange ?? of();
    const pickerDisabled = this.dtPicker?.disabledChange ?? of();

    this.stateChanges = merge([pickerDisabled, inputDisabled]).subscribe(() => {
      this.changeDetector.markForCheck();
    });
  }
}
