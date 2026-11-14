// Reading the address's fragment safely. A fragment is text anyone can type or paste ("#%", "#%E0"): `decodeURIComponent` throws on a
// "%" that starts no escape, and a throw while a page renders brings down the whole site. Every page reads the fragment through these.

/** A part of an address with its escapes decoded; null where an escape is broken (a stray "%", bytes that are not UTF-8). */
export function decodedPart(text: string): string | null {
  try {
    return decodeURIComponent(text);
  } catch {
    return null;
  }
}

/**
 * The element id a fragment names (`#KH-09`, `#%D7%A9` → its Hebrew): the fragment without its "#", decoded; "" where it has none or its
 * escapes are broken, so nothing on the page is named.
 */
export const hashId = (hash: string): string => decodedPart(hash.replace(/^#/, "")) ?? "";
