// The move of the typed accounts into deals (the move, method §10.4), run on the pages that load the price lists: the indices page and the fee page. It
// runs once and again adds nothing: each account's deal has an id from the account's, and a deal the store already holds is left as it
// is. An account leaves the saved state only once the device holds its deal, so a page closed midway loses nothing; an older export file
// imported with typed accounts in it puts them back in the saved state, and the next of these pages moves them the same way.
import { useEffect, useState } from "react";
import type { CustomBroker } from "../custom-entries";
import { DEALS_KEY, dealStore, parseDeals } from "../fee-deal/store";
import type { FeesData } from "../fee-page-data";
import { fxRunInput } from "../fx";
import { loadIndicesBundle, type IndicesBundle } from "../providers";
import { dropTypedAccounts, isoToday, useInvestState } from "../state";
import { dealOfTypedAccount, MoveGap, movedDealId, withMoved, type MoveContext } from "./move";

/** The ids of the deals the device holds, read back from where the store wrote them. */
function storedDealIds(): Set<string> {
  try {
    const raw = window.localStorage.getItem(DEALS_KEY);
    return new Set(raw ? parseDeals(JSON.parse(raw)).map((d) => d.id) : []);
  } catch {
    return new Set();
  }
}

/**
 * Moves each typed account into its deal: adds the deals the store lacks, then takes out of the saved state each account whose deal the
 * device now holds. An account whose group price the deal cannot hold (`MoveGap`) stays where it is.
 */
export function moveTypedAccounts(accounts: readonly CustomBroker[], ctx: MoveContext): void {
  const made = accounts.flatMap((a) => {
    try {
      return [dealOfTypedAccount(a, ctx)];
    } catch (e) {
      if (e instanceof MoveGap) return [];
      throw e;
    }
  });
  if (made.length === 0) return;
  dealStore.update((ds) => withMoved(ds, made));
  const held = storedDealIds();
  const moved = accounts.filter((a) => held.has(movedDealId(a.id))).map((a) => a.id);
  if (moved.length) dropTypedAccounts(moved);
}

/**
 * Runs the move on a page that has the price lists (`data`): the houses' records it reads (each one's line choice, a bank's current
 * account, the run's rates) are `bundle`'s where the page has the indices bundle, else loaded once a typed account is waiting.
 */
export function useTypedAccountsMove(data: FeesData | null, bundle?: Pick<IndicesBundle, "snapshots" | "fx"> | null): void {
  const invest = useInvestState();
  const deals = dealStore.use();
  const accounts = invest.customBrokers;
  const waiting = invest.ready && deals.ready && accounts.length > 0;
  const [loaded, setLoaded] = useState<Pick<IndicesBundle, "snapshots" | "fx"> | null>(null);
  useEffect(() => {
    if (waiting && bundle === undefined && !loaded) void loadIndicesBundle().then(setLoaded, () => undefined);
  }, [waiting, bundle, loaded]);
  const records = bundle ?? loaded;
  useEffect(() => {
    if (!waiting || !data || !records || !deals.writable) return;
    moveTypedAccounts(accounts, { houses: data.houses, kinds: data.kinds, snapshots: records.snapshots, fx: records.fx ? fxRunInput(records.fx) : {}, today: isoToday() });
  }, [waiting, data, records, accounts, deals.writable]);
}
