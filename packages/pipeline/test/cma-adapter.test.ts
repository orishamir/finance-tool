import { mkdtempSync, mkdirSync, readFileSync, existsSync, writeFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import { cmaPeriodFile, type CmaPeriodFile } from "@finance-tool/schema";
import { describe, expect, it } from "vitest";
import {
  DATASETS,
  assetName,
  decodeWindows1255,
  diffFiles,
  gzipRaw,
  inceptionDate,
  normalise,
  balanceFeeOnly,
  buildFees,
  buildHoldings,
  readCmaFile,
  KEPT_COLUMNS,
  feeYear,
  renormaliseFees,
  parseCsv,
  refreshCma,
  releaseTag,
  sanityCheck,
  sha256Hex,
  type Downloaded,
} from "../src/adapters/cma.ts";

const gemel = DATASETS[0]!;
const pensia = DATASETS[1]!;
const fixture = readFileSync(fileURLToPath(new URL("./fixtures/gemelnet-sample.cp1255.csv", import.meta.url)));
const ctx = { config: gemel, runDate: "2026-10-23", sha256: "a".repeat(64), lastModified: "2026-10-23T04:00:20Z" };

function good(): CmaPeriodFile {
  const r = normalise(decodeWindows1255(fixture), ctx);
  expect(r.problems).toEqual([]);
  return r.file!;
}
const clone = (f: CmaPeriodFile): CmaPeriodFile => JSON.parse(JSON.stringify(f));

describe("decode and parse", () => {
  it("the fixture is Windows-1255, not UTF-8, and decodes to Hebrew without replacement characters", () => {
    expect(() => new TextDecoder("utf-8", { fatal: true }).decode(fixture)).toThrow();
    const text = decodeWindows1255(fixture);
    expect(text).toContain("מיטב גמל לבני 50 עד 60");
    expect(text).not.toContain("�");
  });

  it("parses quotes, doubled quotes, embedded newlines and CRLF", () => {
    expect(parseCsv('a,b\r\n"x ""y""","l1\nl2"\r\n"",z\n')).toEqual([
      ["a", "b"],
      ['x "y"', "l1\nl2"],
      ["", "z"],
    ]);
  });

  it("converts inception dates", () => {
    expect(inceptionDate("1994-11-14T00:00:00")).toBe("1994-11-14");
    expect(inceptionDate("")).toBeNull();
    expect(inceptionDate("14/11/1994")).toBeUndefined();
  });
});

describe("normalise", () => {
  const file = good();

  it("keeps only the latest REPORT_PERIOD and sorts by fund id", () => {
    expect(file.report_period).toBe("2026-09");
    expect(file.funds.map((f) => f.fund_id)).toEqual([103, 117, 229, 7635, 15995]);
  });

  it("writes the shape the hand-made snapshot has", () => {
    const f = file.funds[0]!;
    expect(f).toEqual({
      fund_id: 103,
      names: { cma: ["מיטב גמל לבני 50 עד 60"] },
      managing_corporation: { name: 'מיטב גמל ופנסיה בע"מ', legal_id: "512065202" },
      controlling_corporation: 'מיטב דש השקעות בע"מ',
      fund_classification: "תגמולים ואישית לפיצויים",
      target_population: "כלל האוכלוסיה",
      specialization: "מדרגות",
      sub_specialization: "50-60",
      inception_date: "1970-01-01",
      raw_fields: expect.objectContaining({ AVG_ANNUAL_MANAGEMENT_FEE: "0.53", AVG_DEPOSIT_FEE: "0.05", TOTAL_ASSETS: "25706.14", STOCK_MARKET_EXPOSURE: "12378.07" }),
      fees: expect.objectContaining({
        avg_annual_management_fee: expect.objectContaining({
          value: 0.53,
          unit: "pct_per_year",
          checked: "2026-10-23",
          effective_from: "2025-01-01",
          effective_to: "2025-12-31",
          tax_year: null,
          update_rule: "market",
          state: "sourced",
          rule_ids: ["CAT-35", "CAT-36", "CAT-37", "CAT-06"],
          source: expect.objectContaining({ strength: "primary", title: expect.stringContaining("AVG_ANNUAL_MANAGEMENT_FEE") }),
        }),
        avg_deposit_fee: expect.objectContaining({ value: 0.05, unit: "pct_of_deposit" }),
      }),
      holdings: {
        total_assets: expect.objectContaining({ value: 25706.14, unit: "nis_millions", state: "sourced", effective_to: "2026-09-30", rule_ids: ["CAT-24"] }),
        stock_market_exposure: expect.objectContaining({ value: 12378.07, unit: "nis_millions", source: expect.objectContaining({ title: expect.stringContaining("STOCK_MARKET_EXPOSURE") }) }),
        foreign_currency_exposure: expect.objectContaining({ value: 5156.92, unit: "nis_millions", notes: expect.stringContaining("מטבע חוץ") }),
      },
    });
    expect(file.checked).toBe("2026-10-23");
    expect(file.raw).toEqual({ archive_key: "cma/gemelnet/2026-10-23.csv.gz", sha256: "a".repeat(64) });
    expect(file.source.url).toBe("https://data.gov.il/he/datasets/cma/gemelnet");
    expect(file.source.title).toContain("a30dcbea-a1d2-482c-ae29-8f781f5025fb");
    expect(file.source.title).toContain("rows with REPORT_PERIOD 202609");
    expect(cmaPeriodFile.safeParse(file).success).toBe(true);
  });

  it("keeps text exactly as received (trailing spaces, newlines in names) and empty fees as empty strings", () => {
    expect(file.funds.find((f) => f.fund_id === 229)!.managing_corporation.name.endsWith(" ")).toBe(true);
    expect(file.funds.find((f) => f.fund_id === 7635)!.names.cma[0]).toContain("\n");
    expect(file.funds.find((f) => f.fund_id === 15995)!.raw_fields).toMatchObject({
      AVG_ANNUAL_MANAGEMENT_FEE: "",
      AVG_DEPOSIT_FEE: "",
      SHARPE_RATIO: "",
    });
  });

  it("pensia-net has no target/specialization columns: they become empty strings", () => {
    const csv =
      'FUND_ID,FUND_NAME,FUND_CLASSIFICATION,CONTROLLING_CORPORATION,MANAGING_CORPORATION,REPORT_PERIOD,INCEPTION_DATE,AVG_ANNUAL_MANAGEMENT_FEE,AVG_DEPOSIT_FEE,MANAGING_CORPORATION_LEGAL_ID\n' +
      '"1589","קרן","קרנות חדשות","בקרה","מנהלת","202609","2015-12-31T00:00:00","0.11","1.25","512065202"\n';
    const r = normalise(csv, { ...ctx, config: pensia });
    expect(r.problems).toEqual([]);
    expect(r.file!.dataset).toBe("pensia-net");
    expect(r.file!.funds[0]).toMatchObject({ target_population: "", specialization: "", sub_specialization: "" });
    // a file without the amount columns writes no holdings and keeps only the columns it has
    expect(r.file!.funds[0]!.holdings).toBeUndefined();
    expect(Object.keys(r.file!.funds[0]!.raw_fields)).toEqual(["AVG_ANNUAL_MANAGEMENT_FEE", "AVG_DEPOSIT_FEE"]);
  });

  it("keeps every further numeric column as received, for later use", () => {
    const raw = good().funds.find((f) => f.fund_id === 103)!.raw_fields;
    for (const c of KEPT_COLUMNS.filter((c) => c !== "MONTHLY_DEPOSITS")) expect(raw).toHaveProperty(c);
    expect(raw.SHARPE_RATIO).toBe("1.09");
  });
});

describe("holdings (F-87 inputs)", () => {
  const base = { dataset: "gemelnet" as const, report_period: "2026-09", checked: "2026-10-23", source: good().source };

  it("an empty amount is null with a note, not zero; zero stays zero", () => {
    const h = buildHoldings(base, { raw_fields: { TOTAL_ASSETS: "0", STOCK_MARKET_EXPOSURE: "" } })!;
    expect(h.total_assets.value).toBe(0);
    expect(h.stock_market_exposure.value).toBeNull();
    expect(h.stock_market_exposure.notes).toMatch(/^לא דווח/);
  });

  it("says the exposure unit is read like the assets, and the measure is unpublished", () => {
    const h = buildHoldings(base, { raw_fields: { TOTAL_ASSETS: "10", STOCK_MARKET_EXPOSURE: "5" } })!;
    expect(h.stock_market_exposure.notes).toContain("OQ4");
    expect(h.stock_market_exposure.notes).toContain("נגזרים");
    expect(buildHoldings(base, { raw_fields: { AVG_DEPOSIT_FEE: "0" } })).toBeUndefined();
    // a file without the currency column has no currency value, and still has the other two
    expect(h.foreign_currency_exposure).toBeUndefined();
    expect(buildHoldings(base, { raw_fields: { TOTAL_ASSETS: "10", STOCK_MARKET_EXPOSURE: "5", FOREIGN_CURRENCY_EXPOSURE: "2" } })!.foreign_currency_exposure!.value).toBe(2);
  });
});

describe("fees", () => {
  const file = good();
  const f = (id: number) => file.funds.find((x) => x.fund_id === id)!;

  it("derives the calendar year of the average from the report period (CAT-36)", () => {
    expect(feeYear("2026-09")).toBe(2025);
    const v = f(103).fees.avg_annual_management_fee;
    expect([v.effective_from, v.effective_to]).toEqual(["2025-01-01", "2025-12-31"]);
    expect(v.notes).toContain("2025");
    expect(v.notes).toContain("נגבו בפועל");
    expect(feeYear("2027-01")).toBe(2026);
  });

  it("an empty fee is null with a reason, not zero, and the file still validates", () => {
    const v = f(15995).fees;
    expect(v.avg_annual_management_fee.value).toBeNull();
    expect(v.avg_annual_management_fee.notes).toMatch(/^לא דווח/);
    expect(v.avg_deposit_fee.value).toBeNull();
    expect(cmaPeriodFile.safeParse(file).success).toBe(true);
  });

  it("zero stays zero; a negative value is kept as reported with a note", () => {
    const base = { dataset: "gemelnet" as const, report_period: "2026-09", checked: "2026-10-23", source: file.source };
    const zero = buildFees(base, { raw_fields: { AVG_ANNUAL_MANAGEMENT_FEE: "0", AVG_DEPOSIT_FEE: "0.00" }, inception_date: "2000-01-01" });
    expect(zero.avg_annual_management_fee.value).toBe(0);
    expect(zero.avg_deposit_fee.value).toBe(0);
    const neg = buildFees(base, { raw_fields: { AVG_ANNUAL_MANAGEMENT_FEE: "0.5", AVG_DEPOSIT_FEE: "-0.21" }, inception_date: "2000-01-01" });
    expect(neg.avg_deposit_fee.value).toBe(-0.21);
    expect(neg.avg_deposit_fee.notes).toContain("שלילי");
  });

  it("an empty fee of an old track says the reason is unknown; of a track opened last year, no full year yet", () => {
    const base = { dataset: "gemelnet" as const, report_period: "2026-09", checked: "2026-10-23", source: file.source };
    const raw = { AVG_ANNUAL_MANAGEMENT_FEE: "", AVG_DEPOSIT_FEE: "" };
    expect(buildFees(base, { raw_fields: raw, inception_date: "2010-01-01" }).avg_annual_management_fee.notes).toContain("OQ22");
    expect(buildFees(base, { raw_fields: raw, inception_date: "2026-03-01" }).avg_annual_management_fee.notes).toContain("שנה קלנדרית מלאה");
  });

  it("an empty deposit fee of a balance-only type (study fund, central, other-purpose, IRA) gives PF-06 as the reason", () => {
    const base = { dataset: "gemelnet" as const, report_period: "2026-09", checked: "2026-10-23", source: file.source };
    const raw = { AVG_ANNUAL_MANAGEMENT_FEE: "0.5", AVG_DEPOSIT_FEE: "" };
    const of = (fund_classification: string, name: string) =>
      buildFees(base, { raw_fields: raw, inception_date: "2010-01-01", fund_classification, names: { cma: [name] } }).avg_deposit_fee;
    for (const v of [of("קרנות השתלמות", "קרן"), of("מרכזית לפיצויים", "קופה"), of("מטרה אחרת", "קופה"), of("תגמולים ואישית לפיצויים", "גמל בניהול אישי IRA")]) {
      expect(v.value).toBeNull();
      expect(v.rule_ids).toContain("PF-06");
      expect(v.notes).toMatch(/^אין דמי ניהול מהפקדה/);
      expect(v.notes).not.toContain("לא דווח");
    }
    // a tagmulim fund may charge a deposit fee: an empty one stays unknown, and "אישית לפיצויים" is not an IRA
    const tagmulim = of("תגמולים ואישית לפיצויים", "קופת גמל אישית לפיצויים");
    expect(tagmulim.rule_ids).not.toContain("PF-06");
    expect(tagmulim.notes).toContain("הסיבה לא ידועה");
    // the balance fee of a study fund is not touched
    expect(buildFees(base, { raw_fields: { AVG_ANNUAL_MANAGEMENT_FEE: "", AVG_DEPOSIT_FEE: "" }, inception_date: "2010-01-01", fund_classification: "קרנות השתלמות" }).avg_annual_management_fee.rule_ids).not.toContain("PF-06");
  });

  it("the stored gemelnet file marks exactly the 15 IRA funds of IRA-03 by name", () => {
    const stored = readCmaFile(fileURLToPath(new URL("../../../data/cma", import.meta.url)), "gemelnet", "2026-09");
    const ira = stored.funds.filter((f) => f.fund_classification !== "קרנות השתלמות" && f.fund_classification !== "מרכזית לפיצויים" && f.fund_classification !== "מטרה אחרת" && balanceFeeOnly(f));
    const iraStudy = stored.funds.filter((f) => f.fund_classification === "קרנות השתלמות" && /בניהול אישי|\bIRA\b/i.test(f.names.cma.join(" ")));
    expect(ira.length + iraStudy.length).toBe(15);
  });

  it("pension fees carry CAT-39 and say they are for the whole fund", () => {
    const csv =
      'FUND_ID,FUND_NAME,FUND_CLASSIFICATION,CONTROLLING_CORPORATION,MANAGING_CORPORATION,REPORT_PERIOD,INCEPTION_DATE,AVG_ANNUAL_MANAGEMENT_FEE,AVG_DEPOSIT_FEE,MANAGING_CORPORATION_LEGAL_ID\n' +
      '"1589","קרן","קרנות חדשות","בקרה","מנהלת","202609","2015-12-31T00:00:00","0.11","1.25","512065202"\n';
    const p = normalise(csv, { ...ctx, config: pensia }).file!.funds[0]!.fees;
    expect(p.avg_deposit_fee.rule_ids).toContain("CAT-39");
    expect(p.avg_deposit_fee.notes).toContain("לקרן כולה");
    expect(p.avg_deposit_fee.source.title).toContain("פנסיה נט");
  });

  it("renormaliseFees rebuilds fees from raw_fields and touches nothing else", () => {
    const stripped = clone(file);
    for (const x of stripped.funds) {
      (x as { fees: unknown }).fees = null;
      delete x.holdings;
    }
    expect(renormaliseFees(stripped)).toEqual(file);
  });
});

describe("sanity checks", () => {
  const header = decodeWindows1255(fixture).split("\r\n")[0]!;
  const text = decodeWindows1255(fixture);

  it("reports a missing required column and writes no file", () => {
    const r = normalise(text.replace("AVG_DEPOSIT_FEE", "AVG_DEPOSIT_FEES"), ctx);
    expect(r.file).toBeNull();
    expect(r.problems[0]).toMatch(/required column.*AVG_DEPOSIT_FEE/);
    expect(header).toContain("AVG_DEPOSIT_FEE");
  });

  it("reports replacement characters in a text field", () => {
    const r = normalise(text.replaceAll("מדרגות", "מד\uFFFDגות"), ctx);
    expect(r.problems.join()).toMatch(/failed to decode.*SPECIALIZATION/);
  });

  it("flags a row count under 80% of the previous period", () => {
    const prev = clone(good());
    for (let i = 0; i < 20; i++) prev.funds.push({ ...prev.funds[0]!, fund_id: 1000 + i });
    const reasons = sanityCheck(good(), prev);
    expect(reasons.join()).toMatch(/row count 5 is below 80%/);
  });

  it("flags more than 20% of fund ids disappearing even if the count is fine", () => {
    const prev = clone(good());
    const next = clone(good());
    next.funds = next.funds.slice(0, 3).concat(prev.funds.slice(0, 0));
    // 2 of 5 ids gone (40%), 3 rows left (60%): both checks fire
    const reasons = sanityCheck(next, prev);
    expect(reasons.some((r) => /disappeared/.test(r))).toBe(true);
    // swap two ids for new ones: count stays 5, 40% of ids vanish
    const swapped = clone(good());
    swapped.funds[0]!.fund_id = 9001;
    swapped.funds[1]!.fund_id = 9002;
    const r2 = sanityCheck(swapped, prev);
    expect(r2).toHaveLength(1);
    expect(r2[0]).toMatch(/2 of 5 fund ids \(40%\) disappeared/);
  });

  it("allows up to 20% to disappear, and a period that goes backwards fails", () => {
    const prev = clone(good());
    const next = clone(good());
    next.funds = next.funds.slice(0, 4);
    expect(sanityCheck(next, prev)).toEqual([]);
    const older = clone(good());
    older.report_period = "2026-08";
    expect(sanityCheck(older, prev)[0]).toMatch(/older than the stored/);
  });

  it("passes with no previous file", () => {
    expect(sanityCheck(good(), null)).toEqual([]);
  });
});

describe("diff", () => {
  it("is empty for identical data even when checked and the raw hash differ", () => {
    const next = clone(good());
    next.checked = "2026-11-01";
    next.raw.sha256 = "b".repeat(64);
    expect(diffFiles(good(), next).isEmpty).toBe(true);
  });

  it("finds added, removed and changed funds and a new period", () => {
    const next = clone(good());
    next.report_period = "2026-10";
    next.funds = next.funds.filter((f) => f.fund_id !== 117);
    next.funds.push({ ...clone(good()).funds[0]!, fund_id: 20000 });
    next.funds.find((f) => f.fund_id === 103)!.raw_fields.AVG_ANNUAL_MANAGEMENT_FEE = "0.60";
    const d = diffFiles(good(), next);
    expect(d.periodChanged).toBe(true);
    expect(d.added).toEqual([20000]);
    expect(d.removed).toEqual([117]);
    expect(d.changed).toEqual([{ fund_id: 103, fields: ["raw_fields.AVG_ANNUAL_MANAGEMENT_FEE"] }]);
  });

  it("a file written before the amount columns were kept differs from one with them, so the refresh writes it", () => {
    const old = clone(good());
    for (const f of old.funds) {
      f.raw_fields = { AVG_ANNUAL_MANAGEMENT_FEE: f.raw_fields.AVG_ANNUAL_MANAGEMENT_FEE!, AVG_DEPOSIT_FEE: f.raw_fields.AVG_DEPOSIT_FEE! };
      delete f.holdings;
    }
    const d = diffFiles(old, good());
    expect(d.isEmpty).toBe(false);
    expect(d.changed[0]!.fields).toContain("raw_fields.STOCK_MARKET_EXPOSURE");
  });
});

describe("archive naming", () => {
  it("asset name replaces slashes, tag is by report period", () => {
    expect(assetName("cma/gemelnet/2026-10-23.csv.gz")).toBe("cma--gemelnet--2026-10-23.csv.gz");
    expect(releaseTag("2026-09")).toBe("raw-cma-2026-09");
  });
  it("gzip round-trips and is deterministic", () => {
    expect(gunzipSync(gzipRaw(fixture)).equals(fixture)).toBe(true);
    expect(gzipRaw(fixture).equals(gzipRaw(fixture))).toBe(true);
    expect(sha256Hex(fixture)).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("refreshCma end to end with an injected download", () => {
  function setup(csvFor: (c: typeof gemel) => Uint8Array) {
    const dataDir = mkdtempSync(join(tmpdir(), "cma-refresh-"));
    mkdirSync(join(dataDir, "cma"));
    const uploads: { tag: string; assetName: string }[] = [];
    const run = (over: Partial<Parameters<typeof refreshCma>[0]> = {}) =>
      refreshCma({
        dataDir,
        runDate: "2026-10-23",
        dryRun: false,
        archive: true,
        force: false,
        datasets: [gemel],
        fetchRaw: async (c): Promise<Downloaded> => ({ bytes: csvFor(c), lastModified: "2026-10-23T04:00:20Z" }),
        archiveRaw: ({ tag, assetName }) => (uploads.push({ tag, assetName }), "uploaded"),
        log: () => {},
        ...over,
      });
    return { dataDir, run, uploads };
  }

  it("dry run writes nothing; the real run writes the file and archives; a repeat changes nothing", async () => {
    const { dataDir, run, uploads } = setup(() => fixture);
    const dry = await run({ dryRun: true });
    expect(dry[0]!.status).toBe("new-period");
    expect(readdirSync(join(dataDir, "cma"))).toEqual([]);

    const first = await run();
    expect(first[0]).toMatchObject({ status: "new-period", written: true });
    expect(readdirSync(join(dataDir, "cma"))).toEqual(["gemelnet@2026-09.json"]);
    const written = JSON.parse(readFileSync(join(dataDir, "cma", "gemelnet@2026-09.json"), "utf8"));
    expect(cmaPeriodFile.safeParse(written).success).toBe(true);
    expect(written.raw.sha256).toBe(sha256Hex(fixture));
    expect(uploads).toEqual([{ tag: "raw-cma-2026-09", assetName: "cma--gemelnet--2026-10-23.csv.gz" }]);

    const again = await run({ runDate: "2026-10-24" });
    expect(again[0]).toMatchObject({ status: "unchanged", written: false });
    expect(uploads).toHaveLength(1);
  });

  it("--no-archive skips the upload but records the key and hash", async () => {
    const { dataDir, run, uploads } = setup(() => fixture);
    await run({ archive: false });
    expect(uploads).toEqual([]);
    const written = JSON.parse(readFileSync(join(dataDir, "cma", "gemelnet@2026-09.json"), "utf8"));
    expect(written.raw.archive_key).toBe("cma/gemelnet/2026-10-23.csv.gz");
  });

  it("same period with a changed fee rewrites the file", async () => {
    let bytes: Uint8Array = fixture;
    const { dataDir, run } = setup(() => bytes);
    await run();
    // Patch the ASCII fee of the 202609 row in the original cp1255 bytes.
    const patched = Buffer.from(fixture);
    const at = patched.indexOf(Buffer.from('"0.53","0.05"'), patched.indexOf(Buffer.from('"202609"')));
    expect(at).toBeGreaterThan(0);
    patched.write('"0.54","0.05"', at, "latin1");
    bytes = patched;
    const r = await run({ runDate: "2026-10-25" });
    expect(r[0]).toMatchObject({ status: "updated", written: true });
    expect(JSON.parse(readFileSync(join(dataDir, "cma", "gemelnet@2026-09.json"), "utf8")).checked).toBe("2026-10-25");
  });

  it("sanity failure writes nothing, unless --force; the schema must still pass", async () => {
    let bytes: Uint8Array = fixture;
    const { dataDir, run } = setup(() => bytes);
    await run();
    const before = readFileSync(join(dataDir, "cma", "gemelnet@2026-09.json"), "utf8");
    // a download with only two of the five funds of the period: 3 ids gone (60%)
    const lines = decodeWindows1255(fixture).split("\r\n");
    const header = lines[0]!;
    const small = [header, ...lines.slice(1).filter((l) => l.startsWith('"103"') && l.includes('"202609"'))].join("\r\n") + "\r\n";
    bytes = new TextEncoder().encode(small);
    const r = await run({ runDate: "2026-10-26" });
    expect(r[0]!.status).toBe("sanity-failed");
    expect(r[0]!.reasons.join()).toMatch(/row count|disappeared/);
    expect(readFileSync(join(dataDir, "cma", "gemelnet@2026-09.json"), "utf8")).toBe(before);
    expect(existsSync(join(dataDir, "cma", "gemelnet@2026-10.json"))).toBe(false);

    const forced = await run({ runDate: "2026-10-26", force: true });
    expect(forced[0]).toMatchObject({ status: "updated", written: true });
    expect(forced[0]!.reasons.length).toBeGreaterThan(0);
  });

  it("a missing column is a sanity failure even with --force", async () => {
    const bad = new TextEncoder().encode(decodeWindows1255(fixture).replace("REPORT_PERIOD", "REPORT_PER"));
    const { run } = setup(() => bad);
    const r = await run({ force: true });
    expect(r[0]!.status).toBe("sanity-failed");
    expect(r[0]!.written).toBe(false);
  });
});
