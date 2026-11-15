// The rule ids a page's content files name, so the page ships every rule its words and figures open.
import { join } from "node:path";
import type { RuleRecord } from "@finance-tool/schema";
import { root } from "./data.server";
import { readTextCached } from "./read-cache.server";

/**
 * The rule ids a content file names, and those named by the content files beside it that it imports (`from "./pension-parts"`),
 * followed in turn: a part shared by several guides (a sentence that marks its rules with `Ruled`) ships those rules on every
 * page that renders it, so its words never open an empty card.
 */
export function scanRuleIds(relPath: string, allRules: Record<string, RuleRecord>, seen = new Set<string>()): string[] {
  if (seen.has(relPath)) return [];
  seen.add(relPath);
  let src = "";
  try {
    src = readTextCached(join(root, relPath));
  } catch {
    return [];
  }
  const found = new Set<string>();
  for (const m of src.matchAll(/\b[A-Z0-9]{2,6}-[A-Z0-9]{1,5}\b/g)) if (allRules[m[0]]) found.add(m[0]);
  // "TXI OQ3" is written with a space in prose; the record id has a hyphen
  for (const m of src.matchAll(/\b([A-Z0-9]{2,6}) OQ(\d{1,3})\b/g)) if (allRules[`${m[1]}-OQ${m[2]}`]) found.add(`${m[1]}-OQ${m[2]}`);
  const dir = relPath.slice(0, relPath.lastIndexOf("/") + 1);
  for (const m of src.matchAll(/from\s+"\.\/([\w-]+)(?:\.tsx?)?"/g)) {
    // a missing file reads as no ids, so both spellings are tried
    for (const ext of [".tsx", ".ts"]) for (const id of scanRuleIds(`${dir}${m[1]}${ext}`, allRules, seen)) found.add(id);
  }
  return [...found];
}
