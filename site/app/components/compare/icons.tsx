// Lucide icons the release 2 screens add to the shared set (design-system 2.8). Same 1.75px stroke; none mirrors.
import { ArrowDown, ArrowUp, Ban, Check, CircleDashed, CircleHelp, Ellipsis, Equal, Minus, Pencil, Plus, Target, Trash2, type LucideProps } from "lucide-react";

type IconProps = Omit<LucideProps, "ref"> & { size?: 14 | 16 | 18 | 20 | 24 };

const base = (Component: React.ComponentType<LucideProps>) =>
  function Icon({ size = 20, className, ...rest }: IconProps) {
    return <Component size={size} strokeWidth={1.75} aria-hidden="true" className={className} {...rest} />;
  };

export const IconTarget = base(Target);
export const IconMore = base(Ellipsis);
export const IconUp = base(ArrowUp);
export const IconDown = base(ArrowDown);
export const IconPlus = base(Plus);
export const IconEqual = base(Equal);
export const IconBan = base(Ban);
export const IconDashed = base(CircleDashed);
export const IconTrash = base(Trash2);
export const IconOk = base(Check);
export const IconDash = base(Minus);
export const IconEdit = base(Pencil);
export const IconHelp = base(CircleHelp);
