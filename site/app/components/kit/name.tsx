// A product's or company's name inside a Hebrew line. A name with Hebrew in it is laid out right to left whatever letter it starts with:
// a plain <bdi> takes its direction from the first letter, so "MTF סל (4D) S&P 500" was laid out left to right and read
// "S&P 500 (4D) סל MTF" from the right (2026-11-05). A name with no Hebrew keeps its own direction.
const HEBREW = /[֐-׿]/;

/** `children` is the name; `show` replaces what is drawn (the name with an icon held to it) while the name sets the direction. */
export function MixedName({ children, show, className }: { children: string; show?: React.ReactNode; className?: string }) {
  return (
    <bdi dir={HEBREW.test(children) ? "rtl" : undefined} className={className}>
      {show ?? children}
    </bdi>
  );
}
