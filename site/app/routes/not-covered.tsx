// The "not covered yet" page (flows 6.13, product D2 and D69): the kinds of saving the site knows of and has no guide page for
// yet, one row each (`notCoveredCards`, never every row of the glossary's section 3). A row says what the kind is, with its
// source a tap away, and the open question that keeps it from a guide; one fold holds the rest of what is known. Built from the
// rule base and the open questions, never typed. Each row's id is the anchor the search and other pages link to.
import { useLoaderData } from "react-router";
import { notCovered as copy, provenance } from "../copy";
import { pageMeta, type MetaPlace } from "../lib/page-meta";
import { Tpl } from "../components/exposure-mode/tpl";
import { RuleRef, RulesChip, RulesLine, StrengthLabel } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Disclosure, DocLink, LinkButton, RowList, gershayim, When } from "../components/kit";
import type { GraduationStatusView } from "../lib/graduation.server";
import type { NotCoveredRow } from "../lib/data.server";
import { sourceHref } from "../lib/sources";
import { sourceLabel } from "../lib/source-label";

export async function loader() {
  const { loadOpenQuestions, loadRules, pointedRecords, today } = await import("../lib/data.server");
  const { graduationStatuses, graduationRuleIds, notCoveredCards } = await import("../lib/graduation.server");
  const rules = loadRules();
  const statuses = graduationStatuses();
  // one row per kind of holding the site lacks (product D2), never a glossary section's every row
  const cards = notCoveredCards(statuses).filter((c) => c.status.status !== "graduated");
  const cited = new Set([...cards.flatMap((c) => c.row.ruleIds), ...graduationRuleIds(statuses)]);
  const mine = Object.fromEntries(Object.values(rules).filter((r) => cited.has(r.id)).map((r) => [r.id, r]));
  // each open question in its own words (the guard in not-covered.test.ts keeps every one titled)
  const questions = loadOpenQuestions();
  const titles = Object.fromEntries(cards.flatMap((c) => c.status.open.map((o) => [o.code, questions[o.code]?.title_he ?? ""])));
  return { cards, titles, rules: mine, pointed: pointedRecords(mine, rules), today: today() };
}

export function meta({ location }: MetaPlace) {
  return pageMeta({ title: copy.title, description: copy.lede, location });
}

/** Why the row has no guide yet: the one open question in its words, how many when there are several, or what is left. */
function OpenLine({ s, titles }: { s: GraduationStatusView; titles: Record<string, string> }) {
  const text =
    s.open.length === 1 ? (
      <Tpl t={copy.openOne} vars={{ question: titles[s.open[0]!.code] ?? "" }} />
    ) : s.open.length > 1 ? (
      <Tpl t={copy.openMany} vars={{ n: <bdi dir="ltr">{s.open.length}</bdi> }} />
    ) : (
      <Tpl t={copy.remaining} vars={{ list: (s.remaining ?? []).map((x) => copy.remainingItems[x]).join(" · ") }} />
    );
  return <p className="text-sm text-muted-foreground max-w-measure">{text}</p>;
}

/** The fold: the questions still open when there are several, what part of a question is answered, the questions already answered, the
 * sentence's source in full and the rules collected. No date of when an answer was found: that is the work's record, not the reader's. */
function Known({ s, r, titles }: { s: GraduationStatusView; r: NotCoveredRow; titles: Record<string, string> }) {
  const narrowed = s.open.filter((o) => o.narrowedBy);
  const institution = s.open.filter((o) => o.institutionAnswer);
  return (
    <div className="flex flex-col gap-4 pt-2 max-w-measure">
      {s.open.length > 1 && (
        <section className="flex flex-col gap-1">
          <h3 className="text-sm text-muted-foreground">{copy.openHeading}</h3>
          <ul className="flex flex-col gap-1 list-disc ps-5 text-sm">
            {s.open.map((o) => (
              <li key={o.code}>{titles[o.code]}</li>
            ))}
          </ul>
        </section>
      )}
      {narrowed.map((o) => (
        <p key={o.code} className="text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{copy.narrowed}</span>
          <RulesChip ids={[o.narrowedBy!]} />
        </p>
      ))}
      {institution.map((o) => (
        <p key={o.code} className="text-sm text-caution-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{copy.institution}</span>
          <RuleRef id={o.institutionAnswer!.ruleId} />
        </p>
      ))}
      {s.closed.length > 0 && (
        <section className="flex flex-col gap-1">
          <h3 className="text-sm text-muted-foreground">{copy.answeredHeading}</h3>
          <ul className="flex flex-col gap-1">
            {s.closed.map((c, i) => (
              <li key={`${c.ruleIds.join(" ")}-${i}`} className="text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{copy.answeredTopics[s.id]?.[c.ruleIds.join(" ")] ?? ""}</span>
                <RulesChip ids={c.ruleIds} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {r.source && (
        <section className="flex flex-col gap-1 text-sm">
          <h3 className="text-muted-foreground">{copy.sourceLead}</h3>
          <DocLink href={sourceHref(r.source)} className="self-start">
            {sourceLabel(r.source, provenance.sourced.localFile).text}
          </DocLink>
          <span className="flex flex-wrap items-center gap-2 text-muted-foreground">
            <span>
              <Tpl t={copy.checked} vars={{ date: <When iso={r.source.checked} /> }} />
            </span>
            <StrengthLabel strength={r.source.strength} />
          </span>
        </section>
      )}
      {r.ruleIds.length > 0 && <RulesLine ids={r.ruleIds} lead={copy.rulesLead} />}
    </div>
  );
}

export default function NotCovered() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageShell current="other" data={{ rules: data.rules, pointed: data.pointed, terms: {}, dimensions: {}, today: data.today }}>
      <div className="flex flex-col gap-section pt-6 lg:pt-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
          <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
          {/* what the site does cover, so the page is not only a list of gaps */}
          <p className="max-w-measure flex flex-wrap items-center gap-x-3 gap-y-2">
            <span>{copy.covered.line}</span>
            <LinkButton to="/guide">{copy.covered.link}</LinkButton>
          </p>
        </header>
        {data.cards.length === 0 ? (
          <p>{copy.empty}</p>
        ) : (
          <RowList label={copy.title}>
            {data.cards.map(({ status: s, row: r }) => (
              <li key={s.id} id={s.id} className="flex flex-col gap-2 p-4 md:p-5 scroll-mt-[112px] lg:scroll-mt-[88px]">
                <h2 className="text-lg font-semibold">
                  <bdi>{gershayim(r.he)}</bdi>
                </h2>
                {r.variants.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {copy.alsoCalled}: {r.variants.map(gershayim).join(" · ")}
                  </p>
                )}
                <div className="flex flex-col max-w-measure">
                  <p>{gershayim(r.explanation)}</p>
                  {r.source && (
                    <DocLink href={sourceHref(r.source)} className="self-start text-sm">
                      {copy.toSource}
                    </DocLink>
                  )}
                </div>
                <OpenLine s={s} titles={data.titles} />
                <Disclosure label={copy.known} summaryClassName="text-sm">
                  <Known s={s} r={r} titles={data.titles} />
                </Disclosure>
              </li>
            ))}
          </RowList>
        )}
        <section id="wont-do" className="flex flex-col gap-3 scroll-mt-[112px] lg:scroll-mt-[88px]">
          <h2 className="text-xl lg:text-2xl font-semibold">{copy.wontDo.title}</h2>
          <p className="text-muted-foreground max-w-measure">{copy.wontDo.lede}</p>
          <ul className="flex flex-col gap-1.5 max-w-measure list-disc ps-5">
            {copy.wontDo.items.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
