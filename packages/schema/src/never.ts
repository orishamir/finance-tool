/**
 * The end of a `switch` over a union's kind (guidelines/code.md, "Types"): `default: return assertNever(x)` compiles only while every
 * member has its own case, so a new kind fails to compile wherever it isn't handled. It lives in the schema, the one package both the
 * engine and the site import. A value outside the union, which only an unchecked cast lets through, throws with the value named.
 */
export function assertNever(x: never): never {
  throw new Error(`a case no branch handles: ${JSON.stringify(x)}`);
}
