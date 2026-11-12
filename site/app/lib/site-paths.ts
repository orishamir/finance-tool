// The site's own addresses, each kind built here and nowhere else, so an address changes in one place. It imports nothing, so any file,
// server or browser, can use it; the pre-rendered list (paths.server.ts) is built from the same functions, so a link and the page it
// opens always agree.
//
// A path segment is an id as the data holds it, written as it is: the data's ids are lowercase ASCII, digits and hyphens (the schemas'
// id patterns) or the regulator's company and fund numbers, which encoding leaves as they are. A query value goes through
// encodeURIComponent. A hash is written as given (without its `#`): a caller whose hash may hold any character encodes it first.

/** What follows a path: the query string as given (with its `?`, or empty) and the hash. */
const tail = (search: string, hash: string | undefined): string => `${search}${hash ? `#${hash}` : ""}`;

/** A guide page, `/guide/<id>`: a product's id, or a guide of its own (`limited-bond-fund`, `mutual-funds`). */
export const guidePath = (id: string, { hash }: { hash?: string } = {}): string => `/guide/${id}${tail("", hash)}`;

/** An exposure's own page, `/exposure/<id>` (an exposure folded into a security's guide has none: `exposureHref` picks). */
export const exposurePath = (id: string): string => `/exposure/${id}`;

/** A company's page, `/companies/<id>`, opened at one of its products (`?product=`) and at an element on it. */
export const companyPath = (id: string, { product, hash }: { product?: string; hash?: string } = {}): string =>
  `/companies/${id}${tail(product ? `?product=${encodeURIComponent(product)}` : "", hash)}`;

/** A track's page, `/companies/<company>/<fund>`: the managing company's number and the track's fund number. */
export const trackPath = (companyId: string, fundId: string | number): string => `${companyPath(companyId)}/${fundId}`;

/** The track browser on one product, `/tracks/<product>`, with the query the page keeps (with its `?`, or empty). */
export const trackBrowserPath = (productId: string, { search = "" }: { search?: string } = {}): string => `/tracks/${productId}${search}`;

/**
 * The rules page, `/rules`: filtered to one product (`?product=`), or with a query string already written by the rules page's own
 * filters (with its `?`, or empty), and at one record (`#<rule id>`).
 */
export const rulesPath = ({ product, search, hash }: { product?: string; search?: string; hash?: string } = {}): string =>
  `/rules${tail(product ? `?product=${encodeURIComponent(product)}` : (search ?? ""), hash)}`;

/** The documents page, `/documents`, at one card or group (`#<key>`). */
export const documentsPath = ({ hash }: { hash?: string } = {}): string => `/documents${tail("", hash)}`;

/** The fee page of one product (`?wrapper=`), of one track (`?track=`, its fund number), or of one whole deal (`?d=`, lib/fee-deal/link.ts). */
export const feesPath = (of: { wrapper: string } | { track: string | number } | { deal: string }): string =>
  "wrapper" in of ? `/fees?wrapper=${encodeURIComponent(of.wrapper)}` : "track" in of ? `/fees?track=${encodeURIComponent(String(of.track))}` : `/fees?d=${encodeURIComponent(of.deal)}`;

/**
 * An address of the site written whole, for a person to copy and open elsewhere (a link to a deal): `origin` and `base` are where the site
 * is served (the page's origin and the basename, with its last slash), `path` one of the paths above.
 */
export const siteAddress = (origin: string, base: string, path: string): string => `${origin}${base.replace(/\/+$/, "")}${path}`;

// ---------------------------------------------------------------- the index page

/** The index page (/indices, with no redirect from /invest): `/indices/<x>` for the exposure `index-<x>`, a custom index at `/indices?custom=<id>`. */
export const INDICES_PATH = "/indices";
export const indexPath = (exposureId: string): string => `${INDICES_PATH}/${exposureId.replace(/^index-/, "")}`;
export const customIndexPath = (id: string): string => `${INDICES_PATH}?custom=${encodeURIComponent(id)}`;
export const exposureIdOfSlug = (slug: string): string => `index-${slug}`;
/** The index page with one house picked, for a house's own page. */
export const housePath = (houseId: string, exposureId = "index-sp500"): string => `${indexPath(exposureId)}?house=${encodeURIComponent(houseId)}`;
/** A house's group on the index page, picked (`?group=<n>`, D43 amended (5)): the link under a group on the house's own page. */
export const groupPath = (houseId: string, key: string, exposureId = "index-sp500"): string => `${housePath(houseId, exposureId)}&group=${encodeURIComponent(key.replace("group:", ""))}`;
/** A house's page opens the index page with the account panel started from its price list (`list`) or one of its groups (`group:<n>`). */
export const ownAccountPath = (houseId: string, key = "list", exposureId = "index-sp500"): string => `${indexPath(exposureId)}?house=${encodeURIComponent(houseId)}&own=${encodeURIComponent(houseId)}&from=${encodeURIComponent(key)}`;
/** A house's own page, opened at its securities account: who its price is for, its fees and where they stand, its offers (D57 amended). */
export const brokeragePagePath = (houseId: string): string => companyPath(houseId, { product: "brokerage" });
