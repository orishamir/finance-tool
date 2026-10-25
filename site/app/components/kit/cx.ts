/** Joins class names, dropping falsy parts. Does not resolve conflicts: two classes for one property are decided by the stylesheet, so give a component a prop for each choice instead of overriding. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
