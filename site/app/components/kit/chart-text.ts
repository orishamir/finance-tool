// How wide a chart's words and figures are, so a chart places them by their size instead of a guess (charts.md: "measure it; never cut a label off").
// The advances are the chart font's own (Inter with tabular figures, then Heebo for Hebrew), measured in the
// browser with getComputedTextLength at weights 400 and 600, the wider of the two kept. Computed, not read from the page, so the server's
// render and the first one in the browser agree and nothing jumps when the font arrives.

/** The site's smallest text, and so every chart's (text-xs). */
export const CHART_TEXT_PX = 13;

/** Advance widths in em. Every figure, plus and minus sign is one width (tabular figures). */
const EM: Record<string, number> = { ".": 0.269, ",": 0.269, "%": 1.004, "₪": 0.901, K: 0.703, M: 0.922, " ": 0.277 };
const FIGURE = 0.648;
const HEBREW = 0.556;
/** A character outside the table: wider than any letter measured, so a label never comes out longer than its room. */
const OTHER = 0.7;

const em = (ch: string) => EM[ch] ?? (/[0-9+\-−]/.test(ch) ? FIGURE : /[֐-׿]/.test(ch) ? HEBREW : /[⁦-⁩‎‏]/.test(ch) ? 0 : OTHER);

/** The width in px of `text` written at `px` px in the chart font. */
export function chartTextWidth(text: string, px = CHART_TEXT_PX): number {
  let w = 0;
  for (const ch of text) w += em(ch);
  return w * px;
}
