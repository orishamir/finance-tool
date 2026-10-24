// A small store for one value kept on this device under its own localStorage key (release 4 workbench: offers, variant
// assumptions). It reads after hydration (the pre-rendered page and the first client render see the empty value), writes
// on every change, tells the page when the device refuses a write, and follows other tabs. Browser only.
// TODO(state v3): the keys of this store belong inside `mekor.v3.state` (design-spec 16.5); merge when lib/state.ts is free.
import { useSyncExternalStore } from "react";

export interface DeviceSnapshot<T> {
  value: T;
  /** The saved value has been read from the device (false on the pre-rendered page and before the first read). */
  ready: boolean;
  /** The device lets the page write (private mode and a full disk do not). */
  writable: boolean;
}

export interface DeviceStore<T> {
  use(): DeviceSnapshot<T>;
  /** Replaces the value (browser only). */
  set(next: T): void;
  /** Applies a change to the current value. */
  update(fn: (v: T) => T): void;
  /** For tests: forget everything the store read. */
  reset(): void;
}

export function deviceStore<T>(key: string, empty: T, parse: (raw: unknown) => T, serialize: (v: T) => unknown): DeviceStore<T> {
  const none: DeviceSnapshot<T> = { value: empty, ready: false, writable: true };
  let current = none;
  let loaded = false;
  const listeners = new Set<() => void>();
  const emit = (next: DeviceSnapshot<T>) => {
    current = next;
    listeners.forEach((l) => l());
  };
  const read = (): DeviceSnapshot<T> => {
    try {
      const raw = window.localStorage.getItem(key);
      return { value: raw ? parse(JSON.parse(raw)) : empty, ready: true, writable: true };
    } catch {
      return { value: empty, ready: true, writable: false };
    }
  };
  const ensure = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    current = read();
    window.addEventListener("storage", (e) => {
      if (e.key === key) emit(read());
    });
  };
  const subscribe = (l: () => void) => {
    ensure();
    listeners.add(l);
    queueMicrotask(l);
    return () => void listeners.delete(l);
  };
  const set = (next: T) => {
    ensure();
    let writable = true;
    try {
      window.localStorage.setItem(key, JSON.stringify(serialize(next)));
    } catch {
      writable = false;
    }
    emit({ value: next, ready: true, writable });
  };
  return {
    use: () => useSyncExternalStore(subscribe, () => current, () => none),
    set,
    update: (fn) => {
      ensure();
      set(fn(current.value));
    },
    reset: () => {
      loaded = false;
      current = none;
    },
  };
}
