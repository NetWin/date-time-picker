/**
 * Creates an array and fills it with values.
 */
export function range<T>(length: number, valueFunction: (index: number) => T): T[] {
  return Array.from({ length }, (_, i) => valueFunction(i));
}
