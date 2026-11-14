// Which fee bases the guide's fee table shows a row for, and of what kind. Pure; no Hebrew.

/** A fee row's kind: a fee base the product's record allows, or one it bars, a base it does not allow with a cap of 0 (data-schema 3.3). */
export type FeeRowKind = "allowed" | "barred";

/** The facts of a product record the choice reads: the bases it allows and its caps. */
export interface FeeFacts {
  fee_bases_allowed: readonly string[];
  fee_caps: Readonly<Record<string, { value: unknown } | undefined>>;
}

/** The kind of row the guide shows for a fee base, or none: an allowed base, or a base the record does not allow but caps at 0. */
export function feeRowKind(record: FeeFacts, base: string): FeeRowKind | null {
  if (record.fee_bases_allowed.includes(base)) return "allowed";
  return record.fee_caps[base]?.value === 0 ? "barred" : null;
}
