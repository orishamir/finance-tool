// The look a part takes as a landing copy (design-system 11, `PartEdit`'s and `ChangeDivider`'s `landing`): while a toolbox card is held,
// or carried over a place that takes it, the page draws the part where a tap or a drop would put it, as it would then stand, so the
// person sees what lands where before it does. Truly faint, never as if added: no fill, no kind's colour, no ✓, no bin, no grip. A 1 px
// dashed outline in the controls' edge colour over the whole part, and its contents (its lead, its empty box, its words) at 40%; under a
// computer's pointer, on the keyboard's focus and while a carried card is over its place, the outline turns solid in the action colour and
// the contents rise to 70%, still dashed and empty. The contents are inert (no box takes the focus or a tap); the outline is the one button
// over them all, named by what it adds where ("להוסיף ״מינימום״ למחיר מינואר 2027"), and marked `data-add-here`, so a page that lets a
// held card go on a tap elsewhere knows the tap was on a place. A carried card's copy is the same outline drawn only, hidden from a screen
// reader (the place itself takes the drop). The bin and the grip keep their room, unseen, so the copy takes exactly the room of the part a
// tap puts there.
import { cx } from "./cx";

/**
 * A part drawn as its landing copy: with `onAdd`, the button that adds it there, named by `label`; without, the mark a carried card shows,
 * solid while it is over the place (`over`).
 */
export interface Landing {
  label?: string;
  onAdd?: () => void;
  over?: boolean;
}

const OUTLINE = "inset-0 z-[1] rounded-md outline-1 -outline-offset-1 transition-[outline-color] duration-[var(--duration-fast)]";
/**
 * Over the whole copy, set on the element itself: a card whose face is one button lifts every button inside it into its own layer
 * (choice.tsx `LIFT_INNER`, a case's row), and a class would lose to that.
 */
const OVER = { position: "absolute" } as const;
const QUIET = "outline-dashed outline-input";
const RAISED = "outline-solid outline-primary";

/** The outline over a landing copy: the button that adds it, or a carried card's mark. Drawn first, so the contents after it rise with it (`peer`). */
export function LandingCover({ landing }: { landing: Landing }) {
  if (!landing.onAdd) return <span aria-hidden style={OVER} className={cx(OUTLINE, landing.over ? RAISED : QUIET)} />;
  return (
    <button
      type="button"
      data-add-here=""
      aria-label={landing.label}
      title={landing.label}
      onClick={landing.onAdd}
      style={OVER}
      className={cx(OUTLINE, QUIET, "peer cursor-pointer hover:outline-solid hover:outline-primary focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-primary")}
    />
  );
}

/**
 * A landing copy's contents, faint and out of reach: 40%, 70% while the cover is under the pointer, focused or carried over; each box and
 * choice in them drawn without its fill, a choice's edge dashed (a box's is dashed already while empty).
 */
export const landingBody = (landing: Landing): string =>
  cx(
    "transition-opacity duration-[var(--duration-fast)] [&_[data-box]]:bg-transparent [&_button]:bg-transparent [&_button]:outline-1 [&_button]:outline-dashed [&_button]:-outline-offset-1 [&_button]:outline-input",
    landing.over ? "opacity-70" : "opacity-40 peer-hover:opacity-70 peer-focus-visible:opacity-70",
  );
