// Lucide icons release 3's holdings and transfer screens add (design-system 2.8). Same 1.75px stroke; none mirrors.
import { Download, FileUp, Share2, Upload, type LucideProps } from "lucide-react";

type IconProps = Omit<LucideProps, "ref"> & { size?: 14 | 16 | 18 | 20 | 24 };

const base = (Component: React.ComponentType<LucideProps>) =>
  function Icon({ size = 20, className, ...rest }: IconProps) {
    return <Component size={size} strokeWidth={1.75} aria-hidden="true" className={className} {...rest} />;
  };

export const IconDownload = base(Download);
export const IconShare = base(Share2);
export const IconUpload = base(Upload);
export const IconFileUp = base(FileUp);
