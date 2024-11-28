/**
 *  Creates an array and fills it with values.
 */
export function range<T>(length: number, valueFunction: (index: number) => T): Array<T> {
  return new Array<T>(length).fill(null).map((_, index) => valueFunction(index));
}
