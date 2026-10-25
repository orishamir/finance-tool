// The icons of the index page's labels (design-system 2.8): Lucide, 1.75px stroke, none mirrors.
import { Ban, Clock, Coins, FileText, Globe, House, Layers, Lock, Percent, Repeat, ShieldCheck, Sun, TriangleAlert, type LucideProps } from "lucide-react";
import type { LabelIconKey } from "../../lib/labels";

const map: Record<LabelIconKey, React.ComponentType<LucideProps>> = {
  home: House,
  globe: Globe,
  clock: Clock,
  layers: Layers,
  coins: Coins,
  shield: ShieldCheck,
  file: FileText,
  lock: Lock,
  alert: TriangleAlert,
  ban: Ban,
  percent: Percent,
  repeat: Repeat,
  sun: Sun,
};

export function LabelIcon({ name, size = 14 }: { name: LabelIconKey; size?: number }) {
  const Icon = map[name];
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />;
}
