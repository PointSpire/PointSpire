/**
 * Compares two arrays to see if they are shallow equal by running `a === b` on
 * each value in order.
 *
 * This doesn't need to be the default export. It just is because there aren't
 * any other functions in this file yet.
 *
 * @param {Array<unknown>} a the first array
 * @param {Array<unknown>} b the second array
 */
export default function arraysAreShallowEqual(
  a: Array<unknown>,
  b: Array<unknown>
): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
