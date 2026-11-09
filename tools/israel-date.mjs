// The calendar date in Israel, `YYYY-MM-DD`, whatever the machine's clock zone: `toISOString().slice(0, 10)` is the UTC date, a day behind
// Israel's for two or three hours after midnight, and GitHub's runners keep UTC. Every date a tool stamps (a library entry's `retrieved`
// and `checked`, a fragment's `seen`) comes from here. The same function for TypeScript is `israelToday` in packages/schema/src/value.ts.
export function israelToday(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
