// What a label's sheet opens: its rules and its document. Kept apart from labels.ts, which builds labels from records and the engine,
// so that the kit's chip, shown on many pages, reads a label without carrying what builds one.
import type { Label } from "./labels";
import { sourceHref } from "./sources";

/** The rules a label's sheet opens: none for one resting on a fund's statement. */
export const labelRules = (l: Label): string[] => ("rules" in l.rests ? l.rests.rules : []);

/** The document a label's sheet links, with the words before it where they are not "מסמך הקרן": a statement's opens at its page. */
export function labelDoc(l: Label): { href: string; title: string; lead?: string } | undefined {
  const r = l.rests;
  if ("statement" in r) return { href: sourceHref({ url: r.statement.source.url, page: r.statement.page }), title: r.statement.source.title };
  return r.doc && { ...r.doc, ...(r.docLead ? { lead: r.docLead } : {}) };
}
