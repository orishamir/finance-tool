// What a block shows in place of its result when the reader's numbers leave nothing to show (design-system 3.9, "Empty state").
import type { ReactNode } from "react";
import { Button } from "./button";
import { Card } from "./card";

/**
 * An icon, a one-line title, a one-line explanation and one action that leads to what fills the block (a field to focus, a choice to
 * make). The explanation says what the block needs, never what the controls above it already show. `level`: the title's heading level
 * where it stands (3 by default, a block inside a section).
 */
export function EmptyState({ icon, title, children, action, level = 3 }: {
  /** A 20 px icon from `components/icons`, drawn in the muted ink. */
  icon: ReactNode;
  title: ReactNode;
  /** The one-line explanation. */
  children: ReactNode;
  action: { label: ReactNode; onClick: () => void };
  level?: 2 | 3 | 4;
}) {
  const Head = `h${level}` as const;
  return (
    <Card pad="roomy" className="flex flex-col items-start gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <Head className="font-semibold">{title}</Head>
      <p className="text-sm text-muted-foreground max-w-measure">{children}</p>
      <Button className="mt-1" onClick={action.onClick}>
        {action.label}
      </Button>
    </Card>
  );
}
