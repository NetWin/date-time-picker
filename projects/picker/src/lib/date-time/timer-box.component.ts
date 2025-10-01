import { coerceNumberProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  output
} from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  exportAs: 'owlDateTimeTimerBox',
  selector: 'owl-date-time-timer-box',
  templateUrl: './timer-box.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'owl-dt-timer-box' }
})
export class OwlTimerBoxComponent implements OnInit, OnDestroy {
  @Input() public showDivider = false;

  @Input() public upBtnAriaLabel: string;

  @Input() public upBtnDisabled: boolean;

  @Input() public downBtnAriaLabel: string;

  @Input() public downBtnDisabled: boolean;

  /**
   * Value would be displayed in the box
   * If it is null, the box would display [value]
   */
  @Input() public boxValue: number | null = null;

  @Input() public value: number;

  @Input() public min: number;

  @Input() public max: number;

  @Input() public step = 1;

  @Input() public inputLabel: string;

  public readonly valueChange = output<number>();

  public readonly inputChange = output<number>();

  private inputStream = new Subject<string>();

  private inputStreamSub = Subscription.EMPTY;

  protected get displayValue(): string {
    const value = this.boxValue || this.value;

    if (value === null || isNaN(value)) {
      return '';
    }

    return value < 10 ? `0${value.toString()}` : value.toString();
  }

  @ViewChild('valueInput', { static: true })
  private valueInput: ElementRef<HTMLInputElement>;
  private onValueInputMouseWheelBind = this.onValueInputMouseWheel.bind(this);

  public ngOnInit(): void {
    this.inputStreamSub = this.inputStream.pipe(debounceTime(750)).subscribe((val: string) => {
      if (val) {
        const inputValue = coerceNumberProperty(val, 0);
        this.updateValueViaInput(inputValue);
      }
    });
    this.bindValueInputMouseWheel();
  }

  public ngOnDestroy(): void {
    this.unbindValueInputMouseWheel();
    this.inputStreamSub.unsubscribe();
  }

  public upBtnClicked(): void {
    this.updateValue(this.value + this.step);
  }

  public downBtnClicked(): void {
    this.updateValue(this.value - this.step);
  }

  protected downViaArrowKey(): void {
    if (this.downBtnDisabled) return;
    this.downBtnClicked();
  }

  protected upViaArrowKey(): void {
    if (this.upBtnDisabled) return;
    this.upBtnClicked();
  }

  public handleInputChange(val: string): void {
    this.inputStream.next(val);
  }

  public focusOut(value: string): void {
    if (value) {
      const inputValue = coerceNumberProperty(value, 0);
      this.updateValueViaInput(inputValue);
    }
  }

  private updateValue(value: number): void {
    this.valueChange.emit(value);
  }

  private updateValueViaInput(value: number): void {
    if (value > this.max || value < this.min) {
      return;
    }
    this.inputChange.emit(value);
  }

  private onValueInputMouseWheel(event: WheelEvent): void {
    const delta = -event.deltaY || -event.detail;

    if (delta > 0) {
      if (!this.upBtnDisabled) {
        this.upBtnClicked();
      }
    } else if (delta < 0) {
      if (!this.downBtnDisabled) {
        this.downBtnClicked();
      }
    }

    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
  }

  private bindValueInputMouseWheel(): void {
    this.valueInput.nativeElement.addEventListener(
      'onwheel' in document ? 'wheel' : 'mousewheel',
      this.onValueInputMouseWheelBind
    );
  }

  private unbindValueInputMouseWheel(): void {
    this.valueInput.nativeElement.removeEventListener(
      'onwheel' in document ? 'wheel' : 'mousewheel',
      this.onValueInputMouseWheelBind
    );
  }
}
