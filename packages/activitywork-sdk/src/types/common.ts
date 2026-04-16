/**
 * Discriminated union for ActivityWork JSON bodies that carry an `ok` flag.
 * Align with ActivityWork route handlers; extend fields when the contract evolves.
 */
export type ActivityWorkOk<T extends Record<string, unknown> = Record<string, never>> = {
  ok: true;
} & T;

export type ActivityWorkErr = {
  ok: false;
  error: string;
};

export type ActivityWorkResult<
  T extends Record<string, unknown> = Record<string, never>,
> = ActivityWorkOk<T> | ActivityWorkErr;

export function isActivityWorkOk<T extends Record<string, unknown>>(
  value: ActivityWorkResult<T>,
): value is ActivityWorkOk<T> {
  return value.ok === true;
}
