// A device store's writes and reads against a fake device (lib/device-store.ts, lib/keep-storage.ts): the request to keep the site's
// storage, once per device and only after a write of something the person made, and the other tab's write and the Back button read
// again only while the last write held. Each test loads the two modules afresh, as a page load does, and puts the globals back after.
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

const ASKED_KEY = "mekor.v2.storage-asked";

/** A device: its storage (which can refuse writes), the page's listeners, and the browser's storage calls. */
function fakeDevice(stored: Record<string, string> = {}) {
  const items = new Map(Object.entries(stored));
  const device = { refuse: false };
  const listeners = new Map<string, ((e: object) => void)[]>();
  const localStorage = {
    getItem: (k: string) => items.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (device.refuse) throw new Error("QuotaExceededError");
      items.set(k, v);
    },
    removeItem: (k: string) => void items.delete(k),
  };
  const window = {
    localStorage,
    addEventListener: (type: string, fn: (e: object) => void) => listeners.set(type, [...(listeners.get(type) ?? []), fn]),
  };
  const storage = { persisted: vi.fn(() => Promise.resolve(false)), persist: vi.fn(() => Promise.resolve(true)) };
  vi.stubGlobal("window", window);
  vi.stubGlobal("navigator", { storage });
  const fire = (type: string, e: object) => (listeners.get(type) ?? []).forEach((fn) => fn(e));
  return { items, device, storage, fire };
}

/** The modules as a fresh page load has them. */
async function load() {
  vi.resetModules();
  return import("./device-store");
}

/** The browser's answer to the request is a promise: let it settle. */
const settled = () => new Promise((r) => setTimeout(r, 0));

/** A store's value now, read through `update`, which writes it back unchanged. */
function valueOf<T>(store: { update(fn: (v: T) => T): void }): T | undefined {
  let seen: T | undefined;
  store.update((v) => (seen = v));
  return seen;
}

const text = (raw: unknown) => (typeof raw === "string" ? raw : "");

afterEach(() => vi.unstubAllGlobals());
afterAll(() => vi.resetModules());

describe("asking the browser to keep the site's storage", () => {
  it("a write of a place the page remembers asks nothing", async () => {
    const d = fakeDevice();
    const { deviceStore } = await load();
    deviceStore("test.kept", "", text, (v) => v, { holds: "kept" }).set("index-sp500");
    await settled();
    expect(d.storage.persisted).not.toHaveBeenCalled();
    expect(d.items.has(ASKED_KEY)).toBe(false);
  });

  it("a write the device refuses asks nothing; the first write of something the person made asks once and notes it on the device", async () => {
    const d = fakeDevice();
    const { deviceStore } = await load();
    const made = deviceStore("test.made", "", text, (v) => v, { holds: "made" });
    d.device.refuse = true;
    made.set("a rate");
    await settled();
    expect(d.storage.persisted).not.toHaveBeenCalled();
    d.device.refuse = false;
    made.set("a rate");
    made.set("another rate");
    await settled();
    expect(d.storage.persisted).toHaveBeenCalledTimes(1);
    expect(d.storage.persist).toHaveBeenCalledTimes(1);
    expect(d.items.get(ASKED_KEY)).toBe("1");
  });

  it("a device that noted the request is not asked again on a later load", async () => {
    const d = fakeDevice({ [ASKED_KEY]: "1" });
    const { deviceStore } = await load();
    deviceStore("test.made", "", text, (v) => v, { holds: "made" }).set("a rate");
    await settled();
    expect(d.storage.persisted).not.toHaveBeenCalled();
    expect(d.storage.persist).not.toHaveBeenCalled();
  });
});

describe("reading again what another tab wrote", () => {
  for (const [event, e] of [["pageshow", { persisted: true }], ["storage", { key: "test.value" }]] as const) {
    it(`${event}: read again after a write that held, never after one the device refused`, async () => {
      const d = fakeDevice({ "test.value": JSON.stringify("first") });
      const { deviceStore } = await load();
      const store = deviceStore("test.value", "", text, (v) => v, { holds: "kept" });
      expect(valueOf(store)).toBe("first");
      // the device refuses: the page holds what it could not write, and another tab's value does not replace it
      d.device.refuse = true;
      store.set("mine");
      d.items.set("test.value", JSON.stringify("other tab"));
      d.fire(event, e);
      expect(valueOf(store)).toBe("mine");
      // a write that holds: another tab's later value is read
      d.device.refuse = false;
      store.set("mine");
      d.items.set("test.value", JSON.stringify("other tab"));
      d.fire(event, e);
      expect(valueOf(store)).toBe("other tab");
    });
  }
});
