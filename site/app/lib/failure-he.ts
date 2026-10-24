import { runFailure } from "../copy";

/** The plain-Hebrew reason for an engine failure (copy.ts `runFailure`); no engine message or bare rule code reaches the page. */
export function failureHe(message: string | undefined): string {
  const m = message ?? "";
  if (/employerMonthly [\d.]+ must be between 0 and goal\.monthly/.test(m)) return runFailure.employerAboveTotal;
  return runFailure.generic;
}

export const blockedHe = runFailure.blocked;
export const figureNotUpdatedHe = runFailure.figureNotUpdated;
