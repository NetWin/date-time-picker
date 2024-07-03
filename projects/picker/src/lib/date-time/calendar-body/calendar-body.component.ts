import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  NgZone,
  Output,
  inject
} from '@angular/core';
import { take } from 'rxjs';
import { SelectMode } from '../date-time';

export class CalendarCell {
  constructor(
    public value: number,
    public displayValue: string,
    public ariaLabel: string,
    public enabled: boolean,
    public out = false,
    public cellClass = ''
  ) { }
}

@Component({
  standalone: true,
  selector: '[owl-date-time-calendar-body]',
  exportAs: 'owlDateTimeCalendarBody',
  templateUrl: './calendar-body.component.html',
  styleUrl: './calendar-body.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwlCalendarBodyComponent {

  readonly #elmRef = inject(ElementRef);

  readonly #ngZone = inject(NgZone);

  /**
   * The cell number of the active cell in the table.
   */
  @Input()
  public activeCell = 0;

  /**
   * The cells to display in the table.
   */
  @Input()
  public rows: Array<Array<CalendarCell>>;

  /**
   * The number of columns in the table.
   */
  @Input()
  public numCols = 7;

  /**
   * The ratio (width / height) to use for the cells in the table.
   */
  @Input()
  public cellRatio = 1;

  /**
   * The value in the table that corresponds to today.
   */
  @Input()
  public todayValue: number;

  /**
   * The value in the table that is currently selected.
   */
  @Input()
  public selectedValues: Array<number>;

  /**
   * Current picker select mode
   */
  @Input()
  public selectMode: SelectMode;

  /**
   * Emit when a calendar cell is selected
   */
  @Output()
  public readonly cellSelected = new EventEmitter<CalendarCell>();

  @HostBinding('class.owl-dt-calendar-body')
  public readonly owlDTCalendarBodyClass = true;

  public get isInSingleMode(): boolean {
    return this.selectMode === 'single';
  }

  public get isInRangeMode(): boolean {
    return (
      this.selectMode === 'range' ||
      this.selectMode === 'rangeFrom' ||
      this.selectMode === 'rangeTo'
    );
  }

  public selectCell(cell: CalendarCell): void {
    this.cellSelected.emit(cell);
  }

  public isActiveCell(rowIndex: number, colIndex: number): boolean {
    const cellNumber = rowIndex * this.numCols + colIndex;
    return cellNumber === this.activeCell;
  }

  /**
   * Check if the cell is selected
   */
  public isSelected(value: number): boolean {
    if (!this.selectedValues?.length) {
      return false;
    }

    if (this.isInSingleMode) {
      return value === this.selectedValues[0];
    }

    if (this.isInRangeMode) {
      const fromValue = this.selectedValues[0];
      const toValue = this.selectedValues[1];

      return value === fromValue || value === toValue;
    }

    return false;
  }

  /**
   * Check if the cell in the range
   */
  public isInRange(value: number): boolean {
    if (!this.isInRangeMode) {
      return false;
    }

    const fromValue = this.selectedValues[0];
    const toValue = this.selectedValues[1];

    if (fromValue !== null && toValue !== null) {
      return value >= fromValue && value <= toValue;
    } else {
      return value === fromValue || value === toValue;
    }
  }

  /**
   * Check if the cell is the range from
   */
  public isRangeFrom(value: number): boolean {
    if (!this.isInRangeMode) {
      return false;
    }

    const fromValue = this.selectedValues[0];
    return fromValue !== null && value === fromValue;
  }

  /**
   * Check if the cell is the range to
   */
  public isRangeTo(value: number): boolean {
    if (!this.isInRangeMode) {
      return false;
    }
    const toValue = this.selectedValues[1];
    return toValue !== null && value === toValue;
  }

  /**
   * Focus to a active cell
   */
  public focusActiveCell(): void {
    this.#ngZone.runOutsideAngular(() => {
      this.#ngZone.onStable
        .asObservable()
        .pipe(take(1))
        .subscribe(() => {
          this.#elmRef.nativeElement
            .querySelector('.owl-dt-calendar-cell-active')
            .focus();
        });
    });
  }
}
