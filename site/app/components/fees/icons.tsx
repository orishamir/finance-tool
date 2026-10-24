// Lucide icons the fee page adds (design-system 7.1): none mirrors, same 1.75px stroke as the shared set.
import { ArrowLeftRight, CircleDashed, Minus, Phone, type LucideProps } from "lucide-react";

type IconProps = Omit<LucideProps, "ref"> & { size?: 14 | 16 | 18 | 20 | 24 };

const base = (Component: React.ComponentType<LucideProps>) =>
  function Icon({ size = 20, className, ...rest }: IconProps) {
    return <Component size={size} strokeWidth={1.75} aria-hidden="true" className={className} {...rest} />;
  };

export const IconPhone = base(Phone);
export const IconSwap = base(ArrowLeftRight);
export const IconNotWorth = base(Minus);
export const IconUnevaluated = base(CircleDashed);
