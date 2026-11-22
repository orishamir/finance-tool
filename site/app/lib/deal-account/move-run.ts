// The move of the typed accounts into deals (the move, method §10.4), run on the pages that load the price lists: the indices page and the fee page. It
// runs once and again adds nothing: each account's deal has an id from the account's, and a deal the store already holds is left as it
// is. An account leaves the saved state only once the device holds its deal, so a page closed midway loses nothing; an older export file
// imported with typed accounts in it puts them back in the saved state, and the next of these pages moves them the same way. An account
// that cannot become a deal stays in the saved state, and the indices page says which and why.
import { useEffect, useState } from "react";
import type { CustomBroker } from "../custom-entries";
import { DEALS_KEY, dealStore, parseDeals } from "../fee-deal/store";
import { readDeal, type FeeDeal } from "../fee-deal/model";
import type { FeesData } from "../fee-page-data";
import { fxRunInput } from "../fx";
import { loadIndicesBundle, type IndicesBundle } from "../providers";
import { dropTypedAccounts, isoToday, useInvestState } from "../state";
import { dealOfTypedAccount, MoveGap, movedDealId, withMoved, type MoveContext, type MoveGapWhy } from "./move";

/** The ids of the deals the device holds, read back from where the store wrote them. */
function storedDealIds(): Set<string> {
  try {
    const raw = window.localStorage.getItem(DEALS_KEY);
    return new Set(raw ? parseDeals(JSON.parse(raw)).map((d) => d.id) : []);
  } catch {
    return new Set();
  }
}

/** A typed account the move left in the saved state: its id, its name, and why (`MoveGapWhy`), for the indices page to say. */
export interface MoveLeft {
  id: string;
  name: string;
  why: MoveGapWhy;
}

/**
 * The deal of each typed account, or why it has none: a `MoveGap`, anything else thrown while it was made (`error`), or a deal the device
 * would not open again once written (`deal`: what `readDeal` reads back from its stored form), which is never written, so no copy of it
 * piles up among the stored entries the page cannot open.
 */
export function movedDeals(accounts: readonly CustomBroker[], ctx: MoveContext): { made: FeeDeal[]; left: MoveLeft[] } {
  const made: FeeDeal[] = [];
  const left: MoveLeft[] = [];
  for (const a of accounts) {
    const gap = (why: MoveGapWhy) => left.push({ id: a.id, name: a.name, why });
    let deal: FeeDeal;
    try {
      deal = dealOfTypedAccount(a, ctx);
    } catch (e) {
      gap(e instanceof MoveGap ? e.why : "error");
      continue;
    }
    if (readDeal(JSON.parse(JSON.stringify(deal)))) made.push(deal);
    else gap("deal");
  }
  return { made, left };
}

/**
 * Moves each typed account into its deal: adds the deals the store lacks, then takes out of the saved state each account whose deal the
 * device now holds. An account that has no deal (`movedDeals`) stays where it is, and is returned with why.
 */
export function moveTypedAccounts(accounts: readonly CustomBroker[], ctx: MoveContext): MoveLeft[] {
  const { made, left } = movedDeals(accounts, ctx);
  if (made.length === 0) return left;
  dealStore.update((ds) => withMoved(ds, made));
  const held = storedDealIds();
  const moved = accounts.filter((a) => held.has(movedDealId(a.id))).map((a) => a.id);
  if (moved.length) dropTypedAccounts(moved);
  return left;
}

/**
 * Runs the move on a page that has the price lists (`data`): the houses' records it reads (each one's line choice and the run's
 * rates) are `bundle`'s where the page has the indices bundle, else loaded once a typed account is waiting. Returns the
 * typed accounts the move left, with why, for the page to say (none until the move has run).
 */
export function useTypedAccountsMove(data: FeesData | null, bundle?: Pick<IndicesBundle, "snapshots" | "fx"> | null): MoveLeft[] {
  const invest = useInvestState();
  const deals = dealStore.use();
  const accounts = invest.customBrokers;
  const waiting = invest.ready && deals.ready && accounts.length > 0;
  const [loaded, setLoaded] = useState<Pick<IndicesBundle, "snapshots" | "fx"> | null>(null);
  const [left, setLeft] = useState<MoveLeft[]>([]);
  useEffect(() => {
    if (waiting && bundle === undefined && !loaded) void loadIndicesBundle().then(setLoaded, () => undefined);
  }, [waiting, bundle, loaded]);
  const records = bundle ?? loaded;
  useEffect(() => {
    if (!waiting) return setLeft((x) => (x.length ? [] : x));
    if (!data || !records || !deals.writable) return;
    const now = moveTypedAccounts(accounts, { houses: data.houses, kinds: data.kinds, snapshots: records.snapshots, fx: records.fx ? fxRunInput(records.fx) : {}, today: isoToday() });
    setLeft((x) => (JSON.stringify(x) === JSON.stringify(now) ? x : now));
  }, [waiting, data, records, accounts, deals.writable]);
  return left;
}
