// A brand's funds (D33) as the company page's product table (founder, 2026-10-27; design-system 11 "Lists of products"): the
// name with the fund's labels, the number as the link to Maya, the index it follows, and the manager's own three fees (D31).
// Only collected records: the full list is the manager's, on Maya (CAT-43).
import { Link } from "react-router";
import { brands as copy, invest } from "../../copy";
import type { BrandFundRow, FundKind } from "../../lib/brands.server";
import type { SiteValue } from "../../lib/value";
import { IconDrillIn, IconExternal } from "../icons";
import { Num } from "../provenance";
import { LabelRow, LabelSheetHost, ProductPhoneRow, ProductTable, type ProductColumn } from "../kit";

const c = copy.funds;

/** The three fees, each with its word: in the table one under the other, on the phone in one line; one not collected says so. */
function Fees({ f, inline }: { f: BrandFundRow; inline?: boolean }) {
  const lines: { id: string; v: SiteValue | null; word: string }[] = [
    { id: "fixed", v: f.fixed, word: c.feeWords.fixed },
    { id: "variable", v: f.variable, word: c.feeWords.variable },
    { id: "trustee", v: f.trustee, word: c.feeWords.trustee },
  ];
  return (
    <span className={inline ? "contents" : "flex flex-col gap-1"}>
      {lines.map((l) => (
        <span key={l.id} className="inline-flex items-center gap-1.5 whitespace-nowrap">
          {l.v ? <Num value={l.v} size={inline ? "inline" : "cell"} /> : <span className="text-sm text-muted-foreground">{invest.funds.notCollected}</span>}
          <span className="text-sm text-muted-foreground">{l.word}</span>
        </span>
      ))}
    </span>
  );
}

/** The fund's number, as the link to its page on Maya (a link out: the external icon). */
function NumberLink({ f }: { f: BrandFundRow }) {
  if (!f.number) return null;
  const n = (
    <bdi dir="ltr" className="num-id">
      {f.number}
    </bdi>
  );
  if (!f.mayaHref) return n;
  return (
    <a href={f.mayaHref} target="_blank" rel="noopener noreferrer" aria-label={c.mayaLink(f.number)} className="text-link hover:underline inline-flex items-center gap-1 whitespace-nowrap">
      {n}
      <IconExternal size={14} />
    </a>
  );
}

/** What the fund follows: the index's name (a link inside the site: the chevron), or a money-market fund's kind. */
function Follows({ f, phone }: { f: BrandFundRow; phone?: boolean }) {
  if (!f.follows) return null;
  return (
    <Link to={f.follows.href} className="text-link hover:underline inline-flex items-center gap-0.5 whitespace-nowrap self-start">
      {phone && f.follows.kind === "index" && <span className="text-muted-foreground">{c.indexWord}&nbsp;</span>}
      <bdi>{f.follows.name}</bdi>
      <IconDrillIn size={16} />
    </Link>
  );
}

export function BrandFundList({ funds, kind }: { funds: BrandFundRow[]; kind: FundKind }) {
  const followsHead = kind === "money-market" ? c.columns.kind : c.columns.index;
  const columns: ProductColumn[] = [
    { id: "name", head: c.columns.name },
    { id: "number", head: c.columns.number, fit: true },
    ...(funds.some((f) => f.follows) ? [{ id: "follows", head: followsHead, fit: true }] : []),
    { id: "fees", head: c.columns.fees, fit: true },
  ];
  const withFollows = columns.some((col) => col.id === "follows");
  return (
    <LabelSheetHost>
      <ProductTable
        columns={columns}
        groups={funds.map((f) => ({
          key: f.id,
          rows: [
            {
              key: f.id,
              phone: (
                <ProductPhoneRow stacked>
                  <span className="font-medium">
                    <bdi>{f.name}</bdi>
                  </span>
                  {f.number && (
                    <span className="text-sm text-muted-foreground inline-flex items-center gap-1.5">
                      {c.numberWord} <NumberLink f={f} />
                    </span>
                  )}
                  <Follows f={f} phone />
                  <LabelRow labels={f.labels} className="pt-0.5" />
                  <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
                    {c.phoneFees} <Fees f={f} inline />
                  </span>
                </ProductPhoneRow>
              ),
              cells: [
                <span className="flex flex-col items-start gap-1.5">
                  <span className="font-medium">
                    <bdi>{f.name}</bdi>
                  </span>
                  <LabelRow labels={f.labels} />
                </span>,
                <NumberLink f={f} />,
                ...(withFollows ? [<Follows f={f} />] : []),
                <Fees f={f} />,
              ],
            },
          ],
        }))}
      />
    </LabelSheetHost>
  );
}
