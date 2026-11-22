// The preload links of the data files a page fetches after it starts.

/** `<link rel=preload as=fetch>` for the static data files a page fetches after it starts: the
 * request goes out with the HTML instead of after the scripts have run. Used from a route's `links()`. */
export function bundleLinks(...files: ("deal-data.json" | "indices-bundle.json")[]) {
  return files.map((f) => ({ rel: "preload", as: "fetch", href: `${import.meta.env.BASE_URL}${f}`, crossOrigin: "anonymous" as const }));
}
