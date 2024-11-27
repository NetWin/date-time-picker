import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, NgZone, output } from '@angular/core';
import { take } from 'rxjs/operators';
import { SelectMode } from './date-time.class';

export class CalendarCell {
  constructor(
    public value: number,
    public displayValue: string,
    public ariaLabel: string,
    public enabled: boolean,
    public out: boolean = false,
    public cellClass: string = ''
  ) {}
}

@Component({
  standalone: false,
  selector: '[owl-date-time-calendar-body]',
  exportAs: 'owlDateTimeCalendarBody',
  templateUrl: './calendar-body.component.html',
  styleUrls: ['./calendar-body.component.scss'],
  host: { 'class': 'owl-dt-calendar-body' },
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OwlCalendarBodyComponent {
  readonly #elmRef = inject(ElementRef);
  readonly #ngZone = inject(NgZone);

  /**
   * The cell number of the active cell in the table.
   */
  @Input()
  public activeCell: number = 0;

  /**
   * The cells to display in the table.
   */
  @Input()
  public rows: Array<Array<CalendarCell>>;

  /**
   * The number of columns in the table.
   */
  @Input()
  public numCols: number = 7;

  /**
   * The ratio (width / height) to use for the cells in the table.
   */
  @Input()
  public cellRatio: number = 1;

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
  public readonly selectCell = output<CalendarCell>();

  protected get isInSingleMode(): boolean {
    return this.selectMode === 'single';
  }

  protected get isInRangeMode(): boolean {
    return this.selectMode === 'range' || this.selectMode === 'rangeFrom' || this.selectMode === 'rangeTo';
  }

  protected isActiveCell(rowIndex: number, colIndex: number): boolean {
    const cellNumber = rowIndex * this.numCols + colIndex;
    return cellNumber === this.activeCell;
  }

  /**
   * Check if the cell is selected
   */
  protected isSelected(value: number): boolean {
    if (!this.selectedValues || this.selectedValues.length === 0) {
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
   * Check if the cell within the currently selected range
   */
  protected isInRange(value: number): boolean {
    if (this.isInRangeMode) {
      const fromValue = this.selectedValues[0];
      const toValue = this.selectedValues[1];

      if (fromValue !== null && toValue !== null) {
        return value >= fromValue && value <= toValue;
      } else {
        return value === fromValue || value === toValue;
      }
    }
    return false;
  }

  /**
   * Check if the cell is the `rangeFrom` cell
   */
  protected isRangeFrom(value: number): boolean {
    if (this.isInRangeMode) {
      const fromValue = this.selectedValues[0];
      return fromValue !== null && value === fromValue;
    }
    return false;
  }

  /**
   * Check if the cell is the `rangeTo` cell
   */
  protected isRangeTo(value: number): boolean {
    if (this.isInRangeMode) {
      const toValue = this.selectedValues[1];
      return toValue !== null && value === toValue;
    }
    return false;
  }

  /**
   * Focus the active cell
   */
  public focusActiveCell(): void {
    this.#ngZone.runOutsideAngular(() => {
      this.#ngZone.onStable
        .asObservable()
        .pipe(take(1))
        .subscribe(() => {
          this.#elmRef.nativeElement.querySelector('.owl-dt-calendar-cell-active').focus();
        });
    });
  }
}
