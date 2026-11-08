// The "not covered yet" page (flows 6.13, product D2): the tier-2 kinds of holding, what is known and what still blocks
// each. The cards are the D2 list (`notCoveredCards`), never every row of the glossary's section 3 (2026-11-07).
import { useLoaderData } from "react-router";
import type { Route } from "./+types/not-covered";
import { notCovered as copy, r5, site } from "../copy";
import { IconExternal, IconLock, IconCheck } from "../components/icons";
import { IconDashed } from "../components/compare/icons";
import { Tpl } from "../components/exposure-mode/tpl";
import { IdRef, LeadTail, RuleRef, RulesChip, RulesLine, StrengthLabel } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Callout, Card, Disclosure, LinkButton, Tag, gershayim, When } from "../components/kit";
import type { GraduationStatusView } from "../lib/graduation.server";

import { sourceLabel } from "../lib/source-label";
import { provenance } from "../copy";
import { sourceHref } from "../lib/sources";

export async function loader() {
  const { loadRules, pointedRecords, today } = await import("../lib/data.server");
  const { graduationStatuses, graduationRuleIds, notCoveredCards } = await import("../lib/graduation.server");
  const rules = loadRules();
  const statuses = graduationStatuses();
  // one card per kind of holding the site lacks (product D2), never a glossary section's every row (2026-11-07)
  const cards = notCoveredCards(statuses).filter((c) => c.status.status !== "graduated");
  const cited = new Set([...cards.flatMap((c) => c.row.ruleIds), ...graduationRuleIds(statuses)]);
  const mine = Object.fromEntries(Object.values(rules).filter((r) => cited.has(r.id)).map((r) => [r.id, r]));
  return { cards, statuses, rules: mine, pointed: pointedRecords(mine, rules), today: today() };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

const dateNode = (d: string) => <When iso={d} />;

/** "מה חסר כדי שהאתר יחשב את זה" (flow 37): the status line with its icon, what blocks, what closed. Computed from the rule base, never typed. The fixed
 * "when it closes" sentence went on 2026-11-07: the same promise on every card said more than the site would do for each. */
function GraduationStatus({ s }: { s: GraduationStatusView }) {
  const g = r5.graduation;
  const line =
    s.status === "blocked" ? (
      <span className="flex items-center gap-2 font-medium">
        <IconLock size={18} className="text-blocked shrink-0" />
        {s.open.length === 1 ? g.blockedOne : <Tpl t={g.blocked} vars={{ n: <bdi dir="ltr">{s.open.length}</bdi> }} />}
      </span>
    ) : s.status === "remaining" ? (
      <span className="flex items-center gap-2 font-medium">
        <IconDashed size={18} className="text-caution shrink-0" />
        <Tpl t={g.remaining} vars={{ list: (s.remaining ?? []).map((x) => g.remainingItems[x]).join(" · ") }} />
      </span>
    ) : (
      <span className="flex items-center gap-2 font-medium">
        <IconCheck size={18} className="text-positive shrink-0" />
        <Tpl t={g.graduated} vars={{ date: dateNode(s.graduatedOn ?? "") }} />
      </span>
    );
  const body = (
    <div className="flex flex-col gap-3 pt-2">
      {line}
      {s.open.length > 0 && (
        <div className="flex flex-col gap-2">
          <h5 className="text-sm text-muted-foreground">{g.blockersHeading}</h5>
          {s.open.map((o) => (
            <div key={o.code} className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-sm text-blocked-foreground">
                <IconLock size={16} className="text-blocked shrink-0" />
                <Tpl t={g.blockerShort} vars={{ code: <IdRef id={o.code} titled /> }} />
              </span>
              {o.narrowedOn && o.narrowedBy && (
                <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-1.5">
                  {/* the narrowing rule as the rules chip, never its bare code (2026-11-07) */}
                  <Tpl t={g.narrowed} vars={{ date: dateNode(o.narrowedOn) }} />
                  <RulesChip ids={[o.narrowedBy]} />
                </span>
              )}
              {o.institutionAnswer && (
                <span className="text-sm text-caution-foreground flex flex-wrap items-center gap-1.5">
                  {g.institution} <RuleRef id={o.institutionAnswer.ruleId} />
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <h5 className="text-sm text-muted-foreground">{g.closuresHeading}</h5>
        {s.closed.length === 0 ? (
          <p className="text-sm text-muted-foreground">{g.none}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {s.closed.map((c, i) => (
              <li key={`${c.ruleIds.join(" ")}-${i}`} className={`text-sm flex flex-wrap items-center gap-1.5 ${c.closedOn ? "text-muted-foreground" : "text-caution-foreground"}`}>
                {/* a closure is said in words, not struck: a struck date and a bare count read as a fragment (2026-11-07). It names the
                    rules that answered it, never a question: an answered question is deleted from the rule base (2026-11-08) */}
                <span>
                  <Tpl t={c.closedOn ? g.closure : g.closureNoDate} vars={{ date: c.closedOn ? dateNode(c.closedOn) : "", topic: g.closureTopics[s.id]?.[c.ruleIds.join(" ")] ?? "" }} />
                </span>
                <RulesChip ids={c.ruleIds} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
  return (
    <div className="flex flex-col gap-1">
      <Disclosure defaultOpen label={<h4 className="font-medium">{g.block}</h4>} summaryClassName="text-base">
        {body}
      </Disclosure>
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
          {/* what the site does cover, so the page is not only a list of gaps (a fresh reader, 2026-11-07) */}
          <p className="max-w-measure flex flex-wrap items-center gap-x-3 gap-y-2">
            <span>{copy.covered.line}</span>
            <LinkButton to="/guide">{copy.covered.link}</LinkButton>
          </p>
        </header>
        {data.cards.length > 0 && <Callout tone="blocked">{copy.notice}</Callout>}
        {data.cards.length === 0 ? (
          <p>{copy.empty}</p>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {data.cards.map(({ status: s, row: r }) => (
              <Card as="li" key={s.id} id={s.id} className="flex flex-col gap-3 scroll-mt-[112px] lg:scroll-mt-[88px]">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <h2 className="text-lg font-semibold">
                    <bdi>{gershayim(r.he)}</bdi>
                  </h2>
                  <Tag tone="blocked" icon={<IconLock size={14} />}>
                    {copy.blockedTag}
                  </Tag>
                </div>
                {r.variants.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {copy.alsoCalled}: {r.variants.map(gershayim).join(" · ")}
                  </p>
                )}
                <dl className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <dt className="text-sm text-muted-foreground">{copy.rows.known}</dt>
                    <dd>{gershayim(r.explanation)}</dd>
                    {r.source && (
                      <dd className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                        {(() => {
                          const label = sourceLabel(r.source, provenance.sourced.localFile);
                          return (
                            <a href={sourceHref(r.source)} target="_blank" rel="noopener noreferrer" className="text-link hover:underline" title={label.english ?? undefined}>
                              {/* the arrow is held to the title's last word: alone, it stood on a line under a long title (2026-11-03) */}
                              {label.host ? (
                                <span className="whitespace-nowrap">
                                  <bdi dir="ltr">{label.text}</bdi>
                                  <IconExternal size={16} className="inline-block align-text-bottom ms-1" />
                                </span>
                              ) : (
                                <LeadTail lead={label.text}>
                                  <IconExternal size={16} className="inline-block align-text-bottom ms-1" />
                                </LeadTail>
                              )}
                            </a>
                          );
                        })()}
                        <span>
                          <Tpl t={copy.checked} vars={{ date: dateNode(r.source.checked) }} />
                        </span>
                        <StrengthLabel strength={r.source.strength} />
                      </dd>
                    )}
                    {r.ruleIds.length > 0 && (
                      <dd>
                        <RulesLine ids={r.ruleIds} lead={copy.rulesLead} />
                      </dd>
                    )}
                  </div>
                </dl>
                <GraduationStatus s={s} />
              </Card>
            ))}
          </ul>
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
        {data.statuses.some((s) => s.status === "graduated") && (
          <section className="flex flex-col gap-2">
            <h2 className="text-xl lg:text-2xl font-semibold">{r5.graduation.graduatedHeading}</h2>
            <ul className="flex flex-col gap-1">
              {data.statuses
                .filter((s) => s.status === "graduated")
                .map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-2">
                    <IconCheck size={16} className="text-positive" />
                    <Tpl t={r5.graduation.graduatedItem} vars={{ name: <bdi>{s.name}</bdi>, date: dateNode(s.graduatedOn ?? "") }} />
                    {s.guideHref && (
                      <a href={s.guideHref} className="text-link hover:underline">
                        {r5.graduation.graduatedLink}
                      </a>
                    )}
                  </li>
                ))}
            </ul>
          </section>
        )}
      </div>
    </PageShell>
  );
}
