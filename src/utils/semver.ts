/**
 * Minimal semver utilities — no external dependency required.
 * Handles MAJOR.MINOR.PATCH strings only (no pre-release suffixes).
 */

/** Parse "1.2.3" → [1, 2, 3]. Non-numeric parts default to 0. */
function parse(version: string): [number, number, number] {
  const parts = version.split('.').map((p) => parseInt(p, 10) || 0);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

/**
 * Compare two semver strings.
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareSemver(a: string, b: string): -1 | 0 | 1 {
  const [aMaj, aMin, aPat] = parse(a);
  const [bMaj, bMin, bPat] = parse(b);

  if (aMaj !== bMaj) return aMaj < bMaj ? -1 : 1;
  if (aMin !== bMin) return aMin < bMin ? -1 : 1;
  if (aPat !== bPat) return aPat < bPat ? -1 : 1;
  return 0;
}

/** Returns true if `current` is older than `required`. */
export function isOlderThan(current: string, required: string): boolean {
  return compareSemver(current, required) === -1;
}
