// Lucide icons, 1.75px stroke (design-system 2.8). Chevrons and the external-link arrow mirror in RTL;
// the rest do not. `data-mirror` is set once here, never per use.
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileText,
  FileUp,
  Info,
  Lock,
  Menu,
  Minus,
  Pencil,
  RotateCcw,
  Search,
  Share2,
  X,
  type LucideProps,
  Layers,
} from "lucide-react";

type IconProps = Omit<LucideProps, "ref"> & { size?: 16 | 20 | 24 | 14 | 18 };

const base = (Component: React.ComponentType<LucideProps>, mirror = false) =>
  function Icon({ size = 20, className, ...rest }: IconProps) {
    return <Component size={size} strokeWidth={1.75} aria-hidden="true" data-mirror={mirror ? "" : undefined} className={className} {...rest} />;
  };

/** Drill-in: points left in RTL (into the page). */
export const IconDrillIn = base(ChevronLeft);
/** Back: points right in RTL (to the parent). */
export const IconBack = base(ChevronRight);
export const IconChevronDown = base(ChevronDown);
export const IconChevronUp = base(ChevronUp);
export const IconArrowBack = base(ArrowRight);
/** A link's arrow forward, at the end of its words ("השוואה לפיקדונות בבנקים אחרים ←"); points to the end side in RTL. */
export const IconArrowForward = base(ArrowLeft);
export const IconExternal = base(ExternalLink, true);
export const IconSearch = base(Search);
export const IconMenu = base(Menu);
export const IconClose = base(X);
export const IconClock = base(Clock);
export const IconAlert = base(CircleAlert);
export const IconLock = base(Lock);
export const IconCheck = base(Check);
export const IconMinus = base(Minus);
export const IconPencil = base(Pencil);
export const IconCalculator = base(Calculator);
export const IconFile = base(FileText);
export const IconAll = base(Layers);
export const IconReset = base(RotateCcw);
export const IconInfo = base(Info);
export const IconCalendar = base(CalendarDays);
export const IconCopy = base(Copy);
export const IconDownload = base(Download);
export const IconShare = base(Share2);
export const IconFileUp = base(FileUp);
