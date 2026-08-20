/**
 * Thrown for expected, user-facing failures (booking conflicts, cancellation
 * window, missing auth, wrong role, etc). Server Actions may surface
 * `.message` from this error directly to the client. Any other error (Prisma
 * errors, network errors, bugs) must NOT be shown to the user — log it
 * server-side and return a generic message instead.
 */
export class SafeActionError extends Error {}

/**
 * Use in a Server Action's catch block. Returns `.message` for a
 * SafeActionError (safe to show); for anything else, logs the real error
 * server-side and returns a generic fallback so internals never leak to the
 * client (Prisma errors, stack traces, etc).
 */
export function toActionErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof SafeActionError) return error.message;
  console.error(error);
  return fallback;
}
