/**
 * object.utils
 */

/**
 * Extends an object with the *enumerable* and *own* properties of one or more source objects,
 * similar to Object.assign.
 *
 * @param dest The object which will have properties copied to it.
 * @param sources The source objects from which properties will be copied.
 */
export function extendObject<T extends object>(dest: T, ...sources: Array<object>): T {
  if (dest == null) {
    throw TypeError('Cannot convert undefined or null to object');
  }

  for (const source of sources) {
    if (source != null) {
      for (const key in source) {
        if (Object.hasOwn(source, key)) {
          dest[key] = source[key];
        }
      }
    }
  }

  return dest;
}
