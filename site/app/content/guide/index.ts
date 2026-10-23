import type { GuideContent } from "./types";
import { content as kupatGemelLehashkaa } from "./kupat-gemel-lehashkaa";

/** One prose module per wrapper record under data/instruments/wrappers/. A record without prose still renders its data. */
export const guideContent: Record<string, GuideContent | undefined> = {
  "kupat-gemel-lehashkaa": kupatGemelLehashkaa,
};
