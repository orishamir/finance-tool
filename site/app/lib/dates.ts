// Calendar arithmetic on ISO dates (YYYY-MM-DD), each day read as midnight UTC so the device's time zone never shifts it. Pure.

const DAY_MS = 86_400_000;

/** Whole days from `from` to `to` (negative when `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to + "T00:00:00Z") - Date.parse(from + "T00:00:00Z")) / DAY_MS);
}

/** The date `months` calendar months before `iso`; a day the earlier month lacks runs into the next (31 March less one month is 3 March). */
export function monthsBefore(iso: string, months: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().slice(0, 10);
}
