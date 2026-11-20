// The fees the reading leaves out (method §10.6), each said as a note in the panel its fee stands on, so none drops out of the reading
// unseen: a fee whose prices' months are not in order yet, a fee with a price not given, a fee the picks give no case (F-114), and a fee
// the law bans here.
import { chargedOn, groupAction, type Deal, type DealAction, type DealSide } from "@finance-tool/engine";
import type { BanSaid } from "./kinds";
import type { DealRead, FeeRef } from "./deal-read";
import type { SlimFee } from "./model";
import type { Panels } from "./charts";
import { engineBase, type FeeKindId } from "./shapes";

export interface LeftOut {
  /** Fees left out because their prices are not in order yet. */
  unread: FeeRef[];
  /** Fees left out because a price of theirs from the reading's month on is not given yet. */
  unpriced: FeeRef[];
  /** Fees left out because the picks give them no case (F-114): the price list prints no price for what is picked. */
  unmatched: (FeeRef & { noCurrency?: true; notPrinted?: true })[];
  /** Fees the law bans here, read as nothing charged, with the rules that ban them (`DealRead.banned`). */
  banned: (FeeRef & { ban: BanSaid })[];
}

/** A fee of the deal the reading leaves out as a line names it: its id, kind, the person's name for it, and the house it was copied from. */
export const leftRef = (r: Pick<DealRead, "copied">, f: Pick<SlimFee, "id" | "kind" | "name">): FeeRef => ({ fee: f.id, kind: f.kind, ...(f.name ? { name: f.name } : {}), ...(r.copied[f.id] ? { house: r.copied[f.id] } : {}) });

/** The fees the reading leaves out, from the deal read once (`readDealFor`). */
export function leftOut(r: DealRead): LeftOut {
  const refs = (ids: readonly string[]) => r.deal.fees.filter((f) => ids.includes(f.id)).map((f) => leftRef(r, f));
  return {
    unread: refs(r.unread),
    unpriced: refs(r.unpriced),
    unmatched: refs(r.unmatched).map((f) => (r.noCurrency.includes(f.fee) ? { ...f, noCurrency: true as const } : r.notPrinted.includes(f.fee) ? { ...f, notPrinted: true as const } : f)),
    banned: r.banned.map(({ fee, ...ban }) => ({ ...refs([fee])[0]!, ban })),
  };
}

/** Whether the reading leaves any fee out. */
export const leavesOut = (l: LeftOut) => l.unread.length + l.unpriced.length + l.unmatched.length + l.banned.length > 0;

/** The key of the panel a fee stands on (an action's tab key, or `held`); null where the reading has no panel. */
export type PanelKey = string;

/**
 * The action and side a fee the reading leaves out is charged on, by its kind's base (F-111) as a fee read with no price yet would be:
 * its own side where its kind is charged on one side alone, else both; null for a fee not charged on an action (on what is held, on the
 * account, offset against an action, or one F-111 places by a price form it has not got).
 */
export function actionOfLeft(kind: FeeKindId, deal: Pick<Deal, "foreign">): { action: DealAction; side: DealSide } | null {
  const base = engineBase(kind);
  const on = chargedOn(base, { kind: "free" });
  const action = groupAction(deal, base, { kind: "free" });
  if (on?.on !== "action" || !action) return null;
  return { action, side: "side" in on && on.side ? on.side : "all" };
}

/**
 * The panel a fee the reading leaves out stands on: an action's fee (`actionOfLeft`) on that action's tab (its own side's where the deal
 * splits the action by side, else the action's first), and every other fee on the holding panel; where that panel or the action's tab is
 * missing, the reading's first panel. Null where the reading has no panel at all.
 */
export function panelOfLeft(fee: FeeRef, deal: Pick<Deal, "foreign">, panels: Pick<Panels, "actions" | "held">): PanelKey | null {
  const on = actionOfLeft(fee.kind, deal);
  if (on) {
    const tabs = panels.actions.filter((t) => t.action === on.action);
    const tab = tabs.find((t) => t.side === on.side) ?? tabs.find((t) => t.side === "all") ?? tabs[0];
    if (tab) return tab.key;
  }
  if (panels.held.length > 0) return "held";
  return panels.actions[0]?.key ?? null;
}

/** The fees left out by the panel each is said in, each kind of reason in its own list; those no panel takes under `rest`. */
export function leftByPanel(l: LeftOut, deal: Pick<Deal, "foreign">, panels: Pick<Panels, "actions" | "held">): { byPanel: Record<PanelKey, LeftOut>; rest: LeftOut } {
  const empty = (): LeftOut => ({ unread: [], unpriced: [], unmatched: [], banned: [] });
  const byPanel: Record<PanelKey, LeftOut> = {};
  const rest = empty();
  const place = <K extends keyof LeftOut>(key: K) => {
    for (const f of l[key]) {
      const p = panelOfLeft(f, deal, panels);
      const into = p === null ? rest : (byPanel[p] ??= empty());
      (into[key] as LeftOut[K][number][]).push(f);
    }
  };
  place("unread");
  place("unpriced");
  place("unmatched");
  place("banned");
  return { byPanel, rest };
}
