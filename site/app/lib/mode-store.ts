// The real / nominal switch ("בשקלים של היום" or "של העתיד"), remembered on this device (audit 2026-10-24 A79): it was
// back on "real" after every reload. One side store like the workbench's (device-store.ts), shared by every page that
// has the switch, so the choice on one page is the choice on the next. Reads after hydration: the pre-rendered page and
// the first client render show "real".
import { deviceStore } from "./device-store";

export type ValueMode = "real" | "nominal";

const store = deviceStore<ValueMode>("mekor.v2.value-mode", "real", (raw) => (raw === "nominal" ? "nominal" : "real"), (v) => v);

/** `[mode, setMode]`: the remembered switch. Call it in place of `useState<Mode>("real")`. */
export function useValueMode(): [ValueMode, (m: ValueMode) => void] {
  const { value } = store.use();
  return [value, store.set];
}

export const valueModeStore = store;
