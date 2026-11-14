// The type of site/scripts/prerender-time.mjs, for site/vite.config.ts and its test.
import type { Plugin } from "vite";
export const PRERENDER_TIMEOUT_MS: number;
export const WARN_SHARE: number;
export function slowPrerender(path: string, ms: number, timeout?: number, share?: number): string | null;
export function prerenderTime(): Plugin;
