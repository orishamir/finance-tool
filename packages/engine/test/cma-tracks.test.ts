// CMA track records as the engine takes them (holdings/cma.ts): only the latest report period of each dataset counts.
import { describe, expect, it } from "vitest";
import type { CmaPeriodFile, ValueObject } from "@finance-tool/schema";
import { latestTracks } from "../src/index.ts";

const source = { url: "https://data.gov.il/he/datasets/cma/gemelnet", title: "fixture", publisher: "CMA", strength: "primary" as const };
const fee = (value: number, unit: ValueObject["unit"]): ValueObject => ({
  value,
  unit,
  source,
  checked: "2026-10-23",
  effective_from: "2025-01-01",
  effective_to: "2025-12-31",
  update_rule: "market",
  state: "sourced",
});

function file(mgmt: number, period: string, dataset: CmaPeriodFile["dataset"] = "gemelnet"): CmaPeriodFile {
  const fund: CmaPeriodFile["funds"][number] = {
    fund_id: 1,
    names: { cma: ["a"] },
    managing_corporation: { name: "c1 ltd", legal_id: "c1" },
    controlling_corporation: "",
    fund_classification: "קרנות השתלמות",
    target_population: "כלל האוכלוסיה",
    specialization: "כללי",
    sub_specialization: "",
    inception_date: null,
    raw_fields: {},
    fees: { avg_annual_management_fee: fee(mgmt, "pct_per_year"), avg_deposit_fee: fee(0, "pct_of_deposit") },
  };
  return { dataset, report_period: period, source, checked: "2026-10-23", raw: { archive_key: "x", sha256: "0".repeat(64) }, funds: [fund] };
}

describe("latestTracks", () => {
  it("uses the latest period of a dataset only, and carries the period on each track", () => {
    const tracks = latestTracks([file(5, "2026-08"), file(0.5, "2026-09")]);
    expect(tracks).toHaveLength(1);
    expect(tracks[0]).toMatchObject({ dataset: "gemelnet", report_period: "2026-09" });
    expect(tracks[0]!.fees.avg_annual_management_fee!.value).toBe(0.5);
  });
});
