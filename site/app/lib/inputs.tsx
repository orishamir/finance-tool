// The values the person entered, shared by every guide page and saved on the device (product 3.1, flow 3
// step 7). R1 keeps them in localStorage under a versioned key; the IndexedDB state document with
// migrations and export arrives with R2 and R3 (architecture 3.6).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { P05Input } from "@finance-tool/engine";

export type Employment = "employee" | "self-employed";

export interface InputsState {
  entered: Partial<Record<P05Input, number>>;
  age: number | null;
  employment: Employment | null;
}

interface InputsApi {
  state: InputsState;
  /** False until the saved state has been read after hydration; the pre-rendered page shows P-05. */
  ready: boolean;
  setEntered: (key: P05Input, value: number | null) => void;
  setAge: (age: number | null) => void;
  setEmployment: (e: Employment | null) => void;
  resetAll: () => void;
}

const empty: InputsState = { entered: {}, age: null, employment: null };
const KEY = "mekor.v1.inputs";

const Ctx = createContext<InputsApi>({ state: empty, ready: false, setEntered: () => {}, setAge: () => {}, setEmployment: () => {}, resetAll: () => {} });

function load(): InputsState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<InputsState>;
    return { entered: parsed.entered ?? {}, age: typeof parsed.age === "number" ? parsed.age : null, employment: parsed.employment ?? null };
  } catch {
    return empty;
  }
}

export function InputsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InputsState>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* private mode or full storage: the page still works for this visit */
    }
  }, [state, ready]);

  const setEntered = useCallback((key: P05Input, value: number | null) => {
    setState((s) => {
      const entered = { ...s.entered };
      if (value === null) delete entered[key];
      else entered[key] = value;
      return { ...s, entered };
    });
  }, []);
  const setAge = useCallback((age: number | null) => setState((s) => ({ ...s, age })), []);
  const setEmployment = useCallback((employment: Employment | null) => setState((s) => ({ ...s, employment })), []);
  const resetAll = useCallback(() => setState(empty), []);

  const api = useMemo(() => ({ state, ready, setEntered, setAge, setEmployment, resetAll }), [state, ready, setEntered, setAge, setEmployment, resetAll]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useInputs(): InputsApi {
  return useContext(Ctx);
}

/** Names a person saved that the site could not match (flow 6, product 3.10). */
export function rememberUncatalogued(name: string) {
  try {
    const key = "mekor.v1.uncatalogued";
    const list = JSON.parse(localStorage.getItem(key) ?? "[]") as { name: string; date: string }[];
    if (!list.some((x) => x.name === name)) list.push({ name, date: new Date().toISOString().slice(0, 10) });
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* nothing to do: the copy button still works */
  }
}
