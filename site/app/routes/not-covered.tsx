// The "not covered yet" page (flows 6.13, product D2): the tier-2 instruments, what is known and that
// the rules behind each are still open.
import { useLoaderData } from "react-router";
import type { Route } from "./+types/not-covered";
import { notCovered as copy, r5, site } from "../copy";
import { IconExternal, IconLock, IconCheck } from "../components/icons";
import { IconDashed } from "../components/compare/icons";
import { Tpl } from "../components/exposure-mode/tpl";
import { RuleRef, RulesLine, StrengthLabel } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Callout, Card, Disclosure, Tag } from "../components/kit";
import type { GraduationStatusView } from "../lib/graduation.server";
import { fmt } from "../lib/format";
import { sourceLabel } from "../lib/source-label";
import { provenance } from "../copy";

export async function loader() {
  const { loadNotCovered, loadRules, today } = await import("../lib/data.server");
  const rows = loadNotCovered();
  const rules = loadRules();
  const { graduationStatuses, graduationRuleIds } = await import("../lib/graduation.server");
  const { notCoveredSources } = await import("../lib/graduation.server");
  const statuses = graduationStatuses();
  // the glossary parser cuts a url at the first ")": take the whole address from the balanced reader
  const whole = notCoveredSources();
  for (const r of rows) {
    const w = whole.get(r.he);
    if (r.source && w) r.source = { ...r.source, title: w.title, url: w.url };
  }
  const cited = new Set([...rows.flatMap((r) => r.ruleIds), ...graduationRuleIds(statuses)]);
  return { rows, statuses, rules: Object.fromEntries(Object.values(rules).filter((r) => cited.has(r.id)).map((r) => [r.id, r])), today: today() };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

const dateNode = (d: string) => <bdi dir="ltr">{fmt.date(d)}</bdi>;

/** "מצב הכיסוי" (flow 37): the status line with its icon, what blocks, what closed, the fixed path sentence. Computed from the rule base, never typed. */
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
                <Tpl t={g.blockerShort} vars={{ code: <bdi dir="ltr">{o.code}</bdi> }} />
              </span>
              {o.narrowedOn && o.narrowedBy && (
                <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-1.5">
                  <Tpl t={g.narrowed} vars={{ date: dateNode(o.narrowedOn), rule: <RuleRef id={o.narrowedBy} /> }} />
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
              <li key={`${c.code}-${i}`} className={`text-sm flex flex-wrap items-center gap-1.5 ${c.closedOn ? "text-muted-foreground" : "text-caution-foreground"}`}>
                <span className="line-through">
                  {c.closedOn ? <Tpl t={g.closure} vars={{ date: dateNode(c.closedOn), rule: <bdi dir="ltr" className="num-id">{c.code}</bdi> }} /> : <Tpl t={g.closureNoDate} vars={{ rule: <bdi dir="ltr" className="num-id">{c.code}</bdi> }} />}
                </span>
                {c.ruleIds.map((id) => (
                  <RuleRef key={id} id={id} />
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{g.path}</p>
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
    <PageShell current="other" data={{ rules: data.rules, terms: {}, dimensions: {}, today: data.today }}>
      <div className="flex flex-col gap-section pt-6 lg:pt-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
          <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
        </header>
        {data.rows.length > 0 && <Callout tone="blocked">{copy.notice}</Callout>}
        {data.rows.length === 0 ? (
          <p>{copy.empty}</p>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {data.rows.map((r) => (
              <Card as="li" key={r.he} id={data.statuses.find((s) => s.name === r.he)?.id} className="flex flex-col gap-3 scroll-mt-[112px] lg:scroll-mt-[88px]">
                <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                  <h2 className="text-lg font-semibold">
                    <bdi>{r.he}</bdi>
                  </h2>
                  <Tag tone="blocked" icon={<IconLock size={14} />}>
                    {copy.blockedTag}
                  </Tag>
                </div>
                {r.variants.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {copy.alsoCalled}: {r.variants.join(" · ")}
                  </p>
                )}
                <dl className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <dt className="text-sm text-muted-foreground">{copy.rows.known}</dt>
                    <dd>{r.explanation}</dd>
                    {r.source && (
                      <dd className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                        {(() => {
                          const label = sourceLabel(r.source, provenance.sourced.localFile);
                          return (
                            <a href={r.source.url} target="_blank" rel="noopener noreferrer" className="text-link hover:underline" title={label.english ?? undefined}>
                              {label.host ? <bdi dir="ltr">{label.text}</bdi> : label.text}
                              <IconExternal size={16} className="inline-block align-text-bottom ms-1" />
                            </a>
                          );
                        })()}
                        <bdi dir="ltr">{fmt.date(r.source.checked)}</bdi>
                        <StrengthLabel strength={r.source.strength} />
                      </dd>
                    )}
                    {r.ruleIds.length > 0 && (
                      <dd>
                        <RulesLine ids={r.ruleIds} />
                      </dd>
                    )}
                  </div>
                </dl>
                {(() => {
                  const s = data.statuses.find((x) => x.name === r.he);
                  return s && s.status !== "graduated" ? <GraduationStatus s={s} /> : null;
                })()}
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
