// F-68 for one class, the same way on every page (B12, 2026-10-24): the fee page (fees.server.ts), the holdings card and the
// track workbench (through the engine's `trackWorkbench`, which calls the same function) all take the latest-period tracks of
// `latestTracks` and one class key, the classification and specialization trimmed. What the line says "from N tracks" about
// is the number of tracks that report that fee, so a mean over 80 tracks never reads "83": `tracksBehind`.
import { regulatorReference, type CmaTrack, type RegulatorReference } from "@finance-tool/engine";

export const classKeyOf = (classification: string, specialization: string) => ({ fund_classification: classification.trim(), specialization: specialization.trim() });

/** The regulator's class reference over `tracks` (the latest period's, as `latestTracks` returns them). */
export const referenceOfClass = (tracks: readonly CmaTrack[], classification: string, specialization: string): RegulatorReference =>
  regulatorReference(tracks, classKeyOf(classification, specialization));

/** The tracks the mean and the median of one fee are taken over: those that report it. */
export const tracksBehind = (ref: RegulatorReference, fee: "management" | "deposit"): number => ref[fee].count;
