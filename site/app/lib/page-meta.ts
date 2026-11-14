// What a page says about itself in its head: its title and description, and the Open Graph and Twitter tags a chat app reads to show
// a pasted link as a card (the page's name, one line on what it is, the site's picture). Every route's `meta` returns `pageMeta(...)`;
// site/scripts/link-preview-check.mjs checks the built pages carry it all.
import type { MetaDescriptor } from "react-router";
import { site } from "../copy";
import { gershayim } from "./format";

/** The site's public address, with its last slash: GitHub Pages serves the project site under the basename (docs/architecture.md section 6). */
export const SITE_URL = "https://orishamir.github.io/finance-tool/";

/**
 * The picture every page's card shows, in `site/public/`: the site's name and line in its dark look, made by
 * `tools/preview-picture.mjs` (a picture per page needs a renderer the build doesn't have yet).
 */
export const PREVIEW_PICTURE = { file: "preview.png", width: 1200, height: 630 } as const;

/** The text a card shows: one run of spaces for any run of white space, and an abbreviation's straight quote from the data as the gershayim. */
const oneLine = (s: string) => gershayim(s.replace(/\s+/g, " ").trim());

/**
 * The page's absolute address: the site's address and the path under the basename, with a last slash, as Pages serves a
 * pre-rendered page (`guide/x/index.html`; the address without the slash is sent there).
 */
export function pageUrl(pathname: string): string {
  const base = new URL(SITE_URL).pathname;
  const under = (pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\/+/, "")).replace(/\/+$/, "");
  return SITE_URL + (under ? `${encodeURI(decodedPath(under))}/` : "");
}

/** A path with its escapes decoded, as typed where an escape is broken (a stray "%"), which `decodeURI` throws on. */
function decodedPath(path: string): string {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

/** What `pageMeta` needs of a route's meta arguments. */
export interface MetaPlace {
  location: { pathname: string };
}

export interface PageMeta extends MetaPlace {
  /** The page's name as its heading says it, or with what places it ("<question> · חוקים וכללים"); null on the front page, whose name is the site's. */
  title: string | null;
  /** One sentence on what the page is. */
  description: string;
}

/** The head tags of a page: its title, its description, and the card a chat app shows for a link to it. */
export function pageMeta({ title, description, location }: PageMeta): MetaDescriptor[] {
  const name = title ? oneLine(title) : site.name;
  const line = oneLine(description);
  const url = pageUrl(location.pathname);
  const picture = SITE_URL + PREVIEW_PICTURE.file;
  const alt = `${site.name}: ${site.tagline}`;
  return [
    { title: title ? `${name} · ${site.name}` : site.name },
    { name: "description", content: line },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: site.name },
    { property: "og:locale", content: "he_IL" },
    { property: "og:title", content: name },
    { property: "og:description", content: line },
    { property: "og:url", content: url },
    { property: "og:image", content: picture },
    { property: "og:image:type", content: "image/png" },
    { property: "og:image:width", content: String(PREVIEW_PICTURE.width) },
    { property: "og:image:height", content: String(PREVIEW_PICTURE.height) },
    { property: "og:image:alt", content: alt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: name },
    { name: "twitter:description", content: line },
    { name: "twitter:image", content: picture },
    { name: "twitter:image:alt", content: alt },
  ];
}
