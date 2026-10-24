// The values the person entered, shared by every guide page and saved on the device (product 3.1, flow 3
// step 7). They live in the v2 state document (lib/state.ts, key `mekor.v2.state`) with the goals and the
// holdings; the release 1 key `mekor.v1.inputs` is migrated there on first load.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { P05Input } from "@finance-tool/engine";
import { ensureLoaded, getSnapshot, inputsFromRecord, inputsToRecord, rememberName, updateState, useStateStore } from "./state";

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

const Ctx = createContext<InputsApi>({ state: empty, ready: false, setEntered: () => {}, setAge: () => {}, setEmployment: () => {}, resetAll: () => {} });

function load(): InputsState {
  const i = inputsFromRecord(ensureLoaded().state.inputs);
  return { entered: i.entered as InputsState["entered"], age: i.age, employment: i.employment };
}

export function InputsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InputsState>(empty);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  // an import or another tab changed the document: read the inputs again
  const external = useStateStore().external;
  const seen = useRef(external);
  useEffect(() => {
    if (!ready || seen.current === external) return;
    seen.current = external;
    setState(load());
  }, [external, ready]);

  // saved through the store (private mode or full storage: the page still works for this visit)
  useEffect(() => {
    if (!ready) return;
    updateState((s) => {
      const record = inputsToRecord(state);
      return sameInputs(inputsFromRecord(s.inputs), state) ? s : { ...s, inputs: keepDates(s.inputs, record) };
    });
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

const sameInputs = (a: ReturnType<typeof inputsFromRecord>, b: InputsState) => JSON.stringify([a.entered, a.age, a.employment]) === JSON.stringify([b.entered, b.age, b.employment]);

/** A value that did not change keeps its saved object (and its date). */
function keepDates(old: ReturnType<typeof getSnapshot>["state"]["inputs"], next: ReturnType<typeof getSnapshot>["state"]["inputs"]) {
  return Object.fromEntries(Object.entries(next).map(([k, v]) => [k, old[k] && old[k]!.value === v.value ? old[k]! : v]));
}

export function useInputs(): InputsApi {
  return useContext(Ctx);
}

/** Names a person saved that the site could not match (flow 6, product 3.10): kept in the state document. */
export function rememberUncatalogued(name: string) {
  rememberName(name);
}
