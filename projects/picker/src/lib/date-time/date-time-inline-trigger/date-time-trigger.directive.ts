import {
  AfterContentInit,
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject
} from '@angular/core';
import { Subscription, merge } from 'rxjs';
import { OwlDateTimeComponent } from '../date-time-picker/date-time-picker.component';

@Directive({ selector: '[owlDateTimeTrigger]', })
export class OwlDateTimeTriggerDirective<T> implements OnChanges, AfterContentInit, OnDestroy {

  protected readonly changeDetector = inject(ChangeDetectorRef);

  @Input() owlDateTimeTrigger: OwlDateTimeComponent<T>;

  private _disabled: boolean;
  @Input()
  get disabled(): boolean {
    return this._disabled === undefined ? this.owlDateTimeTrigger.disabled : !!this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }

  @HostBinding('class.owl-dt-trigger-disabled')
  get owlDTTriggerDisabledClass(): boolean {
    return this.disabled;
  }

  private stateChanges: Subscription | undefined;

  public ngOnChanges(changes: SimpleChanges) {
    if ('owlDateTimeTrigger' in changes) {
      this.watchStateChanges();
    }
  }

  public ngAfterContentInit() {
    this.watchStateChanges();
  }

  public ngOnDestroy(): void {
    this.stateChanges?.unsubscribe();
  }

  @HostListener('click', ['$event'])
  public handleClickOnHost(event: Event): void {
    if (this.owlDateTimeTrigger) {
      this.owlDateTimeTrigger.open();
      event.stopPropagation();
    }
  }

  private watchStateChanges(): void {
    const observables: Array<EventEmitter<boolean>> = []

    if (this.owlDateTimeTrigger?.dtInput) {
      observables.push(this.owlDateTimeTrigger.dtInput.disabledChange);
    }

    if (this.owlDateTimeTrigger) {
      observables.push(this.owlDateTimeTrigger.disabledChange);
    }

    this.stateChanges?.unsubscribe();
    this.stateChanges = merge(observables).subscribe(() => {
      this.changeDetector.markForCheck();
    });
  }
}
