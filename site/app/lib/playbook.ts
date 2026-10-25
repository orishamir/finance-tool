// The switching playbook (flows 31, 33; design-spec 16.2 `PlaybookStep`, 19): the steps of a wrapper in the order the
// rule base indexes them (`switching-and-transfers.md`, "Playbook order per wrapper"), each rendered from its rule
// records; the post-switch checklist (SW-38); the switching-cost line (F-66) in its forms; the ticks kept on the device.
// No rule text, figure or fee is written here: texts come from `data/rules/` records, figures from their figure files,
// tariffs from the snapshots, and every computed number from the engine. What this file holds is the order, the fixed
// titles of copy.md 8.3 and which sentences of a rule are the "what to sign" / "what to expect" lines. Pure: no storage
// except the tick store at the end, and no fetch.
import {
  buildTariff,
  RecordInputError,
  switchingCost,
  type RunContext,
  type SwitchingCost,
} from "@finance-tool/engine";
import type { FeesSnapshot, RuleRecord, ValueObject } from "@finance-tool/schema";
import { deviceStore } from "./device-store";
import { fundRun, instrumentClassOf, subjectOf, BROKERAGE, ruleContext, type FundAssumptions, type WorkbenchBundle, type WorkbenchInputs } from "./providers";
import { sourceLabel2 } from "./sources";
import { computed, ruleFigure, weaker, type SiteValue, type Strength as VStrength } from "./value";

export type Strength = "primary" | "primary-mirror" | "institution" | "secondary" | "open" | "experience";

// ---------------------------------------------------------------- the step lists (mirrored from the rule base's index)

/** The fixed titles of copy.md 8.3, one per rule (a step with several rules is titled by its first). */
const T = {
  clock: "בדקו את השעון: מתי הכסף נזיל",
  data: "קבלו את הנתונים שלכם מהמסלקה הפנסיונית",
  track: "בחרו את הקופה המקבלת ואת המסלול",
  agent: "הצטרפו ישירות, או דרך סוכן אם תרצו",
  sign: "חתמו על בקשת ההעברה בקופה המקבלת",
  kglRoutes: "לאן אפשר להעביר קופת גמל להשקעה",
  routes: "לאן אפשר להעביר, ואילו כספים",
  inKind: "במזומן או בעין",
  employer: "הודיעו למעסיק לאן להפקיד",
  determining: "המועד הקובע: ההפקדה הראשונה בקופה החדשה",
  rejection: "צפו להודעת דחייה או עיכוב",
  insurance: "ביטוח בפנסיה: הטופס, הכיסוי וחודשי האכשרה",
  blocks: "מה חוסם העברה",
  partial: "העברה חלקית",
  inactive: "חשבונות לא פעילים מתאחדים אוטומטית",
  retention: "שיחת שימור: לא נמצא כלל",
  cancel: "אפשר לבטל עד שהכסף עובר",
  money: "הכסף עובר",
  confirm: "שתי הקופות מאשרות בכתב",
  child: "העברת חיסכון לכל ילד",
  bankRequest: "בקשו את המעבר בבנק הקולט",
  bankInfo: "קראו את דף המידע",
  bankDay: "בחרו יום מעבר; אפשר לבטל",
  bankRetention: "צפו לפנייה לשימור מהבנק המקורי",
  bankLeft: "מה עובר ומה נשאר",
  bankRerouting: "ניתוב התשלומים אחרי המעבר",
  deposit: "פיקדון לא עובר לפני הפדיון",
  brokerOpen: "פתחו חשבון אצל המקבל ובקשו העברה מהמוסד הנוכחי",
  brokerCost: "מה עולה להעביר ניירות ערך",
  brokerTax: "מס במעבר ניירות ערך",
  brokerForeign: "ברוקר זר: לא נמצא תהליך",
  verify: "בדקו אחרי המעבר",
} as const;

export interface StepSpec {
  title: string;
  /** The rules the step renders; the first names the title. */
  ruleIds: string[];
  /** Experience entries (SW-X) shown inside the step, labelled. */
  experience?: string[];
  /** SW-19: the step says no rule was found; `known` are the sourced rules under it. */
  noRule?: { known: string[] };
  /** The rule's open questions the step rests on (the lock lines). */
  openQuestions?: string[];
  /** The SW-38 step: the checklist. */
  verify?: boolean;
  /** The record-your-offer card sits before this step. */
  offerBefore?: boolean;
}

const s = (title: string, ruleIds: string[], more: Partial<StepSpec> = {}): StepSpec => ({ title, ruleIds, ...more });
const retention = s(T.retention, ["SW-19"], { noRule: { known: ["SW-07", "PF-13", "PF-14"] }, experience: ["SW-X01", "SW-X02"], openQuestions: ["SW OQ3"], offerBefore: true });
const verify = s(T.verify, ["SW-38"], { verify: true });
const data = s(T.data, ["SW-18", "SW-44"], { openQuestions: ["SW OQ5"] });
const agent = s(T.agent, ["SW-17"], { experience: ["SW-X04"], openQuestions: ["SW OQ16"] });
const employer = s(T.employer, ["SW-10"], { openQuestions: ["SW OQ6"] });
const money = s(T.money, ["SW-06", "SW-42"]);

/** The step list of each wrapper that has one. Where the index says "the same order, adding …", the added steps sit where their subject comes (chosen 2026-10-24, revisable). */
export const STEP_LISTS: Record<string, StepSpec[]> = {
  "keren-hishtalmut": [
    s(T.clock, ["KH-10", "KH-14"]),
    data,
    s(T.track, ["SW-16"]),
    agent,
    s(T.sign, ["SW-02", "SW-03", "SW-20"]),
    employer,
    s(T.determining, ["SW-04"]),
    s(T.rejection, ["SW-05"]),
    retention,
    s(T.cancel, ["SW-07"]),
    money,
    s(T.confirm, ["SW-09"]),
    verify,
  ],
  "pension-comprehensive": pensionOrder(true),
  "pension-general": pensionOrder(true),
  // the pension order without the insurance step (SW-23); SW-22 is about pension funds' inactive accounts and is left out
  "provident-for-annuity": [s(T.routes, ["SW-23"]), ...pensionOrder(false).filter((x) => x.ruleIds[0] !== "SW-22")],
  "kupat-gemel-lehashkaa": [
    s(T.kglRoutes, ["SW-21"], { openQuestions: ["SW OQ2"] }),
    s(T.sign, ["SW-02", "SW-03"], { openQuestions: ["SW OQ2"] }),
    s(T.determining, ["SW-04", "SW-08"]),
    s(T.rejection, ["SW-05"]),
    retention,
    s(T.cancel, ["SW-07"]),
    money,
    s(T.confirm, ["SW-09"]),
    verify,
  ],
  "ira-provident": iraOrder(),
  "ira-hishtalmut": iraOrder(),
  "child-savings-provident": [s(T.child, ["SW-25"])],
  "child-savings-bank": [s(T.child, ["SW-25"])],
  "current-account": [
    s(T.bankRequest, ["SW-26", "SW-43"], { openQuestions: ["SW OQ9"] }),
    s(T.bankInfo, ["SW-31"]),
    s(T.bankDay, ["SW-27"]),
    s(T.bankRetention, ["SW-28"], { offerBefore: true }),
    s(T.bankLeft, ["SW-29"]),
    s(T.bankRerouting, ["SW-30"]),
    verify,
  ],
  "bank-deposit": [s(T.deposit, ["SW-32"])],
  "brokerage-account": [
    s(T.brokerOpen, ["SW-35"], { offerBefore: true }),
    s(T.brokerCost, ["SW-33", "SW-34"], { openQuestions: ["SW OQ10"] }),
    s(T.brokerTax, ["SW-36"], { openQuestions: ["SW OQ11"] }),
    s(T.brokerForeign, ["SW-37"], { experience: ["SW-X03"], openQuestions: ["SW OQ12"] }),
    verify,
  ],
};

function pensionOrder(withInsurance: boolean): StepSpec[] {
  return [
    data,
    s(T.track, ["SW-16"]),
    agent,
    s(T.blocks, ["SW-13"]),
    s(T.partial, ["SW-14"]),
    s(T.sign, ["SW-02", "SW-03"]),
    ...(withInsurance ? [s(T.insurance, ["SW-12"])] : []),
    employer,
    s(T.determining, ["SW-04"]),
    s(T.rejection, ["SW-05"]),
    retention,
    s(T.cancel, ["SW-07"]),
    money,
    s(T.confirm, ["SW-09"]),
    s(T.inactive, ["SW-22"]),
    verify,
  ];
}

function iraOrder(): StepSpec[] {
  return [
    s(T.routes, ["SW-01", "SW-23"]),
    s(T.inKind, ["SW-24"]),
    s(T.sign, ["SW-02", "SW-03"]),
    s(T.determining, ["SW-04", "SW-08"]),
    s(T.rejection, ["SW-05"]),
    s(T.cancel, ["SW-07"]),
    s(T.money, ["SW-06"]),
    s(T.confirm, ["SW-09"]),
  ];
}

export const playbookWrappers = Object.keys(STEP_LISTS);

/** Every rule the page may render or cite, for the provenance cards and the engine's rule book. */
export function playbookRuleIds(wrapperId: string): string[] {
  const out = new Set<string>(["SW-38", "SW-36", "SW-39", "SW-40", "SW-41", "SW-42", "SW-44", "PF-16", "PF-14", "SW-15", "PF-13", "PF-18", "KH-17", "TXK-04", "TXH-17", "TXH-19", "PF-19", "PF-23"]);
  for (const st of STEP_LISTS[wrapperId] ?? []) {
    st.ruleIds.forEach((r) => out.add(r));
    st.experience?.forEach((r) => out.add(r));
    st.noRule?.known.forEach((r) => out.add(r));
  }
  return [...out];
}

// ---------------------------------------------------------------- what a step shows

/** Sentences of a rule that are the "what to sign" and "what to expect" lines (copy.md 8.3: rendered from the rule's text, never typed). */
const SIGN: Record<string, RegExp[]> = { "SW-02": [/נספח א׳/], "SW-03": [/ברירת המחדל/, /מצהיר/], "SW-07": [/נספח ו׳/] };
const EXPECT: Record<string, RegExp[]> = { "SW-05": [/נספח ה׳/], "SW-09": [/^הקופה (המעבירה|המקבלת) שולחת/] };
/** A sentence a later rule closed (SW-44 sourced the clearing house's price after SW-18's text was written); not shown. The text of SW-18 is to be updated in the rule base. */
const HIDE: Record<string, RegExp[]> = { "SW-18": [/מחירון המסלקה/] };

/** A sentence about the study fund alone (SW-03's "no partial transfer from a keren hishtalmut") is not shown on another wrapper's page (B14). */
const ONLY_FOR: Record<string, { re: RegExp; wrappers: string[] }[]> = { "SW-03": [{ re: /^בקרן השתלמות/, wrappers: ["keren-hishtalmut", "ira-hishtalmut"] }] };

export const sentences = (text: string): string[] => text.split(/(?<=[.!?])\s+/u).filter(Boolean);

/**
 * Where the copy a `primary-mirror` rule is read on is hosted, named from its own copy sources; null when they name none.
 * Until 2026-10-25 this was a fixed table of the switching rules' hosts, which went stale when the source check moved
 * those rules onto official texts.
 */
export function hostOf(rule: RuleRecord): string | null {
  const names = (rule.sources ?? []).filter((s) => s.strength === "primary-mirror").map((s) => sourceLabel2(s).mirror);
  const unique = [...new Set(names.filter((n): n is string => !!n))];
  return unique.length ? unique.join(", ") : null;
}

export interface StepText {
  ruleId: string;
  /** The rule's text less the sentences that moved to the labelled lines; absent when the record has none. */
  text?: string;
  title: string;
  strength: Strength;
  /** The mirror's host for `primary-mirror`. */
  host?: string;
  checked: string;
}

export interface StepFigure {
  label: string;
  value: SiteValue | null;
  ruleId: string;
  /** `within` is the deadline wording ("בתוך N ימי עסקים"); `plain` is label and number. */
  form: "within" | "plain";
}

export interface ExperienceEntry {
  id: string;
  text: string;
  /** The source line's parts: forum, thread, the thread's date, the day the site read it. */
  source: { forum: string; thread: string; threadDate: string; read: string } | { raw: string; read: string };
}

export interface PlaybookStep {
  n: number;
  title: string;
  ruleIds: string[];
  text: StepText[];
  sign: { ruleId: string; text: string }[];
  expect: { ruleId: string; text: string }[];
  figures: StepFigure[];
  openQuestions: string[];
  noRule?: { known: { ruleId: string; title: string; strength: Strength }[] };
  experience: ExperienceEntry[];
  /** Every text is an institution's. */
  institutionOnly: boolean;
  /** The weakest strength among the texts (the chip). */
  strength: Strength;
  verify: boolean;
  offerBefore: boolean;
  /** A rule of the step is `open` in the bundle: the step carries no process claim. */
  open: boolean;
}

/** Figures each rule's step shows: the figure file, the key, and whether it reads as a deadline. The deadlines the circular sets are read from SW-41 (the CMA's own copy), the clearing house's from SW-42. */
const FIGURES: Record<string, { from: string; key: string; form: "within" | "plain" }[]> = {
  "SW-04": [{ from: "SW-41", key: "forward_request", form: "within" }],
  "SW-08": [{ from: "SW-41", key: "lapse_active", form: "plain" }, { from: "SW-41", key: "lapse_inactive", form: "plain" }],
  "SW-05": [{ from: "SW-41", key: "rejection_notice", form: "within" }],
  "SW-06": [{ from: "SW-42", key: "transfer_deadline", form: "within" }, { from: "SW-42", key: "max_deferral", form: "plain" }],
  "SW-07": [{ from: "SW-41", key: "return_after_cancellation", form: "within" }],
  "SW-09": [{ from: "SW-41", key: "member_confirmations", form: "within" }],
  "SW-10": [{ from: "SW-41", key: "employer_notice", form: "within" }],
  "SW-12": [{ from: "SW-12", key: "supplement_increase_no_carry_threshold_pct", form: "plain" }, { from: "SW-12", key: "notional_deposit_lookback_months", form: "plain" }],
  "SW-18": [{ from: "SW-44", key: "saver_one_time_all_institutions", form: "plain" }, { from: "SW-18", key: "leumi_report_available_months", form: "plain" }],
  "SW-24": [{ from: "SW-24", key: "meitav_israeli_security_transfer_nis", form: "plain" }, { from: "SW-24", key: "meitav_portfolio_transfer_cap_nis", form: "plain" }],
  "SW-27": [{ from: "SW-27", key: "completion_max_business_days", form: "within" }, { from: "SW-27", key: "cancel_until_business_day", form: "plain" }],
  "SW-28": [{ from: "SW-28", key: "benefits_kept_min_months", form: "plain" }],
  "SW-30": [{ from: "SW-30", key: "rerouting_years", form: "plain" }, { from: "SW-30", key: "rerouting_update_interval_months", form: "plain" }, { from: "SW-30", key: "stop_rerouting_business_days", form: "plain" }],
  "SW-32": [{ from: "SW-32", key: "in_force_from", form: "plain" }],
  "SW-33": [{ from: "SW-33", key: "closing_transfer_cap", form: "plain" }],
  "SW-35": [{ from: "SW-35", key: "israeli_securities_trading_days", form: "plain" }, { from: "SW-35", key: "foreign_securities_trading_days", form: "plain" }],
  "SW-43": [{ from: "SW-43", key: "start", form: "plain" }],
};

const order: Record<Strength, number> = { primary: 0, "primary-mirror": 1, institution: 2, secondary: 3, experience: 3, open: 4 };
const weakestOf = (xs: Strength[]): Strength => xs.reduce((a, b) => (order[b] > order[a] ? b : a), "primary" as Strength);

/** The forum, thread and thread date out of an experience record's English title ("… (Hasolidit thread .36841, 15/7/26)"). */
export function experienceSource(title: string, checked: string): ExperienceEntry["source"] {
  const m = /\((\w+) thread (\.\d+), (\d+\/\d+\/\d+)[^)]*\)\s*$/.exec(title);
  if (m) return { forum: m[1]!, thread: m[2]!, threadDate: m[3]!, read: checked };
  const last = /\(([^)]*)\)\s*$/.exec(title);
  return { raw: last ? last[1]! : title, read: checked };
}

export function buildSteps(rules: Record<string, RuleRecord>, wrapperId: string, today: string): PlaybookStep[] {
  const list = STEP_LISTS[wrapperId] ?? [];
  return list.map((spec, i) => {
    const sign: PlaybookStep["sign"] = [];
    const expect: PlaybookStep["expect"] = [];
    const text: StepText[] = spec.ruleIds.map((id) => {
      const r = rules[id];
      if (!r) return { ruleId: id, title: id, strength: "open" as Strength, checked: today };
      let body = r.text_he;
      if (body) {
        const rest: string[] = [];
        for (const sent of sentences(body)) {
          if ((HIDE[id] ?? []).some((re) => re.test(sent))) continue;
          if ((ONLY_FOR[id] ?? []).some((o) => o.re.test(sent) && !o.wrappers.includes(wrapperId))) continue;
          if ((SIGN[id] ?? []).some((re) => re.test(sent))) sign.push({ ruleId: id, text: sent });
          else if ((EXPECT[id] ?? []).some((re) => re.test(sent))) expect.push({ ruleId: id, text: sent });
          else rest.push(sent);
        }
        body = rest.join(" ");
      }
      return { ruleId: id, ...(body ? { text: body } : {}), title: r.title_he ?? r.title, strength: r.strength, ...(r.strength === "primary-mirror" && hostOf(r) ? { host: hostOf(r)! } : {}), checked: r.checked };
    });
    const figures: StepFigure[] = spec.ruleIds.flatMap((id) =>
      (FIGURES[id] ?? []).map((f) => {
        const src = rules[f.from];
        const label = src?.figure_names_he?.[f.key] ?? f.key;
        return { label, value: src ? ruleFigure(src, f.key, today) : null, ruleId: f.from, form: f.form };
      }),
    );
    const experience: ExperienceEntry[] = (spec.experience ?? []).flatMap((id) => {
      const r = rules[id];
      return r?.text_he ? [{ id, text: r.text_he, source: experienceSource(r.title, r.checked) }] : [];
    });
    const strengths = text.map((t) => t.strength);
    return {
      n: i + 1,
      title: spec.title,
      ruleIds: spec.ruleIds,
      text,
      sign,
      expect,
      figures,
      openQuestions: spec.openQuestions ?? [],
      ...(spec.noRule ? { noRule: { known: spec.noRule.known.flatMap((id) => (rules[id] ? [{ ruleId: id, title: rules[id]!.title_he ?? rules[id]!.title, strength: rules[id]!.strength as Strength }] : [])) } } : {}),
      experience,
      institutionOnly: text.length > 0 && text.every((t) => t.strength === "institution"),
      strength: weakestOf(strengths),
      verify: !!spec.verify,
      offerBefore: !!spec.offerBefore,
      open: strengths.includes("open"),
    };
  });
}

// ---------------------------------------------------------------- the summary box (audit 2026-10-24, A56)

export type SummaryTopic = "time" | "cost" | "sign" | "cancel" | "notice" | "lose" | "partial" | "check" | "route" | "tax";

export interface SummaryItem {
  topic: SummaryTopic;
  ruleId: string;
  /** The rule's own sentence, whole and verbatim; nothing is written for the box. */
  text: string;
}

/** Which sentence of which rule: `from` is how the sentence starts. Every rule is one the wrapper's steps already render. */
interface SummarySpec {
  topic: SummaryTopic;
  ruleId: string;
  from: string;
}

const sp = (topic: SummaryTopic, ruleId: string, from: string): SummarySpec => ({ topic, ruleId, from });
const commonSummary = {
  time: sp("time", "SW-42", "הקופה המעבירה חייבת להעביר"),
  cost: sp("cost", "SW-06", "אין עמלת העברה"),
  sign: sp("sign", "SW-02", "העמית חותם בעצמו"),
  cancel: sp("cancel", "SW-03", "הודעה מודגשת"),
  notice: sp("notice", "SW-04", "לעמית פעיל המועד הקובע"),
};
// 2026-10-24 (review): the notice sentence (SW-04) comes before the time sentence (SW-42); the pension check is SW-38's
// "both confirmations in writing" sentence, the insurance check stays in the checklist (SW-38 items below)
const pensionSummary: SummarySpec[] = [
  commonSummary.notice,
  commonSummary.time,
  commonSummary.cost,
  sp("lose", "SW-12", "חודשי הביטוח הרצופים"),
  sp("partial", "SW-14", "ברירת המחדל בטופס"),
  commonSummary.sign,
  commonSummary.cancel,
  sp("check", "SW-38", "שני האישורים בכתב"),
];

/** The summary box's sentences per wrapper: the cost, the time, what the person loses, where to sign, what to check after. */
export const SUMMARY_SPECS: Record<string, SummarySpec[]> = {
  "pension-comprehensive": pensionSummary,
  "pension-general": pensionSummary,
  // no insurance step on this page (SW-23's order), so the summary has no insurance sentence
  "provident-for-annuity": [commonSummary.notice, commonSummary.time, commonSummary.cost, sp("partial", "SW-14", "ברירת המחדל בטופס"), commonSummary.sign, commonSummary.cancel, sp("check", "SW-38", "שני האישורים בכתב")],
  "keren-hishtalmut": [
    commonSummary.notice,
    commonSummary.time,
    commonSummary.cost,
    sp("route", "SW-20", "קרן השתלמות עוברת רק בשלמותה"),
    commonSummary.sign,
    commonSummary.cancel,
    sp("check", "SW-38", "שני האישורים בכתב"),
  ],
  "kupat-gemel-lehashkaa": [
    commonSummary.time,
    commonSummary.cost,
    sp("route", "SW-21", "הכסף עובר רק לקופת גמל להשקעה אחרת"),
    sp("tax", "SW-21", "החלפת מסלול והעברה בין קופות גמל להשקעה"),
    commonSummary.sign,
    commonSummary.cancel,
    sp("check", "SW-38", "שני האישורים בכתב"),
  ],
};

/** The sentences of the summary: each is a whole sentence of a rule the wrapper's steps render; one that cannot be found is left out. */
export function buildSummary(rules: Record<string, RuleRecord>, wrapperId: string): SummaryItem[] {
  const out: SummaryItem[] = [];
  for (const spec of SUMMARY_SPECS[wrapperId] ?? []) {
    const text = sentences(rules[spec.ruleId]?.text_he ?? "").find((x) => x.startsWith(spec.from));
    if (text) out.push({ topic: spec.topic, ruleId: spec.ruleId, text });
  }
  return out;
}

// ---------------------------------------------------------------- the post-switch checklist (SW-38)

export interface ChecklistItem {
  id: string;
  /** A clause of SW-38's own text (lib/playbook.test.ts checks each is a substring of it). */
  text: string;
  ruleIds: string[];
  wrappers: string[];
}

const provident = ["keren-hishtalmut", "kupat-gemel-lehashkaa", "pension-comprehensive", "pension-general", "provident-for-annuity"];
const pensions = ["pension-comprehensive", "pension-general"];

export const CHECKLIST: ChecklistItem[] = [
  { id: "confirmations", text: "שני האישורים בכתב מגיעים בתוך ימי העסקים שהחוזר קובע, ומראים את הסכום לפי מרכיבים, את המועד הקובע ואת היתרה שנשארה", ruleIds: ["SW-09"], wrappers: provident },
  { id: "fee", text: "דמי הניהול בחשבון החדש תואמים את ההצעה, והנחה מופיעה באזור האישי עם תאריכי התחלה וסיום ונשלחת בדוא״ל כשהוא ידוע", ruleIds: ["PF-16"], wrappers: provident },
  { id: "track", text: "המסלול הוא זה שנבחר ולא ברירת המחדל", ruleIds: ["SW-16"], wrappers: provident },
  { id: "insurance", text: "מסלול הביטוח והכיסוי, התנאים וההחרגות בנספח ב׳, ושחודשי האכשרה עברו", ruleIds: ["SW-12"], wrappers: pensions },
  { id: "employer", text: "המעסיק מפקיד לקופה החדשה, שאחרת בקשה של עמית פעיל פוקעת", ruleIds: ["SW-08", "SW-10"], wrappers: ["keren-hishtalmut", ...pensions, "provident-for-annuity"] },
  { id: "first-payment", text: "מועד התשלום הראשון עבר", ruleIds: ["SW-11", "KH-14"], wrappers: ["keren-hishtalmut"] },
  { id: "orders", text: "הוראות קבע והרשאות לחיוב מגיעות לחשבון החדש", ruleIds: ["SW-30"], wrappers: ["current-account"] },
  { id: "rerouting", text: "העדכון החצי שנתי על הניתוב מונה את המשלמים", ruleIds: ["SW-30"], wrappers: ["current-account"] },
  { id: "left-behind", text: "פיקדונות וניירות שלא ניתנים להעברה שנשארו בבנק הישן רשומים", ruleIds: ["SW-29"], wrappers: ["current-account"] },
  { id: "residual-fees", text: "לא נגבות עמלות על חשבון תמורה", ruleIds: ["SW-29"], wrappers: ["current-account"] },
  { id: "arrived", text: "כל נייר הגיע", ruleIds: ["SW-36"], wrappers: ["brokerage-account"] },
  { id: "basis", text: "עלות הרכישה וההפסדים להעברה רשומים אצל המקבל", ruleIds: ["SW-36"], wrappers: ["brokerage-account"] },
];

export const checklistFor = (wrapperId: string): ChecklistItem[] => CHECKLIST.filter((c) => c.wrappers.includes(wrapperId));

// ---------------------------------------------------------------- the address

export interface PlaybookQuery {
  from: string | null;
  to: string | null;
  fundFrom: string | null;
  fundTo: string | null;
  /** A hishtalmut moved in part (percent of the balance, 1 to 99); null means the whole balance. */
  share: number | null;
}

export function parsePlaybookQuery(search: string): PlaybookQuery {
  const q = new URLSearchParams(search);
  const get = (k: string) => q.get(k) || null;
  const share = Number(q.get("share"));
  return { from: get("from"), to: get("to"), fundFrom: get("fundFrom"), fundTo: get("fundTo"), share: Number.isFinite(share) && share >= 1 && share < 100 ? share : null };
}

export function playbookQueryString(q: PlaybookQuery): string {
  const p = new URLSearchParams();
  if (q.from) p.set("from", q.from);
  if (q.to) p.set("to", q.to);
  if (q.fundFrom) p.set("fundFrom", q.fundFrom);
  if (q.fundTo) p.set("fundTo", q.fundTo);
  if (q.share !== null) p.set("share", String(q.share));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export interface Side {
  kind: "company" | "holding";
  id: string;
  name: string;
  /** A holding's wrapper (a pair across kinds is not evaluated). */
  wrapperId?: string;
}

// ---------------------------------------------------------------- the switching cost (F-66)

export const PROVIDENT_WRAPPER_IDS = ["kupat-gemel-lehashkaa", "keren-hishtalmut", "pension-comprehensive", "pension-general", "provident-for-annuity"] as const;
type ProvidentWrapper = (typeof PROVIDENT_WRAPPER_IDS)[number];
export const isProvident = (w: string): w is ProvidentWrapper => (PROVIDENT_WRAPPER_IDS as readonly string[]).includes(w);

/** The rules that say a switch costs nothing, per wrapper (design-system 8.6): the tax rules of the wrapper, PF-19 (no transfer fee) and PF-23 (a track switch). */
const COST_RULES: Record<ProvidentWrapper, string[]> = {
  "kupat-gemel-lehashkaa": ["TXK-04", "PF-19", "PF-23"],
  "keren-hishtalmut": ["TXH-17", "TXH-19", "PF-19", "PF-23"],
  "pension-comprehensive": ["PF-19", "PF-23"],
  "pension-general": ["PF-19", "PF-23"],
  "provident-for-annuity": ["PF-19", "PF-23"],
};

export function providentCost(args: { wrapperId: ProvidentWrapper; fromWrapper: ProvidentWrapper; sameCompany: boolean; share: number | null; rules: RuleRecord[]; today: string }): SwitchingCost {
  const side = (wrapper: ProvidentWrapper) => ({
    kind: "provident" as const,
    wrapper,
    move: args.sameCompany ? ("track-switch" as const) : ("fund-transfer" as const),
    ruleIds: COST_RULES[wrapper],
    ...(wrapper === "keren-hishtalmut" ? { wholeOnlyRuleIds: ["PF-18", "KH-17"], share: args.share === null ? 1 : args.share / 100 } : {}),
  });
  return switchingCost(side(args.fromWrapper), side(args.wrapperId), 1, { rules: args.rules, runDate: args.today });
}

export type BrokerageCostResult =
  | {
      kind: "ok";
      cost: SiteValue;
      taxAtSwitch: SiteValue;
      netProceeds: SiteValue;
      realNoSwitch: SiteValue;
      realWithSwitch: SiteValue;
      secondary: boolean;
      from: { name: string };
      to: { name: string };
    }
  | { kind: "error"; code: "no-fund" | "need-rate" | "need-yield" | "fund-type" | "other-currency" | "no-tariff" | "engine"; detail?: string };

const isIls = (c: string) => c === "NIS" || c === "ILS";

/** A broker's list tariff for an instrument class, as `tariffFor` of the fund-variant page builds it (the chosen provider, else P-05's). */
function tariffFor(wb: WorkbenchBundle, wanted: string | null, instrumentClass: string, currency: string | null) {
  const p05Tariff = ((wb.p05.instruments ?? {})[BROKERAGE] ?? {}).tariff as string | undefined;
  const ids = [wanted, p05Tariff].filter((x, i, a): x is string => !!x && a.indexOf(x) === i);
  for (const id of ids) {
    const snap: FeesSnapshot | undefined = wb.snapshots.find((x) => x.id === id && (x.provider.class === "bank" || x.provider.class === "broker"));
    if (!snap || snap.missing) continue;
    const base = { goal: { amountNow: 0, monthly: 0, months: 12 }, market: { grossReturn: 0, inflation: 0 }, fund: { kind: "israeli-fund" as const }, profile: {}, instrumentClass, channel: "direct", theta: 0, behaviour: { ordersPerMonth: 1 }, providers: [] };
    const attempt = (c: string | null) => buildTariff({ ...base, ...(c ? { currency: { code: c, startRate: 1 } } : {}) } as never, { snapshot: snap, level: "list" }, snap).tariff;
    try {
      const t = currency && !isIls(currency) ? attempt(currency) : attempt(null);
      const { currency: _c, ...rest } = t as typeof t & { currency?: unknown };
      void _c;
      return { id, tariff: rest };
    } catch (e) {
      if (!(e instanceof RecordInputError)) throw e;
      try {
        const { currency: _c, ...rest } = attempt(null) as ReturnType<typeof attempt> & { currency?: unknown };
        void _c;
        return { id, tariff: rest };
      } catch (e2) {
        if (!(e2 instanceof RecordInputError)) throw e2;
      }
    }
  }
  return null;
}

/** F-66 for two brokerage funds, a sale `atMonth` after the start (the person is deciding now: month 1, chosen 2026-10-24, revisable). */
export function brokerageCost(args: { wb: WorkbenchBundle; fundFrom: string; fundTo: string; providerId: string | null; inputs: WorkbenchInputs; assumptionsFrom: FundAssumptions; assumptionsTo: FundAssumptions; atMonth?: number }): BrokerageCostResult {
  const { wb, inputs } = args;
  const A = subjectOf(wb, args.fundFrom);
  const B = subjectOf(wb, args.fundTo);
  if (!A || !B) return { kind: "error", code: "no-fund" };
  const runA = fundRun(A, wb.exposures.find((e) => e.id === A.exposureId), inputs.grossReturn, args.assumptionsFrom, wb.fx);
  if ("kind" in runA) return { kind: "error", code: runA.kind === "need-rate" ? "need-rate" : runA.kind === "need-yield" ? "need-yield" : runA.kind === "other-currency" ? "other-currency" : "fund-type", ...(runA.kind === "need-rate" ? { detail: runA.currency } : {}) };
  const runB = fundRun(B, wb.exposures.find((e) => e.id === B.exposureId), inputs.grossReturn, args.assumptionsTo, wb.fx);
  if ("kind" in runB) return { kind: "error", code: runB.kind === "need-rate" ? "need-rate" : runB.kind === "need-yield" ? "need-yield" : runB.kind === "other-currency" ? "other-currency" : "fund-type", ...(runB.kind === "need-rate" ? { detail: runB.currency } : {}) };
  const tA = tariffFor(wb, args.providerId, A.instrumentClass, A.currency);
  const tB = tariffFor(wb, args.providerId, B.instrumentClass, B.currency);
  if (!tA || !tB) return { kind: "error", code: "no-tariff" };
  const profile: { ageAtStart?: number; annualIncome?: number } = {};
  if (inputs.age !== null) profile.ageAtStart = inputs.age;
  if (inputs.income !== null && inputs.income > 0) profile.annualIncome = inputs.income;
  const ctx: RunContext = ruleContext(wb);
  try {
    const input = {
      goal: { amountNow: inputs.amountNow, monthly: inputs.monthly, months: 12 * inputs.years },
      market: { ...runA.market, inflation: inputs.inflation },
      fund: runA.fund,
      tariff: { ...tA.tariff, ...(runA.currency ? { currency: runA.currency } : {}) },
      profile,
      ordersPerMonth: 1,
    };
    const r = switchingCost(
      { kind: "brokerage", input: input as never },
      { kind: "brokerage", fund: runB.fund, market: { ...runB.market, inflation: inputs.inflation }, tariff: { ...tB.tariff, ...(runB.currency ? { currency: runB.currency } : {}) } as never },
      args.atMonth ?? 1,
      ctx,
    );
    if (r.kind !== "brokerage") return { kind: "error", code: "engine", detail: r.kind };
    // every rule the three runs read, with the weakest strength each carried (B1): the cost is a computed value the sheet can open
    const read = new Map<string, VStrength>();
    for (const run of [r.runs.noSwitch, r.runs.legA, r.runs.legB]) {
      for (const u of run.rules) {
        const own = u.figures.reduce<VStrength>((w, f) => weaker(w, f.strength as VStrength) ?? w, u.strength as VStrength);
        read.set(u.id, weaker(read.get(u.id), own) ?? own);
      }
    }
    const rules = [...read].map(([id, strength]) => ({ id, strength }));
    const flags = r.flags.map((f) => f.code);
    const opts = { today: wb.today, rules, flags, about: "מעבר בין שתי קרנות" };
    const realNoSwitch = computed(r.realNoSwitch, "nis", "F-66", {}, { ...opts, about: "הערך בלי מעבר, בכסף של היום" });
    const realWithSwitch = computed(r.realWithSwitch, "nis", "F-66", {}, { ...opts, about: "הערך עם המעבר, בכסף של היום" });
    const taxAtSwitch = computed(r.taxAtSwitch, "nis", "F-66", {}, { ...opts, about: "מס במכירה במעבר" });
    const netProceeds = computed(r.netProceeds, "nis", "F-66", {}, { ...opts, about: "התמורה אחרי המס שפותחת את הקרן החדשה" });
    const atMonth = computed(r.atMonth, "months", "F-66", {}, { today: wb.today, about: "החודש שבו המעבר נעשה" });
    const cost: SiteValue = {
      ...computed(r.cost.value as number, "nis", "F-66", { "הערך בלי מעבר": realNoSwitch, "הערך עם המעבר": realWithSwitch, "מס במכירה במעבר": taxAtSwitch, "חודש המעבר": atMonth }, { ...opts, about: "מה המעבר עולה, בכסף של היום" }),
      rule_ids: rules.map((x) => x.id),
    };
    return {
      kind: "ok",
      cost,
      taxAtSwitch,
      netProceeds,
      realNoSwitch,
      realWithSwitch,
      secondary: r.outcome.code === "listed-not-ranked",
      from: { name: A.name },
      to: { name: B.name },
    };
  } catch (e) {
    return { kind: "error", code: "engine", detail: e instanceof Error ? e.message : String(e) };
  }
}

/** The transfer-out line a provider's tariff prints for moving securities (SW-33, SW-34): one value when every list line agrees, else none ("לא נאסף"). */
export function transferFeeOf(wb: WorkbenchBundle, providerId: string | null): ValueObject | null {
  const snap = wb.snapshots.find((x) => x.id === providerId);
  if (!snap) return null;
  const lines = snap.lines.filter((l) => l.base === "transfer_out" && l.level === "list");
  const first = lines[0];
  if (!first || lines.some((l) => l.rate.value !== first.rate.value || l.rate.unit !== first.rate.unit)) return null;
  return first.rate;
}

// ---------------------------------------------------------------- ticks kept on the device

export const TICKS_KEY = "mekor.v2.playbook-ticks";

/**
 * Ticks are keyed by the wrapper alone (audit 2026-10-24, A32): picking or clearing "מאיפה/לאן" never loses them. The ticked
 * items are about the person's own switch of that wrapper, not about one provider pair. The pair arguments are kept for the
 * callers that still pass them and are ignored.
 */
export const tickKey = (wrapperId: string, _from?: string | null, _to?: string | null) => wrapperId;

/** A key written by the old keying (`wrapper|from|to`) folds into its wrapper's key, as a union of the ids; the old key goes. */
export function migrateTickKeys(byKey: Record<string, string[]>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [k, ids] of Object.entries(byKey)) {
    const wrapper = k.split("|")[0]!;
    out[wrapper] = [...new Set([...(out[wrapper] ?? []), ...ids])];
  }
  return out;
}

/** The store holds a key of the old shape (so the page rewrites it once). */
export const hasOldTickKeys = (byKey: Record<string, string[]>) => Object.keys(byKey).some((k) => k.includes("|"));

function parseTicks(raw: unknown): Record<string, string[]> {
  if (typeof raw !== "object" || raw === null || (raw as { version?: unknown }).version !== 1) return {};
  const by = (raw as { byKey?: unknown }).byKey;
  if (typeof by !== "object" || by === null) return {};
  const out: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(by)) if (Array.isArray(v) && v.every((x) => typeof x === "string")) out[k] = v as string[];
  return migrateTickKeys(out);
}

/**
 * FOUNDER NOTE (design-spec 16.5, flow 31 step 6): product.md 3.9 lists 3.2, 3.4, 3.5 and 3.6 as the saved inputs, not 3.7;
 * the checklist ticks are an addition to that list.
 * TODO(state v3): `StateV3.playbook` (design-spec 16.5) holds these; merge into `mekor.v3.state`, the export file and the
 * import's union when lib/state.ts is free. Nothing outside this file reads the key.
 */
export const ticksStore = deviceStore<Record<string, string[]>>(TICKS_KEY, {}, parseTicks, (v) => ({ version: 1, byKey: v }));
