// A company's name for a list or a heading. Pure: no React, no storage.

/** Without the legal suffix ("בע"מ"): every company in the lists carries it, so it tells none from another. The full name stays where the legal entity is the point (a brand's members). */
export const withoutLtd = (name: string): string => name.replace(/\s*בע["״]מ\.?(?=\s*(\([^)]*\))?\s*$)/, "").trim() || name;
