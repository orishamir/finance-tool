// The sentences that carry figure slots ("{ID:figure}"): the questions' answers and the "הידעת?" facts.

/** A figure slot: "{ID:figure}", a rule's id and the name of one of its figures. */
const FIGURE_SLOT = /\{([A-Z0-9-]+):([a-z0-9_]+)\}/g;

/** The figure slots in a sentence, in order. */
export function figureSlots(text: string): { id: string; figure: string }[] {
  return [...text.matchAll(FIGURE_SLOT)].map((m) => ({ id: m[1] ?? "", figure: m[2] ?? "" }));
}

/** A sentence with each figure slot replaced by a space: the words typed by hand. */
export function withoutSlots(text: string): string {
  return text.replace(FIGURE_SLOT, " ");
}
