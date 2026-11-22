// The site asks the browser once to keep its storage (`navigator.storage.persist()`), after the person's first saved edit or export:
// only then is there something of theirs to keep, and a browser that asks the person (Firefox shows a prompt) asks about something they
// just did. That it has asked is kept on the device, so the question is never put again on a later visit; where the device keeps nothing,
// it is asked once per load. The browser's answer changes nothing on the page: the export file stays the backup.

/** The device's note that the site has asked; a flag outside the saved state, never exported. */
const ASKED_KEY = "mekor.v2.storage-asked";
let askedThisLoad = false;

function askedBefore(): boolean {
  try {
    return window.localStorage.getItem(ASKED_KEY) !== null;
  } catch {
    return false;
  }
}

function noteAsked(): void {
  try {
    window.localStorage.setItem(ASKED_KEY, "1");
  } catch (e) {
    // the device keeps nothing: asked again on the next load, where there is a saved edit or an export again
    console.error(e);
  }
}

/** Asks the browser to keep the site's storage, unless the site has asked before on this device or the browser has no such call. */
export function askToKeepStorage(): void {
  if (askedThisLoad || typeof navigator === "undefined" || typeof navigator.storage?.persist !== "function") return;
  askedThisLoad = true;
  if (askedBefore()) return;
  noteAsked();
  // refused, or the browser would not say: nothing changes
  navigator.storage
    .persisted()
    .then((kept) => kept || navigator.storage.persist())
    .catch((e: unknown) => console.error(e));
}
