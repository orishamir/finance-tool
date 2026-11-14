// Things that move on the page move there, rather than jump (design-system 2.6, motion): a change that rearranges what stands (a column
// moved, a row taken away, a case carried over a place) measures every movable thing before and after it, and each one that moved slides
// from where it was to where it now stands, at the base duration. A thing that moves with the one around it slides with it, not twice.
// A thing that was not there before fades in. The durations are the site's motion tokens, which a device that asks for less motion sets
// to nothing (theme.css): nothing then slides.

/** What moves: everything that lifts, and whatever else is marked to slide (`data-flip`). */
const MOVABLE = "[data-liftable], [data-flip]";

/** A motion token's length in ms (`--duration-base`), read off the page: 0 where the device asks for less motion. */
export function motionMs(token = "--duration-base"): number {
  if (typeof window === "undefined") return 0;
  const v = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  const n = parseFloat(v);
  return Number.isFinite(n) ? (v.endsWith("ms") ? n : v.endsWith("s") ? n * 1000 : n) : 0;
}

/** The site's standard easing (`--ease-standard`). */
export function easing(): string {
  if (typeof window === "undefined") return "ease";
  return getComputedStyle(document.documentElement).getPropertyValue("--ease-standard").trim() || "ease";
}

/** Where every movable thing stands now, on the screen. */
export function measure(scope: ParentNode = document): Map<HTMLElement, DOMRect> {
  return new Map([...scope.querySelectorAll<HTMLElement>(MOVABLE)].map((el) => [el, el.getBoundingClientRect()]));
}

/**
 * Slides every movable thing from where it stood in `before` (`measure`) to where it stands now. A thing inside another that moved slides
 * by its own move alone, the other carrying it. A thing not in `before` fades in, where `fadeIn` asks it.
 */
export function play(before: ReadonlyMap<HTMLElement, DOMRect>, { scope = document as ParentNode, fadeIn = false, ms = motionMs() } = {}): void {
  if (ms <= 0) return;
  const ease = easing();
  const now = [...scope.querySelectorAll<HTMLElement>(MOVABLE)];
  const moved = new Map<HTMLElement, { dx: number; dy: number }>();
  for (const el of now) {
    const was = before.get(el);
    if (!was) continue;
    const r = el.getBoundingClientRect();
    moved.set(el, { dx: was.left - r.left, dy: was.top - r.top });
  }
  for (const el of now) {
    const d = moved.get(el);
    if (!d) {
      if (fadeIn && !before.has(el)) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: ms, easing: ease });
      continue;
    }
    // the nearest movable thing around it carries it as far as that one moved
    let up = el.parentElement?.closest<HTMLElement>(MOVABLE) ?? null;
    while (up && !moved.has(up)) up = up.parentElement?.closest<HTMLElement>(MOVABLE) ?? null;
    const by = up ? moved.get(up)! : { dx: 0, dy: 0 };
    const dx = d.dx - by.dx, dy = d.dy - by.dy;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: ms, easing: ease });
  }
}

/** Makes a change (which must draw at once: a `flushSync` inside it) and slides what it moved (`measure`, `play`). */
export function flip(change: () => void, opts: { scope?: ParentNode; fadeIn?: boolean } = {}): void {
  const before = measure(opts.scope);
  change();
  play(before, opts);
}

/**
 * Reads the page as it stands once every slide running now has ended (each animation put at its end for the read, then back where it
 * was), so a box measured mid-slide is where its thing is going, not where it passes.
 */
export function atRest<T>(read: () => T): T {
  if (typeof document === "undefined" || !document.getAnimations) return read();
  const running = document.getAnimations().filter((a) => a.playState === "running");
  const was = running.map((a) => a.currentTime);
  for (const a of running) {
    const end = a.effect?.getComputedTiming().endTime;
    if (typeof end === "number") a.currentTime = end;
  }
  try {
    return read();
  } finally {
    running.forEach((a, i) => (a.currentTime = was[i]!));
  }
}
