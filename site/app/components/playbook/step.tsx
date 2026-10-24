// The playbook step, its strength chip and the experience card (design-system 8.5, design-spec 16.3 and 19). The title is
// the fixed one of copy.md 8.3; the text is the rule's, from the bundle; nothing here is a rule written for the page.
import { useState, type ReactNode } from "react";
import { MessageSquare } from "lucide-react";
import { r4playbook as c } from "../../copy";
import { fmt } from "../../lib/format";
import type { ExperienceEntry, PlaybookStep as StepData, Strength, StepFigure } from "../../lib/playbook";
import { OpenQuestion } from "../holdings/shared";
import { IconAlert, IconCopy, IconLock } from "../icons";
import { Num, RuleRef } from "../provenance";
import { Card, Disclosure, Tag, cx } from "../ui";

/** "ראשוני" and its kin: always on a step. A copy opens its host and the day it was read (copy.md 8.0). */
export function StrengthChip({ strength, host, checked }: { strength: Strength; host?: string; checked?: string }) {
  const [open, setOpen] = useState(false);
  const word = c.chip[strength] ?? strength;
  if (strength === "open")
    return (
      <Tag tone="blocked" icon={<IconLock size={14} />}>
        {word}
      </Tag>
    );
  if (strength === "experience")
    return (
      <Tag tone="caution" icon={<MessageSquare size={14} strokeWidth={1.75} aria-hidden="true" />}>
        {word}
      </Tag>
    );
  if (strength === "institution" || strength === "secondary") return <Tag tone="caution">{word}</Tag>;
  if (strength === "primary-mirror") {
    return (
      <span className="inline-flex flex-wrap items-center gap-x-2">
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="inline-flex items-center -my-3 py-3">
          <Tag tone="neutral" icon={<IconCopy size={14} />}>
            {word}
          </Tag>
        </button>
        {open && host && checked && (
          <span className="text-xs text-muted-foreground" role="status">
            {c.chipCopy.before}
            {host}
            {c.chipCopy.mid}
            {fmt.date(checked)}
            {c.chipCopy.after}
          </span>
        )}
      </span>
    );
  }
  return <Tag tone="neutral">{word}</Tag>;
}

export function ExperienceCard({ e }: { e: ExperienceEntry }) {
  const src = e.source;
  return (
    <div className="bg-secondary rounded-md p-4 max-w-measure flex flex-col gap-2">
      <p className="text-sm">{e.text}</p>
      <p className="text-xs text-muted-foreground">
        {c.experience.source.before}
        {"forum" in src ? (
          <>
            <bdi dir="ltr">{src.forum}</bdi>
            {c.experience.source.mid}
            <bdi dir="ltr">{src.thread}</bdi> (<bdi dir="ltr">{src.threadDate}</bdi>)
          </>
        ) : (
          <bdi dir="ltr">{src.raw}</bdi>
        )}
        {c.experience.source.read}
        {fmt.date(src.read)}
      </p>
      <Tag tone="caution" icon={<MessageSquare size={14} strokeWidth={1.75} aria-hidden="true" />} className="self-start">
        {c.experience.label}
      </Tag>
    </div>
  );
}

const UNIT_WORDS: Record<string, string> = { business_days: "ימי עסקים", days: "ימים", months: "חודשים", years: "שנים" };

/** One figure: the deadline wording where the rule sets a deadline, else the label and the number. A figure with no file gets the no-number wording. */
function Figure({ f }: { f: StepFigure }) {
  if (!f.value) return f.form === "within" ? <li className="text-sm">{c.figure.missing}</li> : null;
  const unit = f.value.unit;
  if (f.form === "within" && (unit === "business_days" || unit === "days" || unit === "months")) {
    const make = unit === "business_days" ? c.figure.businessDays : unit === "days" ? c.figure.days : c.figure.months;
    const [a = "", b = ""] = make("\u0000").split("\u0000");
    return (
      <li className="text-sm">
        {a}
        <Num value={f.value} />
        {b} <RuleRef id={f.ruleId} />
      </li>
    );
  }
  return (
    <li className="text-sm">
      {f.label}: <Num value={f.value} />
      {UNIT_WORDS[unit] ? ` ${UNIT_WORDS[unit]}` : ""} <RuleRef id={f.ruleId} />
    </li>
  );
}

function Labelled({ label, items }: { label: string; items: { ruleId: string; text: string }[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      {items.map((x, i) => (
        <p key={i} className="text-sm">
          {i === 0 && <span className="font-medium">{label} </span>}
          {x.text} <RuleRef id={x.ruleId} />
        </p>
      ))}
    </div>
  );
}

export function PlaybookStep({ step, offer, children }: { step: StepData; offer?: ReactNode; children?: ReactNode }) {
  const title = step.institutionOnly ? c.institutionPrefix + step.title : step.title;
  const first = step.text[0];
  return (
    <>
      {offer}
      <Card as="li" className={cx("flex flex-col gap-3", step.noRule && "border-caution")}>
        <div className="flex items-start gap-3">
          <span className="size-7 shrink-0 rounded-full bg-secondary text-sm font-semibold inline-flex items-center justify-center" aria-label={`${c.stepNumber} ${step.n}`}>
            {step.n}
          </span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
            <h3 className="text-lg font-medium">{title}</h3>
            <StrengthChip strength={step.strength} host={first?.host} checked={first?.checked} />
          </div>
        </div>

        {step.verify ? (
          <p className="text-sm">
            <RuleRef id={step.ruleIds[0]!} />
          </p>
        ) : step.noRule ? (
          <div className="flex flex-col gap-3">
            <p className="flex gap-2 text-sm text-caution-foreground bg-caution-subtle rounded-md px-3.5 py-3">
              <IconAlert size={18} className="text-caution shrink-0 mt-0.5" />
              <span>
                {c.noRule.head} <RuleRef id={step.ruleIds[0]!} />
              </span>
            </p>
            <h4 className="text-sm font-semibold">{c.noRule.known}</h4>
            <ul className="list-disc ps-5 flex flex-col gap-1">
              {step.noRule.known.map((k) => (
                <li key={k.ruleId} className="text-sm">
                  {k.title} <RuleRef id={k.ruleId} />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-w-measure">
            {step.text.map((t) =>
              t.text ? (
                <p key={t.ruleId} className="text-sm">
                  {t.text} <RuleRef id={t.ruleId} />
                </p>
              ) : (
                <p key={t.ruleId} className="text-sm">
                  {t.title} <RuleRef id={t.ruleId} />
                </p>
              ),
            )}
          </div>
        )}

        <Labelled label={c.sign} items={step.sign} />
        <Labelled label={c.expect} items={step.expect} />
        {step.figures.some((f) => f.value || f.form === "within") && (
          <ul className="list-disc ps-5 flex flex-col gap-1">
            {step.figures.map((f, i) => (
              <Figure key={i} f={f} />
            ))}
          </ul>
        )}
        {step.openQuestions.map((code) => (
          <p key={code} className="text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
            <OpenQuestion code={code} />
            <span>{c.oq[code]}</span>
          </p>
        ))}

        {step.noRule && (
          <Disclosure label={c.experience.disclosure} defaultOpen className="border-t border-border pt-1">
            <div className="flex flex-col gap-3 pb-1">
              {step.experience.length > 0 ? step.experience.map((e) => <ExperienceCard key={e.id} e={e} />) : <p className="text-sm text-muted-foreground">{c.experience.notShipped}</p>}
            </div>
          </Disclosure>
        )}
        {!step.noRule && step.experience.length > 0 && (
          <Disclosure label={c.experience.disclosure} defaultOpen className="border-t border-border pt-1">
            <div className="flex flex-col gap-3 pb-1">
              {step.experience.map((e) => (
                <ExperienceCard key={e.id} e={e} />
              ))}
            </div>
          </Disclosure>
        )}
        {children}
      </Card>
    </>
  );
}
