/**
 * Express 5 + @types/express-serve-static-core 5.1.x types req.params values
 * as `string | string[]`. This normalizes and validates a route param as a
 * positive integer id, throwing a 400-friendly error if invalid.
 */
export function parseIdParam(raw: string | string[] | undefined, paramName = "id"): number {
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (!value || !/^\d+$/.test(value)) {
    const err = new Error(`Invalid ${paramName} parameter`) as Error & { status?: number };
    err.status = 400;
    throw err;
  }

  return Number(value);
}