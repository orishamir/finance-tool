/**
 * The shekel's code, which records write either way ("ILS", or "NIS" as a fund record's `currency` does). It lives in the schema, the one
 * package the engine, the pipeline and the site all import.
 */
export const isShekel = (code: string): boolean => code === "ILS" || code === "NIS";

/** A currency's ISO 4217 code as a record writes it, the shekel always "ILS". */
export const isoCurrency = (code: string): string => (isShekel(code) ? "ILS" : code);
