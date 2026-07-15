import { coerceNumberProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  type OnDestroy,
  type OnInit,
  computed,
  input,
  output,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, filter, map } from 'rxjs';

@Component({
  exportAs: 'owlDateTimeTimerBox',
  selector: 'owl-date-time-timer-box',
  templateUrl: './timer-box.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'owl-dt-timer-box' }
})
export class OwlTimerBoxComponent implements OnInit, OnDestroy {
  public readonly showDivider = input<boolean>(false);

  public readonly upBtnAriaLabel = input<string>();

  public readonly upBtnDisabled = input<boolean>();

  public readonly downBtnAriaLabel = input<string>();

  public readonly downBtnDisabled = input<boolean>();

  /** Value would be displayed in the box If it is null, the box would display [value] */
  public readonly boxValue = input<number>();

  public readonly value = input<number>();

  public readonly min = input<number>();

  public readonly max = input<number>();

  public readonly step = input<number>(1);

  public readonly inputLabel = input<string>();

  public readonly valueChange = output<number>();

  public readonly inputChange = output<number>();

  readonly #inputStream = new Subject<string>();

  protected readonly displayValue = computed(() => {
    const value = this.boxValue() || this.value();

    if (value === null || isNaN(value)) {
      return '';
    }

    return value < 10 ? `0${value.toString()}` : value.toString();
  });

  protected readonly valueInput = viewChild<ElementRef<HTMLInputElement>>('valueInput');
  readonly #onValueInputMouseWheelBind = this.onValueInputMouseWheel.bind(this);

  constructor() {
    this.#inputStream
      .pipe(
        takeUntilDestroyed(),
        debounceTime(750),
        map((v) => v?.trim()),
        filter(Boolean),
        map((v) => coerceNumberProperty(v, 0))
      )
      .subscribe((val: number) => {
        this.updateValueViaInput(val);
      });
  }

  public ngOnInit(): void {
    this.bindValueInputMouseWheel();
  }

  public ngOnDestroy(): void {
    this.unbindValueInputMouseWheel();
  }

  protected upBtnClicked(): void {
    if (this.upBtnDisabled()) return;
    this.updateValue(this.value() + this.step());
  }

  protected downBtnClicked(): void {
    if (this.downBtnDisabled()) return;
    this.updateValue(this.value() - this.step());
  }

  protected handleInputChange(val: string): void {
    this.#inputStream.next(val);
  }

  protected focusOut(value: string): void {
    if (!value?.trim()) return;
    const inputValue = coerceNumberProperty(value, 0);
    this.updateValueViaInput(inputValue);
  }

  private updateValue(value: number): void {
    this.valueChange.emit(value);
  }

  private updateValueViaInput(value: number): void {
    if (value > this.max() || value < this.min()) {
      return;
    }
    this.inputChange.emit(value);
  }

  private onValueInputMouseWheel(event: WheelEvent): void {
    event.preventDefault();

    const delta = -event.deltaY || -event.detail;
    if (delta > 0) {
      this.upBtnClicked();
    } else if (delta < 0) {
      this.downBtnClicked();
    }
  }

  private bindValueInputMouseWheel(): void {
    this.valueInput().nativeElement.addEventListener(
      'onwheel' in document ? 'wheel' : 'mousewheel',
      this.#onValueInputMouseWheelBind
    );
  }

  private unbindValueInputMouseWheel(): void {
    this.valueInput().nativeElement.removeEventListener(
      'onwheel' in document ? 'wheel' : 'mousewheel',
      this.#onValueInputMouseWheelBind
    );
  }
}
