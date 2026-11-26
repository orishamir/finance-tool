// data/funds/: hand-collected fund details. docs/data-schema.md §3.5.
// Strict: a field the schema does not name is an error. Every fee entry is a value object or null.
import { z } from "zod";
import { isoDate, source, valueObject } from "../value.ts";

const fee = valueObject.nullable().optional();

/**
 * data-schema §3.5: a fee lowered for a stated period, as the manager or the trustee reports it ("מבצע"). `fee` names the key of `fees` it
 * lowers; `rate` is the rate charged during the promotion, in the fee's unit, its `effective_from` and `effective_to` the promotion's first and
 * last days as the report prints them, its source the report. The fee's own value holds the rate outside the promotion; F-121 charges the
 * promotion's rate in the run's months it covers whole and the fee's own rate in the others.
 */
export const fundPromotion = z.strictObject({
  fee: z.enum(["fixed_management", "variable_management", "trustee"]),
  rate: valueObject,
});

/**
 * data-schema §3.5: `tax_status.foreign_investment_fund`, a value object in unit `text` whose value is an ISO 4217 code (the principal
 * currency), `false`, or `null` where the documents read do not settle it (its `notes` then say which were read).
 */
const foreignInvestmentFund = valueObject.refine(
  (v) => v.unit === "text" && (v.value === false || v.value === null || (typeof v.value === "string" && /^[A-Z]{3}$/.test(v.value))),
  { message: 'foreign_investment_fund: unit "text", value an ISO 4217 code (the principal currency), false, or null (not known)', path: ["value"] },
);

/** data-schema §3.5 `tax_ruling.index`: the tax index a fund's annex states under its ruling, each basis with only the fields it carries. */
const taxRulingIndex = z.discriminatedUnion("basis", [
  z.strictObject({
    basis: z.literal("main-currency"),
    currency: z.string().regex(/^[A-Z]{3}$/, "currency is an ISO 4217 code"),
    page: z.number().int().positive(),
    quote: z.string().min(1),
    currency_quote: z.string().min(1),
    checked: isoDate,
  }),
  z.strictObject({
    basis: z.literal("cpi"),
    page: z.number().int().positive(),
    quote: z.string().min(1),
    checked: isoDate,
  }),
]);

/**
 * data-schema §3.5, F-132: one payment a fund made, as the manager's own table prints it: its kind, ex-dividend and payable dates, and the
 * amount a share in the record's `currency`, with the page and its words in `source.title`.
 */
export const distributionPayment = z.strictObject({
  /** `income` (dividends and interest; Vanguard's "Income") or `capital_gain` (a capital gain distribution, short or long term). */
  kind: z.enum(["income", "capital_gain"]),
  ex_date: isoDate,
  pay_date: isoDate,
  per_share: z.number().positive(),
  source,
  checked: isoDate,
});

/** data-schema §3.5, F-132: the fund's NAV a share on one day, in the record's `currency`, from the manager's own page. */
export const distributionNav = z.strictObject({
  date: isoDate,
  value: z.number().positive(),
  source,
  checked: isoDate,
});

/** data-schema §3.5, F-132: what a computed 12-month yield is worked out from. */
const distributionTrailing = z.strictObject({
  nav: distributionNav,
  payments: z.array(distributionPayment).min(1),
});

/**
 * data-schema §3.5 `legal_structure`: the legal forms a foreign fund's own document names, in its own category. `company`: a company (a
 * public limited company, an investment company incorporated with limited liability); `icav`: an Irish collective asset-management vehicle;
 * `statutory-trust`: a US statutory trust; `unit-trust`; `common-contractual-fund`. Only `company` settles how Israel taxes the fund's
 * distribution (TXF-08, F-20, product D85); any other form, or none recorded, is read by the site.
 */
/** F-65, F-109: the exchanges abroad a fund bought abroad is priced on. */
export const fundExchange = z.enum(["us", "europe"]);
export type FundExchange = z.infer<typeof fundExchange>;

export const legalStructures = ["company", "icav", "statutory-trust", "unit-trust", "common-contractual-fund"] as const;
export type LegalStructure = (typeof legalStructures)[number];

export const fundRecord = z.strictObject({
  /** Lowercase ASCII, digits and hyphens, e.g. "ie00b5bmr087"; an exposure's variants name it as `fund:<id>`. */
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "id is lowercase ASCII, digits and single hyphens"),
  names: z.strictObject({ en: z.array(z.string()), he: z.array(z.string()), tase: z.array(z.string()) }),
  identifiers: z.strictObject({
    isin: z.string().nullable(),
    tase_number: z.string().nullable(),
    cusip: z.string().nullable(),
    ticker: z.record(z.string(), z.string()),
  }),
  manager: z.string().min(1),
  domicile: z.string().min(1),
  legal_form: z.string().min(1),
  /**
   * data-schema §3.5: the legal form a foreign fund's own document names, in the document's own category (`legalStructures`): `source` the
   * document, `page` its PDF page, `quote` its words that name the form, `checked` the date they were read. Left out where the documents the
   * record cites do not say; an Israeli fund's record leaves it out.
   */
  legal_structure: z
    .strictObject({ form: z.enum(legalStructures), source, page: z.number().int().positive(), quote: z.string().min(1), checked: isoDate })
    .optional(),
  exposure_id: z.string().min(1),
  currency: z.string().min(1),
  trading_currency_on_tase: z.string().min(1).nullable(),
  distribution_policy: z.enum(["accumulating", "distributing"]).nullable(),
  tax_status: z.strictObject({
    il_fund_tax_track: z.enum(["exempt", "taxable"]).nullable(),
    /**
     * TXS-14: whether the fund is a "קרן נאמנות להשקעות חוץ" under the 2003 regulations, as its own documents say. Unit `text`: the
     * principal currency's ISO 4217 code where its annual report or its manager's prospectus names one ("USD"); `false` where its own
     * document says it is not one, or its manager's prospectus tax column, which names that status for the manager's funds that have it,
     * states the fund's status without it; `null` where the documents read do not settle it. Carried by the latest record of every Israeli
     * fund (data-schema §4 item 21); left out on a foreign one.
     */
    foreign_investment_fund: foreignInvestmentFund.optional(),
  }),
  fees: z.strictObject({
    fixed_management: fee,
    trustee: fee,
    variable_management: fee,
    tracking_difference_12m: fee,
    median_spread: fee,
    fund_level_withholding_drag: fee,
    /**
     * MF-21: the load on purchase (שיעור הוספה), unit `pct_of_trade`, from the fund's own document. `0` means a document
     * was read and says zero; left out means not read, so a missing value is never a zero. ETFs and foreign funds leave it out.
     * The validator fails a load above zero until the page prices one.
     */
    load: fee,
  }),
  dimensions: z.record(z.string(), z.string().regex(/^(covered|blocked)(:[A-Z0-9-]+)?$/)),
  prospectus: z.strictObject({ url: z.string().min(1), date: z.string().nullable() }),
  // Israeli funds only (Maya export, data-schema §3.5, "Israeli funds").
  exposure_code: z.string().nullable().optional(),
  distribution_fee_type: z.string().nullable().optional(),
  creation_redemption_fee_category: z.string().nullable().optional(),
  /** S4: how the fund follows its index, with the page that says so. */
  replication: z
    .strictObject({
      method: z.enum(["physical", "swap", "futures", "mixed"]),
      source: z.strictObject({ url: z.string().min(1), page: z.number().int().positive().optional(), checked: isoDate }),
    })
    .optional(),
  /** S4: true when the fund neutralises the currency (מנוטרלת מט"ח). */
  hedged: z.boolean().optional(),
  /**
   * F-92: the fund's return and its tracking asset's in each full calendar year its report prints, in percent, from the
   * report named in `source` (the same as `fees.tracking_difference_12m`). A part year is left out; no full year leaves the field out.
   */
  tracking_record: z
    .strictObject({
      years: z
        .array(
          z.strictObject({
            year: z.number().int().min(1990),
            fund_pct: z.number(),
            tracking_pct: z.number(),
            /**
             * F-92 (b): the fees charged that calendar year, in percent of the fund's average net
             * assets, as an Israeli annual report's table "הוצאות שנפרעו מנכסי הקרן" prints them on `fees_page`: the fixed management fee,
             * the variable management fee (negative when the fund was paid back) and the trustee's fee. A cell printed "-" or "* שיעור זניח"
             * and a row the table does not print are 0. The variable fee stays within the highest category cap, 0.3% either way (ETF-14). Every year of an Israeli record carries it; a foreign document prints no such
             * table, so a foreign record leaves it out and F-92 (b) uses today's listed fees for that year.
             */
            fees_charged: z.strictObject({ fixed: z.number().min(0), variable: z.number().min(-0.3).max(0.3), trustee: z.number().min(0) }).optional(),
          }),
        )
        .min(1),
      /**
       * every full calendar year the report's returns table prints, read off the page in
       * `page`, oldest first. The validator holds `years` to it (data-schema §4 item 17), and where the report's text is in the research
       * library a test reads the page and holds this field to it (packages/pipeline/test/tracking-years-library.test.ts).
       */
      years_printed: z.array(z.number().int().min(1990)).min(1),
      source,
      page: z.number().int().positive().nullable(),
      /** The PDF page of the same report that prints `years[].fees_charged`; required with them (data-schema §4 item 17). */
      fees_page: z.number().int().positive().optional(),
      /** F-92 (b): the PDF page of the same report whose table "שינויים במאפייני הקרן" lists the changes of its fees; required with `fees_page`. */
      changes_page: z.number().int().positive().optional(),
      /**
       * F-92 (b): the day today's listed variable management fee came into force, as that table prints it, or null
       * when it prints no change of the variable fee in the years it covers nor after them. The years charged at today's rate (a whole
       * calendar year from that day on) give the variable fee counted forward. Required on an Israeli record with `fees_page`.
       */
      variable_rate_since: isoDate.nullable().optional(),
      /**
       * the report's footnote to the variable fee says its table prints only the positive fees ("לא מקבל ביטוי
       * בטבלה" for the negative ones), so `fees_charged.variable` may overstate what the fund paid net. No net figure is estimated.
       */
      variable_positive_only: z.literal(true).optional(),
      checked: isoDate,
      /**
       * former ground rule 2: the benchmark the document compares the fund with, by the name it prints, and whether that
       * index counts dividends after the tax withheld at source (`net`), before it (`gross`), or no official document says (`unstated`).
       * Every record carries it, Israeli and foreign alike: a `net` record shows a gap and takes A-07 from its years, a `gross` one only on the list F-92 (d) allows.
       * `source`: the document that says so, when it is not the one in `source` above; `page`: its PDF page; `rule_ids`: the rule that
       * says how the index is computed, where the rule base has one (a Tel Aviv index: ETF-42, ETF-44, ETF-45).
       */
      benchmark: z.strictObject({
        name: z.string().min(1),
        dividends: z.enum(["net", "gross", "unstated"]),
        source: source.optional(),
        page: z.number().int().positive().optional(),
        rule_ids: z.array(z.string()).optional(),
      }),
    })
    .optional(),
  /**
   * A-10: a distributing fund's yield, a value object in `pct_per_year`, and the payments a year the manager prints. The yield is the
   * manager's own 12-month trailing figure, read from its factsheet or page with its date; or, where the manager publishes none, the site's
   * F-132 on the manager's own payments and NAV held in `trailing`, a computed value the data check recomputes. Left out when it was not
   * read: the fund then has no price.
   */
  distribution: z
    .strictObject({
      yield: valueObject,
      per_year: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(6), z.literal(12)]),
      trailing: distributionTrailing.optional(),
    })
    .optional(),
  /**
   * TXF-11: the fund's own Israeli prospectus annex ("נספח לתשקיף קרן חוץ נסחרת") reports a Tax Authority ruling given
   * to the fund, and names a sale and a distribution as the only taxed events. D10 judges that enough for the fund's Tel Aviv line: an
   * accumulating line with it is taxed at sale on the ruling, not on the site's reading of TXF-11 that one without it is ranked on (G-18,
   * D120). The ruling was given to the fund, so the record of its units bought abroad carries it too, but is not run on it: the annex
   * covers the units listed in Tel Aviv, and the engine applies it by kind (`saleOnlyRulingOf`).
   */
  tax_ruling: z
    .strictObject({
      ruling_date: isoDate,
      source,
      /** The PDF pages of the ruling's report, the sale and the distribution. */
      pages: z.strictObject({ ruling: z.number().int().positive(), sale: z.number().int().positive(), distribution: z.number().int().positive() }),
      quote: z.string().min(1),
      checked: isoDate,
      /**
       * TXF-04, F-04, D84: the index of the inflationary amount on a sale by an individual, where the same annex states it under the ruling:
       * the main currency's exchange rate (`main-currency`, with the currency the annex names as the fund's main currency) or the CPI
       * (`cpi`). `page` is the annex's PDF page, `quote` its words on the index and `currency_quote` its words naming the currency, `checked` the date the index was read. It is
       * the fund's statement for its own units, never a rule; only a Tel Aviv line reads it. The data check holds `currency` to the
       * record's own `currency` and the exposure's.
       */
      index: taxRulingIndex.optional(),
    })
    .optional(),
  /**
   * S4, F-109: the price of one unit, read by its unit. On a collected record, the issuer's NAV from its own page in a currency unit (`usd`,
   * `nis`, `eur`), for per-share commissions and for buying whole units; a Tel Aviv line of a foreign fund takes its issuer's NAV of the same
   * share class, which the line's own Israeli document names; never a price from TASE or Maya (the data check refuses one). On a fund the
   * person types, the price they type, dated the day they typed it: abroad in the fund's own currency, on TASE in `agorot`, as TASE quotes
   * a unit (ETF-32, for the foreign funds traded on TASE; no rule yet for Israeli ETFs).
   */
  share_price: valueObject.optional(),
  /**
   * data-schema §3.5, F-65, F-128: the exchange abroad a fund the person types abroad trades on, as they said it (`us`, `europe`), or
   * `unknown` where they said neither it nor the country the fund is registered in. Left out where the exchange follows the domicile: on a
   * collected record, whose tickers and domicile name it (the data check refuses the field there), and on a typed fund whose exchange was
   * not said and whose country was.
   */
  exchange: z.union([fundExchange, z.literal("unknown")]).optional(),
  /** data-schema §3.5: the fund's fees lowered for a stated period (F-121); the data check holds each to its fee. */
  promotions: z.array(fundPromotion).min(1).optional(),
  snapshot: isoDate,
});

export type FundRecord = z.infer<typeof fundRecord>;
export type FundPromotion = z.infer<typeof fundPromotion>;
export type DistributionPayment = z.infer<typeof distributionPayment>;
export type DistributionNav = z.infer<typeof distributionNav>;
export type TaxRulingIndex = z.infer<typeof taxRulingIndex>;

/**
 * Whether a record is a foreign fund's Tel Aviv line (TXF-04's "קרן חוץ", method F-04): a fund domiciled outside Israel that trades on
 * TASE. The one test of that kind, for the engine's run kind and the data check alike.
 */
export const isTaseForeignLine = (rec: Pick<FundRecord, "domicile" | "trading_currency_on_tase">): boolean => rec.domicile !== "IL" && rec.trading_currency_on_tase !== null;
