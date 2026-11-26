// For the tests only (working.test.ts): works out a line of TeX made of numbers, the four operations, \frac, powers, brackets, \min,
// \max and TeX's percent sign, so a test can hold a figure's line with its values put in to the figure its sheet heads with. Throws on
// anything else: a line it cannot read is a line the test names.

type Token = { kind: "num"; value: number } | { kind: "op"; value: string } | { kind: "cmd"; value: "frac" | "min" | "max" };

function tokens(tex: string): Token[] {
  const s = tex.replace(/\{,\}/g, "").replace(/\\left|\\right/g, "");
  const out: Token[] = [];
  for (let i = 0; i < s.length; ) {
    const c = s.charAt(i);
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    const num = /^\d+(\.\d+)?|^\.\d+/.exec(s.slice(i));
    if (num) {
      out.push({ kind: "num", value: Number(num[0]) });
      i += num[0].length;
      continue;
    }
    if (c === "\\") {
      const name = /^\\([A-Za-z]+|.)/.exec(s.slice(i))?.[1] ?? "";
      i += 1 + name.length;
      if (name === "times" || name === "cdot") out.push({ kind: "op", value: "*" });
      else if (name === "div") out.push({ kind: "op", value: "/" });
      else if (name === "%") out.push({ kind: "op", value: "%" });
      else if (name === "frac" || name === "min" || name === "max") out.push({ kind: "cmd", value: name });
      else throw new Error(`tex-eval: the command \\${name} is not one it reads`);
      continue;
    }
    if ("+-*/^()[]{},".includes(c)) {
      out.push({ kind: "op", value: c });
      i++;
      continue;
    }
    throw new Error(`tex-eval: "${c}" is not a number or an operator (${tex})`);
  }
  return out;
}

const CLOSE: Record<string, string> = { "(": ")", "[": "]", "{": "}" };

/** The value of a line of TeX's right side (after its `=`, the whole line where it has none). */
export function evalTex(line: string): number {
  const at = line.indexOf("=");
  const ts = tokens(at < 0 ? line : line.slice(at + 1));
  let i = 0;
  const peek = () => ts[i];
  const isOp = (v: string) => {
    const t = peek();
    return t?.kind === "op" && t.value === v;
  };
  /** The operator at the place, taken. */
  const op = (): string => String(ts[i++]?.value);
  const take = (v: string) => {
    if (!isOp(v)) throw new Error(`tex-eval: expected "${v}" at token ${i} of ${line}`);
    i++;
  };
  const expr = (): number => {
    let v = term();
    while (isOp("+") || isOp("-")) v = op() === "+" ? v + term() : v - term();
    return v;
  };
  const term = (): number => {
    let v = unary();
    while (isOp("*") || isOp("/")) v = op() === "*" ? v * unary() : v / unary();
    return v;
  };
  const unary = (): number => (isOp("-") ? (i++, -unary()) : isOp("+") ? (i++, unary()) : power());
  const power = (): number => {
    const base = postfix();
    if (!isOp("^")) return base;
    i++;
    return base ** (isOp("-") ? (i++, -postfix()) : postfix());
  };
  const postfix = (): number => {
    let v = primary();
    while (isOp("%")) {
      i++;
      v /= 100;
    }
    return v;
  };
  const group = (): number => {
    const t = peek();
    const close = t?.kind === "op" ? CLOSE[t.value] : undefined;
    if (!close) throw new Error(`tex-eval: expected a bracket at token ${i} of ${line}`);
    i++;
    const v = expr();
    take(close);
    return v;
  };
  const primary = (): number => {
    const t = peek();
    if (!t) throw new Error(`tex-eval: the line ends early: ${line}`);
    if (t.kind === "num") {
      i++;
      return t.value;
    }
    if (t.kind === "cmd") {
      i++;
      if (t.value === "frac") return group() / group();
      const open = peek();
      const close = open?.kind === "op" ? CLOSE[open.value] : undefined;
      if (!close) throw new Error(`tex-eval: \\${t.value} without its brackets`);
      i++;
      const args = [expr()];
      while (isOp(",")) {
        i++;
        args.push(expr());
      }
      take(close);
      return t.value === "min" ? Math.min(...args) : Math.max(...args);
    }
    return group();
  };
  const v = expr();
  if (i !== ts.length) throw new Error(`tex-eval: left over after token ${i}: ${line}`);
  return v;
}
