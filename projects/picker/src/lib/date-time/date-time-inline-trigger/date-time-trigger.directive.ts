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

@Directive({
  standalone: true,
  selector: '[owlDateTimeTrigger]'
})
export class OwlDateTimeTriggerDirective<T> implements OnChanges, AfterContentInit, OnDestroy {

  protected readonly changeDetector = inject(ChangeDetectorRef);

  @Input() public owlDateTimeTrigger: OwlDateTimeComponent<T>;

  private _disabled: boolean;
  @Input()
  public get disabled(): boolean {
    return this._disabled === undefined ? this.owlDateTimeTrigger.disabled : !!this._disabled;
  }
  public set disabled(value: boolean) {
    this._disabled = value;
  }

  @HostBinding('class.owl-dt-trigger-disabled')
  public get owlDTTriggerDisabledClass(): boolean {
    return this.disabled;
  }

  private stateChanges: Subscription | undefined;

  public ngOnChanges(changes: SimpleChanges): void {
    if ('owlDateTimeTrigger' in changes) {
      this.watchStateChanges();
    }
  }

  public ngAfterContentInit(): void {
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
    const observables: Array<EventEmitter<boolean>> = [];

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
