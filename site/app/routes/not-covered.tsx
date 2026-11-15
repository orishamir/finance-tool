// The "not covered yet" page (flows 6.13, product D2 and D69): the kinds of saving the site knows of and has no guide page for
// yet, one row each (`notCoveredCards`, never every row of the glossary's section 3). A row says what the kind is, with its
// source a tap away, and the open question that keeps it from a guide; one fold holds the rest of what is known. Built from the
// rule base and the open questions, never typed. Each row's id is the anchor the search and other pages link to.
import { useLoaderData } from "react-router";
import { notCovered as copy, provenance } from "../copy";
import { pageMeta, type MetaPlace } from "../lib/page-meta";
import { Ruled, RuleTitleRow, StrengthLabel } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Disclosure, DocLink, LinkButton, PageHead, RowList, Section, Tpl, fill, gershayim, When } from "../components/kit";
import type { GraduationStatusView } from "../lib/graduation.server";
import type { NotCoveredRow } from "../lib/data.server";
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
      fill(copy.remaining, { list: (s.remaining ?? []).map((x) => copy.remainingItems[x]).join(" · ") })
    );
  return <p className="text-sm text-muted-foreground max-w-measure">{text}</p>;
}

/** A list whose rows are the rules themselves, each by its title (D101). */
function RuleList({ ids }: { ids: readonly string[] }) {
  return (
    <ul className="flex flex-col">
      {ids.map((id) => (
        <li key={id} className="border-t border-border first:border-t-0">
          <RuleTitleRow id={id} />
        </li>
      ))}
    </ul>
  );
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
        <section key={o.code} className="flex flex-col gap-1 text-sm">
          <p>{copy.narrowed}</p>
          <RuleList ids={[o.narrowedBy!]} />
        </section>
      ))}
      {institution.map((o) => (
        <p key={o.code} className="text-sm text-caution-foreground">
          <Ruled id={o.institutionAnswer!.ruleId}>{copy.institution.stated}</Ruled>
          {copy.institution.after}
        </p>
      ))}
      {s.closed.length > 0 && (
        <section className="flex flex-col gap-1">
          <h3 className="text-sm text-muted-foreground">{copy.answeredHeading}</h3>
          <ul className="flex flex-col gap-1">
            {s.closed.map((c, i) => (
              <li key={`${c.ruleIds.join(" ")}-${i}`} className="text-sm">
                <Ruled id={c.ruleIds}>{copy.answeredTopics[s.id]?.[c.ruleIds.join(" ")] ?? ""}</Ruled>
              </li>
            ))}
          </ul>
        </section>
      )}
      {r.source && (
        <section className="flex flex-col gap-1 text-sm">
          <h3 className="text-muted-foreground">{copy.sourceLead}</h3>
          <DocLink source={r.source} className="self-start">
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
      {r.ruleIds.length > 0 && (
        <section className="flex flex-col gap-1 text-sm">
          <h3 className="text-muted-foreground">{copy.rulesLead}</h3>
          <RuleList ids={r.ruleIds} />
        </section>
      )}
    </div>
  );
}

export default function NotCovered() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageShell current="other" data={{ rules: data.rules, pointed: data.pointed, terms: {}, dimensions: {}, today: data.today }}>
      <div className="flex flex-col gap-section">
        <PageHead title={copy.title} lede={copy.lede}>
          {/* what the site does cover, so the page is not only a list of gaps */}
          <p className="max-w-measure flex flex-wrap items-center gap-x-3 gap-y-2">
            <span>{copy.covered.line}</span>
            <LinkButton to="/guide">{copy.covered.link}</LinkButton>
          </p>
        </PageHead>
        {data.cards.length === 0 ? (
          <p>{copy.empty}</p>
        ) : (
          <RowList label={copy.title}>
            {data.cards.map(({ status: s, row: r }) => (
              <li key={s.id} id={s.id} className="anchor-target flex flex-col gap-2 p-4 md:p-5">
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
                    <DocLink source={r.source} className="self-start text-sm">
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
        <Section id="wont-do" title={copy.wontDo.title} lead={copy.wontDo.lede}>
          <ul className="flex flex-col gap-1.5 max-w-measure list-disc ps-5">
            {copy.wontDo.items.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>
      </div>
    </PageShell>
  );
}
