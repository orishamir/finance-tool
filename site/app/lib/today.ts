// The calendar date on the person's own clock (B13, 2026-10-24). `toISOString().slice(0, 10)` is the UTC date, which is
// yesterday's for three hours after local midnight in Israel; every date the device stamps (the export file name, "created
// on", "saved on", the choice note, a holding's statement day) comes from here instead.
const two = (n: number) => String(n).padStart(2, "0");

/** `YYYY-MM-DD` on the local calendar for `now` (default: this moment). */
export function todayLocal(now: Date = new Date()): string {
  return `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`;
}
