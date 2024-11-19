/**
 * numberFixedLen.pipe
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'numberFixedLen'
})
export class NumberFixedLenPipe implements PipeTransform {
  public transform(num: number, len: number): string | number {
    const number = Math.floor(num);
    const length = Math.floor(len);

    if (num === null || isNaN(number) || isNaN(length)) {
      return num;
    }

    let numString = number.toString();

    while (numString.length < length) {
      numString = `0${numString}`;
    }

    return numString;
  }
}
