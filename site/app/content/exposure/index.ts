import type { ExposureContent } from "../guide/types";

/**
 * One prose module per exposure record under data/instruments/exposures/, `app/content/exposure/<id>.tsx`
 * exporting `content: ExposureContent`. Modules are picked up by file name, so the seven ids (shekel-cash, makam,
 * government-bond-unlinked, government-bond-cpi, index-sp500, index-ta125, general-track) wire themselves when
 * their file exists. A record without prose still renders its data.
 */
const modules = import.meta.glob<{ content: ExposureContent }>("./*.tsx", { eager: true });

export const exposureContent: Record<string, ExposureContent | undefined> = Object.fromEntries(
  Object.entries(modules).map(([path, m]) => [path.replace(/^\.\//, "").replace(/\.tsx$/, ""), m.content]),
);
