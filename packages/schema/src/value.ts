// The value object and the shared vocabularies: docs/data-schema.md §1 and §2.
import { z } from "zod";

export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

/**
 * The calendar date in Israel, `YYYY-MM-DD`, whatever the machine's clock zone: `toISOString().slice(0, 10)` is the UTC date, a day behind
 * Israel's for two or three hours after midnight, and GitHub's runners keep UTC. The run date of the pipeline, the data check and the site
 * build. The same function for the tools is tools/israel-date.mjs.
 */
export function israelToday(now: Date = new Date()): string {
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/** data-schema §2, units. */
export const unit = z.enum([
  "nis",
  "nis_millions",
  "usd",
  "eur",
  /** An amount in pounds sterling, as a British government page prints it (data/abroad/, D114); never converted. */
  "gbp",
  "pct",
  "pct_per_year",
  "pct_of_deposit",
  "pct_of_trade",
  "pct_of_balance_per_period",
  "nis_per_month",
  "nis_per_trade",
  "nis_per_transfer",
  "usd_per_share",
  /** A sum for each unit traded in shekels, euros or pounds: a price per unit the person types on the fee page (F-12); no price list prints one. */
  "nis_per_share",
  "eur_per_share",
  "gbp_per_share",
  "usd_per_trade",
  "gbp_per_trade",
  /** A dollar amount for each corporate event, as One Zero prints its custodian's cost abroad (D67, F-103). */
  "usd_per_event",
  "nis_per_usd",
  "fx_per_eur",
  "months",
  "years",
  "days",
  "business_days",
  "index_points",
  "count",
  "boolean",
  "text",
]);

/** data-schema §2, security types for tariff lines and for a snapshot's `availability.applies_to` (`all` is every one). */
export const instrumentClass = z.enum([
  "tase_shares_bonds",
  "tase_bonds",
  "makam",
  "foreign_securities",
  "mutual_fund_units",
  "money_market_units",
  "etf_units",
  "tase_foreign_fund_units",
  "all",
]);

/** data-schema §1, strength vocabulary (il-finance README plus entered). A copy of an official text is never a source (CLAUDE.md). */
export const strength = z.enum(["primary", "institution", "secondary", "open", "entered"]);

/** D7: the three number states. */
export const numberState = z.enum(["sourced", "computed", "entered"]);

/** data-schema §1, update_rule. "frozen YYYY-YYYY" carries its own years. */
export const updateRule = z.union([
  z.enum([
    "fixed in law",
    "fixed in regulation",
    "cpi-linked 1 jan",
    "average-wage-linked",
    "provider-set",
    "market",
    "founder",
    // set anew for each year by the authority that publishes it, with no rule the site follows (a yearly ceiling abroad: the US IRA limit)
    "set yearly",
  ]),
  z.string().regex(/^frozen \d{4}-\d{4}$/, 'update_rule "frozen" must name its years, e.g. "frozen 2025-2027"'),
]);

/**
 * The words a link to a cited web page opens at. Never written in a record under data/: the site
 * attaches it when it reads the record, from data/sources/fragments.json (the validator fails a record file that carries one). Declared
 * on the places that can carry it so a record the site checks again after reading keeps it.
 */
export const textFragment = z.strictObject({
  prefix: z.string().min(1).optional(),
  start: z.string().min(1),
  end: z.string().min(1).optional(),
  suffix: z.string().min(1).optional(),
});

export const source = z.object({
  url: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().min(1),
  strength,
});

export const computedFrom = z.object({
  formula: z.string().regex(/^[FA]-\d{2,3}$/),
  inputs: z.record(z.string(), z.unknown()),
});

/** data-schema §1: a number never appears bare. */
export const valueObject = z
  .object({
    value: z.union([z.number(), z.string(), z.boolean(), z.null()]),
    unit,
    source,
    checked: isoDate,
    effective_from: isoDate.nullable(),
    effective_to: isoDate.nullable(),
    tax_year: z.number().int().nullable().optional(),
    update_rule: updateRule,
    rule_ids: z.array(z.string()).optional(),
    state: numberState,
    computed_from: computedFrom.optional(),
    notes: z.string().optional(),
    /**
     * Site parameters only (`data/parameters/`, data-schema §3.2): the reader's own short line for this one number, in plain
     * Hebrew. The number's sheet shows it first; the parameter file's general `rationale_he` waits behind "more". It never
     * carries working history (who chose the value, test scenarios, audit ids); that stays in docs/parameters-rationale.md.
     */
    rationale_he: z.string().min(1).optional(),
  })
  .refine((v) => v.value !== null || (v.notes ?? "").trim() !== "", {
    message: "value is null, so notes must say why",
    path: ["notes"],
  })
  .refine((v) => v.state !== "computed" || v.computed_from !== undefined, {
    message: "a computed value must carry computed_from",
    path: ["computed_from"],
  });

export type ValueObject = z.infer<typeof valueObject>;

/** data-schema §2, fee bases (`fee.base`). */
export const feeBase = z.enum([
  "deposit",
  "balance",
  "trade",
  "custody",
  "fx",
  "exit",
  "fixed_period",
  /** A charge for each corporate event of a security held abroad, such as a fund's dividend (D67, F-103). */
  "corporate_event",
  "distribution_handling",
  "spread",
  "creation_redemption",
  "transfer_out",
  "load",
  "redemption_deduction",
  "variable_management",
  "trustee",
  "direct_expenses",
  "insurance_premium",
]);

export type FeeBase = z.infer<typeof feeBase>;

/**
 * data-schema §2, wrapper IDs (`data/instruments/wrappers/`): the containers whose rules apply to whatever they hold (D6).
 * Makam, government bonds and the money-market funds are securities held in a wrapper, not wrappers (`securityId`).
 */
export const wrapperId = z.enum([
  "current-account",
  "bank-deposit",
  "savings-plan",
  "brokerage-account",
  "kupat-gemel-lehashkaa",
  "keren-hishtalmut",
  "pension-comprehensive",
  "pension-general",
  "provident-for-annuity",
  "child-savings-provident",
  "child-savings-bank",
  "ira-hishtalmut",
  "ira-provident",
]);

export type WrapperId = z.infer<typeof wrapperId>;

/**
 * data-schema §2, security IDs (`data/instruments/securities/`): what a person buys inside a wrapper and that carries rules of its own,
 * a security held directly or a fund (D6). Each is held in a securities account (`held_in`).
 */
export const securityId = z.enum(["makam", "government-bond", "money-market-fund-daily", "money-market-fund-renewable"]);

export type SecurityId = z.infer<typeof securityId>;

/**
 * data-schema §2, product IDs: what a person chooses between, a wrapper or a security held in one (D6). A guide page, a comparison
 * option and a term's `wrapper_ids` are named by product id; the wrapper a security sits in is its record's `held_in`.
 */
export const productId = z.union([wrapperId, securityId]);

export type ProductId = z.infer<typeof productId>;

/** Every product id, wrappers first: a comparison's candidate set (F-83). */
export const productIds: readonly ProductId[] = [...wrapperId.options, ...securityId.options];

/** Whether a product id names a security (true) or a wrapper (false). */
export const isSecurityId = (id: string): id is SecurityId => (securityId.options as readonly string[]).includes(id);
