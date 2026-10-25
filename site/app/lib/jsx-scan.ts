// A small source scanner for the kit's guards (no parser dependency): finds JSX elements by tag name and reads their class names and their
// direct children. It handles `{...}` expressions, string and template literals, comments and nested elements of the same name.

export interface Element {
  tag: string;
  /** Index of "<" in the source. */
  start: number;
  /** The opening tag text, from "<" to ">". */
  open: string;
  /** Everything between the opening tag and its closing tag; "" for a self-closing element. */
  inner: string;
  line: number;
}

/** The index of the ">" that ends the opening tag starting at `i`, skipping `{...}` and quoted strings. */
function openTagEnd(s: string, i: number): number {
  let depth = 0;
  let q: string | null = null;
  for (let j = i; j < s.length; j++) {
    const c = s[j]!;
    if (q) {
      if (c === "\\") j++;
      else if (c === q) q = null;
    } else if (c === '"' || c === "'" || c === "`") q = c;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0 && s[j - 1] !== "=") return j;
  }
  return -1;
}

/** Every element with one of these tag names. Self-closing elements have an empty `inner`. */
export function findElements(src: string, tags: string[]): Element[] {
  const out: Element[] = [];
  const re = new RegExp(`<(${tags.join("|")})(?=[\\s>/])`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const end = openTagEnd(src, m.index);
    if (end < 0) continue;
    const open = src.slice(m.index, end + 1);
    const line = src.slice(0, m.index).split("\n").length;
    if (src[end - 1] === "/") {
      out.push({ tag: m[1]!, start: m.index, open, inner: "", line });
      continue;
    }
    // the matching close, counting nested elements of the same tag
    const tagRe = new RegExp(`<(/?)${m[1]}(?=[\\s>/])`, "g");
    tagRe.lastIndex = end + 1;
    let depth = 1;
    let t: RegExpExecArray | null;
    while ((t = tagRe.exec(src))) {
      const e = openTagEnd(src, t.index);
      if (t[1] === "/") depth--;
      else if (src[e - 1] !== "/") depth++;
      if (depth === 0) {
        out.push({ tag: m[1]!, start: m.index, open, inner: src.slice(end + 1, t.index), line });
        break;
      }
    }
  }
  return out;
}

/** The class tokens of an opening tag: every word inside the string literals of its className attribute. */
export function classTokens(open: string): string[] {
  const i = open.indexOf("className=");
  if (i < 0) return [];
  let j = i + "className=".length;
  let expr: string;
  if (open[j] === '"') expr = open.slice(j + 1, open.indexOf('"', j + 1));
  else {
    // {…}: take up to the matching brace
    let depth = 0;
    const k0 = j;
    for (; j < open.length; j++) {
      if (open[j] === "{") depth++;
      else if (open[j] === "}" && --depth === 0) break;
    }
    expr = open.slice(k0, j + 1);
    const lits = [...expr.matchAll(/"([^"]*)"|`([^`]*)`|'([^']*)'/g)].map((x) => x[1] ?? x[2] ?? x[3] ?? "");
    expr = lits.join(" ");
  }
  return expr.split(/\s+/).filter(Boolean);
}

/** True when a class token turns the element into a flex or grid container (`flex`, `inline-flex`, `grid`, `inline-grid`, with any variant prefix). */
export const isLayoutToken = (token: string): boolean => /^(?:[a-z0-9\-\[\]&>*_:]+:)?(?:inline-)?(?:flex|grid)$/.test(token);

/** True when an expression produces a `<Num>` at its own level (`{x && <Num/>}`, `{a ? <Num/> : <>…</>}`), not inside an element it builds (`{a ? <span><Num/></span> : null}`). */
function numAtTop(body: string): boolean {
  const stack: string[] = [];
  const re = /<(\/?)([A-Za-z][A-Za-z0-9.]*)?(?=[\s>/])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    const closing = m[1] === "/";
    const name = m[2];
    if (!name) continue; // a fragment: transparent
    const end = openTagEnd(body, m.index);
    if (end < 0) return false;
    if (closing) {
      stack.pop();
    } else {
      const selfClosing = body[end - 1] === "/";
      if (name === "Num" && stack.length === 0) return true;
      if (!selfClosing) stack.push(name);
    }
    re.lastIndex = end + 1;
  }
  return false;
}

export interface DirectChildren {
  /** `<Num>`s, directly or in an expression (`{x && <Num/>}`). */
  nums: number;
  /** Words of the element's own: JSX text, and expressions that are a name or a string (`{label}`, `{"x"}`), not an element. */
  text: number;
  /** Child elements and expressions that hold an element. */
  elements: number;
}

/** What sits directly inside an element: its `<Num>`s, its own words, and its child elements. */
export function directChildren(inner: string): DirectChildren {
  let nums = 0;
  let text = 0;
  let elements = 0;
  let i = 0;
  const n = inner.length;
  while (i < n) {
    const c = inner[i]!;
    if (c === "{") {
      // an expression: balance braces, skipping strings and nested JSX in it
      let depth = 0;
      let q: string | null = null;
      let j = i;
      for (; j < n; j++) {
        const d = inner[j]!;
        if (q) {
          if (d === "\\") j++;
          else if (d === q) q = null;
        } else if (d === '"' || d === "'" || d === "`") q = d;
        else if (d === "{") depth++;
        else if (d === "}" && --depth === 0) break;
      }
      const body = inner.slice(i, j + 1);
      if (/^\{\s*\/\*[\s\S]*\*\/\s*\}$/.test(body)) {
        /* a comment */
      } else if (numAtTop(body)) nums++;
      else if (body.includes("<")) elements++;
      else text++;
      i = j + 1;
    } else if (c === "<") {
      const m = /^<([A-Za-z][A-Za-z0-9.]*)/.exec(inner.slice(i));
      if (!m) {
        i++;
        continue;
      }
      const end = openTagEnd(inner, i);
      if (end < 0) break;
      let stop = end;
      if (inner[end - 1] !== "/") {
        const tagRe = new RegExp(`<(/?)${m[1]}(?=[\\s>/])`, "g");
        tagRe.lastIndex = end + 1;
        let depth = 1;
        let t: RegExpExecArray | null;
        while ((t = tagRe.exec(inner))) {
          const e = openTagEnd(inner, t.index);
          if (t[1] === "/") depth--;
          else if (inner[e - 1] !== "/") depth++;
          if (depth === 0) {
            stop = inner.indexOf(">", t.index);
            break;
          }
        }
      }
      if (m[1] === "Num") nums++;
      else elements++;
      i = stop + 1;
    } else if (/\s/.test(c)) i++;
    else {
      // text up to the next "<" or "{"
      let j = i;
      while (j < n && inner[j] !== "<" && inner[j] !== "{") j++;
      if (/[\p{L}\p{N}]/u.test(inner.slice(i, j))) text++;
      i = j;
    }
  }
  return { nums, text, elements };
}
