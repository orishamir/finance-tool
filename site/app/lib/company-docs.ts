// "מה כתוב אצל החברות" on the rules page: which company documents speak of what a claim is about. A company's
// document is never general (D30): each row names its company, leads to the page in the document, and the site does not sum it up.
import { documentTopicWords } from "./search-aliases";
import { isPdfUrl, sourceHref } from "./sources";

export type DocGroup = "bank" | "fund" | "other";
export const docGroups: DocGroup[] = ["bank", "fund", "other"];

export interface CompanyDoc {
  id: string;
  company: string;
  title: string;
  /** The edition as the document gives it (a date, a month), or null when it gives none. */
  version: string | null;
  url: string;
  group: DocGroup;
  topics: { topic: string; page: number }[];
}

/** Which of the three groups a publisher falls in: the banks by name, a fund's regulations, the rest (brokers, investment houses, fund managers). */
export function docGroup(publisher: string, docKind: string | undefined): DocGroup {
  if (publisher.startsWith("בנק") || publisher === "הבנק הבינלאומי" || publisher.includes("(בנק ")) return "bank";
  return docKind === "regulations" ? "fund" : "other";
}

const clean = (s: string) => s.replace(/[?!.,:;()]/g, " ");
const hasWord = (words: string[], word: string) => words.some((w) => w === word || (w.length === word.length + 1 && "הובלמכש".includes(w[0]!) && w.slice(1) === word));

/** The document topics a claim names. */
export function claimTopics(claim: string): string[] {
  const words = clean(claim).split(/\s+/).filter(Boolean);
  return documentTopicWords.filter((row) => row.all.every((any) => any.some((w) => hasWord(words, w)))).map((row) => row.topic);
}

/** The documents that hold one of the topics, each with its pages (ascending, once each). */
export function docsForTopics(docs: CompanyDoc[], topics: string[]): (CompanyDoc & { pages: number[] })[] {
  const set = new Set(topics);
  return docs
    .map((d) => ({ ...d, pages: [...new Set(d.topics.filter((t) => set.has(t.topic)).map((t) => t.page))].sort((a, b) => a - b) }))
    .filter((d) => d.pages.length > 0);
}

/** A link to the page inside the document: a PDF opens at the page (any `#` it had gives way), another document at its start. */
export const pageHref = (url: string, page: number) => sourceHref({ url: isPdfUrl(url) ? url.split("#")[0]! : url, page });

/** An edition for the table: "2026-03-15" as 15.03.2026, "2026-03" as 03.2026, anything else as it stands. */
export function editionText(version: string | null): string | null {
  if (!version) return null;
  const p = version.split("-");
  if (p.length === 3) return `${p[2]}.${p[1]}.${p[0]}`;
  if (p.length === 2 && /^\d{4}$/.test(p[0]!)) return `${p[1]}.${p[0]}`;
  return version;
}
