// What a block shows in place of its result when the reader's numbers leave nothing to show (design-system 3.9, "Empty state").
import type { ReactNode } from "react";
import { Button } from "./button";
import { Card } from "./card";

/**
 * An icon, a one-line title, a one-line explanation and one action that leads to what fills the block (a field to focus, a choice to
 * make). The explanation says what the block needs, never what the controls above it already show. `level`: the title's heading level
 * where it stands (3 by default, a block inside a section). `inPanel`: it stands in a panel's body in place of its headline and its chart
 * (a tab of the fee page's reading whose fees are not worked out yet): a dashed edge on the panel's own surface, no icon, the title in a
 * headline's size, the explanation in the body's, and the action primary, the one thing to do there.
 */
export function EmptyState({ icon, title, children, action, level = 3, inPanel }: {
  /** A 20 px icon from `components/icons`, drawn in the muted ink. */
  icon?: ReactNode;
  title: ReactNode;
  /** The one-line explanation. */
  children: ReactNode;
  action: { label: ReactNode; onClick: () => void };
  level?: 2 | 3 | 4;
  inPanel?: boolean;
}) {
  const Head = `h${level}` as const;
  if (inPanel)
    return (
      <div className="flex flex-col items-start gap-2.5 rounded-xl border border-dashed border-input px-5 py-5 md:px-8 md:py-7">
        <Head className="text-xl font-semibold leading-snug text-balance">{title}</Head>
        <p className="max-w-measure text-muted-foreground">{children}</p>
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      </div>
    );
  return (
    <Card pad="roomy" className="flex flex-col items-start gap-2">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <Head className="font-semibold">{title}</Head>
      <p className="text-sm text-muted-foreground max-w-measure">{children}</p>
      <Button className="mt-1" onClick={action.onClick}>
        {action.label}
      </Button>
    </Card>
  );
}
