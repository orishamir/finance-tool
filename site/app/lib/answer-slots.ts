// The answer of a question on /questions (data/parameters/pinned-rules.json, `answer_he`) is a sentence with slots "{ID:figure}":
// the page renders each slot as the figure of that rule, with its unit. Pure, so the split is tested.
export type AnswerPart = { kind: "text"; text: string } | { kind: "slot"; id: string; figure: string };

const slot = /\{([A-Za-z0-9-]+):([A-Za-z0-9_]+)\}/g;

export function parseAnswer(text: string): AnswerPart[] {
  const parts: AnswerPart[] = [];
  let last = 0;
  for (const m of text.matchAll(slot)) {
    if (m.index > last) parts.push({ kind: "text", text: text.slice(last, m.index) });
    parts.push({ kind: "slot", id: m[1]!, figure: m[2]! });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ kind: "text", text: text.slice(last) });
  return parts;
}
