// The record-your-offer card (design-system 8.6): what to write, the two rule lines, a copy button with the blank template.
// The site keeps no record of offers (appendix A item 26); the template goes to the clipboard and nothing is stored.
import { useState } from "react";
import { Link } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import { r4playbook as c } from "../../copy";
import { isProvident, sentences } from "../../lib/playbook";
import { IconCopy } from "../icons";
import { RuleRef } from "../provenance";
import { Button, Card } from "../ui";
import { OpenQuestionChip } from "./step";

export function RecordOfferCard({ brokerage, wrapperId, rules, className }: { brokerage: boolean; wrapperId: string; rules: Record<string, RuleRecord>; className?: string }) {
  const family = brokerage ? "brokerage" : isProvident(wrapperId) ? "provident" : "bank";
  const template = c.offer.templates[family] ?? c.offer.template;
  const items = c.offer.itemsByFamily[family] ?? c.offer.items;
  /** PF-16's own sentence about a granted discount (the personal area and the email). */
  const discount = sentences(rules["PF-16"]?.text_he ?? "").find((x) => /^כשניתנת הנחה/.test(x));
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(template);
      ok = true;
    } catch {
      // no clipboard permission (an embedded or insecure page): the selection route still copies on a tap
      try {
        const area = document.createElement("textarea");
        area.value = template;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        ok = document.execCommand("copy");
        area.remove();
      } catch {
        ok = false;
      }
    }
    setCopied(ok);
    if (ok) setTimeout(() => setCopied(false), 2500);
  };
  return (
    <Card as="section" className={className ?? "flex flex-col gap-3"}>
      <h3 className="text-lg font-medium">{c.offer.title}</h3>
      <p className="text-sm text-muted-foreground">{c.offer.lede}</p>
      <ul className="list-disc ps-5 flex flex-col gap-0.5 text-sm">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
      <p className="text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
        <span>{c.oq["SW OQ4"]}</span>
        <OpenQuestionChip code="SW OQ4" />
      </p>
      {family === "provident" && discount && (
        <p className="text-sm">
          {discount} <RuleRef id="PF-16" />
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Button onClick={copy}>
          <IconCopy size={16} />
          {copied ? c.offer.copied : c.offer.copy}
        </Button>
        {copied && (
          <span role="status" className="sr-only">
            {c.offer.copied}
          </span>
        )}
        {brokerage && (
          <Link to="/workbench/providers/brokerage-account?level=entered" className="text-link min-h-target inline-flex items-center hover:underline">
            {c.offer.link}
          </Link>
        )}
      </div>
    </Card>
  );
}
