import { checkGroupWords } from "/home/ori/dev/finance-tool/.claude/worktrees/idx-data/packages/pipeline/src/validate.ts";
const price = (value?: object) => ({ fee: "trade_israel", price_he: "פטור", holdings_he: "מניות", names_fund: false, ...(value ? { value } : {}) });
const entry = (cheaper: string, value?: object) => ({ kind: "young", name_he: cheaper, who_he: "מגיל 14", who_short_he: "מגיל 14", ends_he: "לא כתוב", ends_short_he: "לא כתוב", ends_printed: false, cheaper_he: cheaper, prices: [price(value)] });
const snap = (a: object, b: object) => ({ id: "x", snapshot: "2026-11-07", provider: { class: "bank" }, lines: [], groups: { state: "prices", entries: [a, b] } }) as never;
console.log("binding + advert, SAME words:", JSON.stringify(checkGroupWords(snap(entry("פטור מעמלת קנייה", { exempt: true }), entry("פטור מעמלת קנייה")))));
console.log("advert + advert, same prices, other words:", JSON.stringify(checkGroupWords(snap(entry("פטור מעמלת קנייה"), entry("הצעה: פטור")))));
