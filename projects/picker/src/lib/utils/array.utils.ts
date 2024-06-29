/**
 * Creates an array and fills it with values.
 */
export function range<T>(length: number, valueFunction: (index: number) => T): Array<T> {
  return Array.from({ length }, (_, i) => valueFunction(i));
}
