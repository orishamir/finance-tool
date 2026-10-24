// CMA track records as the engine takes them: the latest period of each dataset (F-83, F-64), flattened.
import type { CmaPeriodFile } from "@finance-tool/schema";

type CmaFund = CmaPeriodFile["funds"][number];

/** A track record with the dataset and period it comes from. */
export type CmaTrack = CmaFund & { dataset: CmaPeriodFile["dataset"]; report_period: string; source: CmaPeriodFile["source"]; checked: string };

/**
 * The track records of the latest report period of each dataset in `files` (several periods or datasets may be
 * passed; for each dataset only the newest period counts, as the site reads them). Pure: the caller read the files.
 */
export function latestTracks(files: readonly CmaPeriodFile[]): CmaTrack[] {
  const latest = new Map<string, CmaPeriodFile>();
  for (const f of files) {
    const prev = latest.get(f.dataset);
    if (!prev || prev.report_period < f.report_period) latest.set(f.dataset, f);
  }
  return [...latest.values()].flatMap((f) => f.funds.map((fund) => ({ ...fund, dataset: f.dataset, report_period: f.report_period, source: f.source, checked: f.checked })));
}
