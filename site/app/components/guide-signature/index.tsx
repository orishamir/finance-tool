// The "what makes it different" block of a guide page (D29): the frame (title, the one question, the visual, the nearest alternative,
// the old illustrative timeline folded below) and the registry from wrapper id to its visual. A wrapper not in the registry has no
// block and keeps its timeline open where it was (brokerage account, child savings, IRA study fund, IRA provident).
// Builder G2 adds its visuals to `signatureRegistry` (and its data builders to `builders` in lib/guide-signature.server.ts).
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Link } from "react-router";
import { guideSignature as copy, site } from "../../copy";
import { reviewParam } from "../../lib/review";
import type { SignatureData } from "../../lib/guide-signature";
import { Callout, Card, Disclosure } from "../kit";
import { BankDepositVisual } from "./bank-deposit";
import { CurrentAccountVisual } from "./current-account";
import { GovernmentBondVisual } from "./government-bond";
import { KerenHishtalmutVisual } from "./keren-hishtalmut";
import { KupatGemelLehashkaaVisual } from "./kupat-gemel-lehashkaa";
import { PensionVisual } from "./pension";
import type { VisualProps } from "./kit";
import { MakamVisual } from "./makam";
import { MoneyMarketDailyVisual } from "./money-market-daily";
import { MoneyMarketRenewableVisual } from "./money-market-renewable";
import { SavingsPlanVisual } from "./savings-plan";

export const signatureRegistry: Record<string, ComponentType<VisualProps>> = {
  "current-account": CurrentAccountVisual,
  "bank-deposit": BankDepositVisual,
  "savings-plan": SavingsPlanVisual,
  "money-market-fund-daily": MoneyMarketDailyVisual,
  "money-market-fund-renewable": MoneyMarketRenewableVisual,
  makam: MakamVisual,
  "government-bond": GovernmentBondVisual,
  "keren-hishtalmut": KerenHishtalmutVisual,
  "kupat-gemel-lehashkaa": KupatGemelLehashkaaVisual,
  "pension-comprehensive": PensionVisual,
  "pension-general": PensionVisual,
  "provident-for-annuity": PensionVisual,
};

export const hasSignatureVisual = (id: string, data: SignatureData | null): data is SignatureData => !!data && id in signatureRegistry && id in copy.pages;

/**
 * Whether the address asks for the visuals held for review (`?review`, lib/review.ts). Read after the first render: the page is
 * pre-rendered without a query, so reading it during render would not match the HTML.
 */
export function useReviewMode(): boolean {
  const [review, setReview] = useState(false);
  useEffect(() => setReview(new URLSearchParams(window.location.search).has(reviewParam)), []);
  return review;
}

/** Title of the section, "מה מייחד …". */
export const signatureTitle = (id: string) => `${copy.titleBefore} ${copy.pages[id]!.name}`;

export function SignatureFrame({ id, data, today, timeline, held }: { id: string; data: SignatureData; today: string; timeline: ReactNode; held?: boolean }) {
  const Visual = signatureRegistry[id]!;
  const page = copy.pages[id]!;
  return (
    <>
      {held && (
        <Callout tone="caution" title={site.held.title}>
          {site.held.signature}
        </Callout>
      )}
      {/* the question is the card's title: outside the card it read as a second heading under the section's on a phone */}
      <Card className="flex flex-col gap-4">
        <p className="text-lg font-semibold max-w-measure">{page.question}</p>
        <Visual data={data} today={today} />
      </Card>
      {page.altId ? (
        <p className="text-sm max-w-measure">
          {copy.altBefore} <span className="font-medium">{page.alt}</span>. {page.altLine}{" "}
          <Link to={`/guide/${page.altId}`} className="text-link hover:underline">
            {copy.altLinkBefore} {page.alt}
          </Link>
        </p>
      ) : (
        // a product with no alternative on the same holding (a pension is required for salaried people): only the page's own line
        <p className="text-sm max-w-measure">{page.altLine}</p>
      )}
      {timeline && (
        <Card pad="none" className="px-4 py-1 md:px-6">
          <Disclosure label={<span className="font-medium">{copy.timeline.summary}</span>} openLabel={<span className="font-medium">{copy.timeline.hide}</span>} summaryClassName="justify-between">
            <div className="flex flex-col gap-4 pb-4">
              <p className="text-sm text-muted-foreground max-w-measure">{copy.timeline.lead}</p>
              {timeline}
            </div>
          </Disclosure>
        </Card>
      )}
    </>
  );
}
