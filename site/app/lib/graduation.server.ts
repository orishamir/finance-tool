// How far each tier-2 instrument is from full coverage (release 5, flow 37, design-spec 25). Read at build from the
// "Graduation status" sections of the rule base's tier-2 files (.claude/skills/il-finance/references/) and from method
// G-24's open questions (the table in compare.server.ts); never typed by hand. The `data/instruments/tier2/` files the
// design spec proposes do not exist, so a closure is a struck-through item with "closed <date>" in a status section, and
// an instrument with none says so. A closure names the rules that answered it, never a question: an answered question is
// deleted from the rule base (founder, 2026-11-08). Server-only.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadNotCovered, loadRules, root, type NotCoveredRow } from "./data.server";
import { tier2Table } from "./compare.server";
import { parseMdLink } from "./md-link";
import { readTextCached } from "./read-cache.server";

export interface GraduationOpen {
  code: string;
  narrowedOn?: string;
  narrowedBy?: string;
  /** An institution's statement is the only answer: it computes labelled (D23) but never closes a tax question (D2). */
  institutionAnswer?: { ruleId: string };
}

/** A question of the status section that has its answer: the rules that answered it, and the date. The page names it in words from `closureTopics` (copy.ts), by its card and its rules joined with a space. */
export interface GraduationClosed {
  closedOn?: string;
  ruleIds: string[];
}

export interface GraduationStatusView {
  id: string;
  name: string;
  status: "blocked" | "remaining" | "graduated";
  open: GraduationOpen[];
  closed: GraduationClosed[];
  remaining?: ("record" | "formula")[];
  graduatedOn?: string;
  guideHref?: string;
}

const REFS = ".claude/skills/il-finance/references";

/** Per instrument: the il-finance file and the block of its status section (a bold lead-in). */
const sources: Record<string, { file: string; block: RegExp | null }> = {
  "savings-policies": { file: "savings-policies-and-executive-insurance.md", block: /^\*\*Savings policy\*\*/ },
  "executive-insurance": { file: "savings-policies-and-executive-insurance.md", block: /^\*\*Executive insurance\*\*/ },
  "structured-deposits": { file: "fx-and-structured-deposits.md", block: /^- \*\*Structured deposits\*\*/ },
  "foreign-currency-deposits": { file: "fx-and-structured-deposits.md", block: /^- \*\*FX deposits/ },
  "corporate-bonds": { file: "corporate-bonds.md", block: null },
  "managed-portfolios": { file: "managed-and-robo-portfolios.md", block: null },
  reits: { file: "reits-and-gold-funds.md", block: /^- \*\*Israeli REIT shares/ },
  "gold-via-funds": { file: "reits-and-gold-funds.md", block: /^- \*\*Israeli gold funds/ },
  // added 2026-10-26: without it the Amendment 190 closures (ruling 6849/15, TXA-30; circular 2/2013, TXA-19) never reached the page
  "amendment-190-deposits": { file: "tax-insurance-and-amendment-190.md", block: /^- \*\*Amendment 190 deposits/ },
};

/** Where an institution's statement is the only answer to a blocking question (r5-tier2.md, D23; a REIT's TX2-21 answers TX2 OQ7, which G-24 no longer lists as blocking, so it is not a blocker line): checked against the rule record at build.
 * Empty since 2026-10-25: TXA OQ1's base is now answered by the law (TXA-28, general; tax-bases research), and its remaining rate question has no insurer answer. */
const institutionAnswers: { instrument: string; code: string; ruleId: string }[] = [];

function statusSection(file: string): string[] {
  const path = join(root, REFS, file);
  if (!existsSync(path)) return [];
  const lines = readTextCached(path).split("\n");
  const start = lines.findIndex((l) => /^## Graduation status/.test(l));
  if (start < 0) return [];
  const end = lines.findIndex((l, i) => i > start && /^## /.test(l));
  return lines.slice(start + 1, end < 0 ? undefined : end);
}

/** The lines of one instrument's block: from its lead-in to the next lead-in of the same level (or the section's end). */
function blockLines(section: string[], lead: RegExp | null): string[] {
  if (!lead) return section;
  const start = section.findIndex((l) => lead.test(l));
  if (start < 0) return [];
  const bullet = section[start]!.startsWith("- ");
  const next = section.findIndex((l, i) => i > start && (bullet ? /^- \*\*/.test(l) : /^\*\*[^*]+\*\*\s*$/.test(l)));
  return section.slice(start, next < 0 ? undefined : next);
}

const ruleIdsIn = (text: string): string[] => [...new Set(text.match(/\b[A-Z]{2,4}\d?-\d{2}\b/g) ?? [])];

function closuresOf(lines: string[]): GraduationClosed[] {
  const out: GraduationClosed[] = [];
  for (const line of lines) {
    for (const m of line.matchAll(/~~([^~]+)~~([^\n]*)/g)) {
      const rest = m[2]!;
      const date = /[Cc]losed[^\d]{0,12}(\d{4}-\d{2}-\d{2})/.exec(rest)?.[1];
      if (!/closed/i.test(rest) && !date) continue;
      // the struck text itself is the rule base's English note, never shown (2026-10-26: "tax treatment in `tax-tier2-other.md`…"
      // reached the page); the closure is the rules that answered it
      out.push({ ...(date ? { closedOn: date } : {}), ruleIds: ruleIdsIn(rest) });
    }
  }
  return out;
}

/** "TXA open question 1 ... narrowed ... (TXA-28)": a blocking question the status text says was narrowed, with the date and the rule. */
function narrowing(code: string, lines: string[]): { on?: string; by?: string } {
  const [pre, oq] = code.split(" OQ");
  const re = new RegExp(`${pre} (?:open question|OQ) ?${oq}\\b`, "i");
  const text = lines.join("\n");
  for (const para of text.split(/\n(?=\s*[-*]|\*\d{4})/)) {
    if (!re.test(para) || !/narrowed/i.test(para)) continue;
    const date = /(\d{4}-\d{2}-\d{2})/.exec(para)?.[1];
    return { ...(date ? { on: date } : {}), by: ruleIdsIn(para).find((r) => /^TXA-28|^TX2-20|^[A-Z0-9]+-\d{2}$/.test(r)) };
  }
  return {};
}

let cache: GraduationStatusView[] | null = null;

export function graduationStatuses(): GraduationStatusView[] {
  if (cache) return cache;
  const rules = loadRules();
  const out = tier2Table.map((t): GraduationStatusView => {
    const src = sources[t.id];
    const lines = src ? blockLines(statusSection(src.file), src.block) : [];
    const closed = src ? closuresOf(lines) : [];
    const open: GraduationOpen[] = t.questions.map((q) => {
      const n = narrowing(q, lines);
      const inst = institutionAnswers.find((a) => a.instrument === t.id && a.code === q);
      const ok = inst && rules[inst.ruleId]?.strength === "institution";
      return { code: q, ...(n.on ? { narrowedOn: n.on } : {}), ...(n.by ? { narrowedBy: n.by } : {}), ...(ok ? { institutionAnswer: { ruleId: inst!.ruleId } } : {}) };
    });
    return { id: t.id, name: t.he, status: open.length > 0 ? "blocked" : "remaining", open, closed, ...(open.length === 0 ? { remaining: ["record" as const] } : {}) };
  });
  return (cache = out);
}

/** Every rule id the status cards cite, so the page can open their rule cards. */
export function graduationRuleIds(list: GraduationStatusView[]): string[] {
  return [...new Set(list.flatMap((s) => [...s.closed.flatMap((c) => c.ruleIds), ...s.open.flatMap((o) => [o.narrowedBy, o.institutionAnswer?.ruleId].filter((x): x is string => !!x))]))];
}

/**
 * The cards of the "not covered yet" page: one per tier-2 kind of holding (product D2, `tier2Table`), each with its
 * glossary row from docs/glossary.md section 3 joined by name. The list comes from what the site lacks, never from the
 * glossary section: its other rows (fees, roles, labels, events of those holdings) stay terms, and a term the site
 * explains on a covered page never lands here (founder, 2026-11-07: "we dont know עמלת חליפין?"). Throws when a kind has
 * no row, so a renamed row fails the build instead of dropping a card.
 */
export function notCoveredCards(list: GraduationStatusView[] = graduationStatuses()): { status: GraduationStatusView; row: NotCoveredRow }[] {
  const rows = new Map(loadNotCovered().map((r) => [r.he, r]));
  const whole = notCoveredSources();
  return list.map((status) => {
    const row = rows.get(status.name);
    if (!row) throw new Error(`not-covered: docs/glossary.md section 3 has no row "${status.name}" for tier-2 kind ${status.id}`);
    // the glossary parser cuts a url at the first ")": take the whole address from the balanced reader
    const w = whole.get(row.he);
    return { status, row: row.source && w ? { ...row, source: { ...row.source, title: w.title, url: w.url } } : row };
  });
}

/**
 * The source link of each row of docs/glossary.md section 3, by the row's Hebrew name, read with balanced
 * parentheses (audit A28). `loadNotCovered` (data.server.ts) still cuts a url at its first ")"; the page prefers this.
 */
export function notCoveredSources(): Map<string, { title: string; url: string }> {
  const doc = readTextCached(join(root, "docs/glossary.md"));
  const section = doc.slice(doc.indexOf("## 3. Not covered yet"), doc.indexOf("## 4. Missing from the rule base"));
  const out = new Map<string, { title: string; url: string }>();
  for (const m of section.matchAll(/^\| \*\*(.+?)\*\* \| (.*?) \| (.*?) \| (.*) \|$/gm)) {
    const link = parseMdLink(m[4]!);
    if (link) out.set(m[1]!, { title: link.text, url: link.url });
  }
  return out;
}
