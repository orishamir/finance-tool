import type { ExposureContent } from "../guide/types";

/**
 * One prose module per exposure record under data/instruments/exposures/, `app/content/exposure/<id>.tsx`
 * exporting `content: ExposureContent`. Modules are picked up by file name, so an id wires itself when its file exists.
 * A record without prose still renders its data. Makam and the government bonds have no file: their page is the
 * security's guide page (D6 as amended 2026-10-27).
 */
const modules = import.meta.glob<{ content: ExposureContent }>("./*.tsx", { eager: true });

export const exposureContent: Record<string, ExposureContent | undefined> = Object.fromEntries(
  Object.entries(modules).map(([path, m]) => [path.replace(/^\.\//, "").replace(/\.tsx$/, ""), m.content]),
);
