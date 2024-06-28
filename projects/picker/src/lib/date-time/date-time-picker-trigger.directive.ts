import {
  AfterContentInit,
  ChangeDetectorRef,
  Directive,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import { Subscription, merge, of as observableOf } from 'rxjs';
import { OwlDateTimeComponent } from './date-time-picker.component';

@Directive({
  selector: '[owlDateTimeTrigger]',
  host: {
    '(click)': 'handleClickOnHost($event)',
    '[class.owl-dt-trigger-disabled]': 'owlDTTriggerDisabledClass'
  }
})
export class OwlDateTimeTriggerDirective<T> implements OnChanges, AfterContentInit, OnDestroy {

  @Input('owlDateTimeTrigger') dtPicker: OwlDateTimeComponent<T>;

  private _disabled: boolean;
  @Input()
  get disabled(): boolean {
    return this._disabled === undefined ? this.dtPicker.disabled : !!this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
  }

  get owlDTTriggerDisabledClass(): boolean {
    return this.disabled;
  }

  private stateChanges = Subscription.EMPTY;

  constructor(protected changeDetector: ChangeDetectorRef) {
  }

  public ngOnChanges(changes: SimpleChanges) {
    if ('datepicker' in changes) {
      this.watchStateChanges();
    }
  }

  public ngAfterContentInit() {
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

    const inputDisabled = this.dtPicker && this.dtPicker.dtInput ?
      this.dtPicker.dtInput.disabledChange : observableOf();

    const pickerDisabled = this.dtPicker ?
      this.dtPicker.disabledChange : observableOf();

    this.stateChanges = merge([pickerDisabled, inputDisabled])
      .subscribe(() => {
        this.changeDetector.markForCheck();
      });
  }
}
