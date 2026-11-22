// The index the indices page last showed on this device: the fee page's link from a securities-account deal opens it, with the deal as the
// pair's account (decision 10 of the deal-on-indices design), else the S&P 500. Kept on the device only; no export carries it.
import { deviceStore } from "../device-store";
import { housePath } from "../site-paths";
import { dealProviderId } from "./bundle";

const LAST_INDEX_KEY = "mekor.v2.last-index";
const EXPOSURE = /^index-[a-z0-9-]{1,60}$/;

/** The exposure id of the index last shown (`index-<x>`), or null. */
export const lastIndexStore = deviceStore<string | null>(LAST_INDEX_KEY, null, (raw) => (typeof raw === "string" && EXPOSURE.test(raw) ? raw : null), (v) => v);

/** The default index where the device has shown none. */
export const FIRST_INDEX = "index-sp500";

/** The indices page on the index last shown, with deal `dealId` as the pair's account. */
export const dealOnIndexPath = (dealId: string, last: string | null): string => housePath(dealProviderId(dealId), last ?? FIRST_INDEX);
