// Ids for the things a person makes on the device (a deal and its fees, a fund or a house typed by hand).

/** Ids made on this page so far: the count keeps ids made in one millisecond apart (a template's fees, a link's, a file's entries). */
let made = 0;

/** A new id after `prefix`: the time, the count on this page, and a random part that keeps ids made on two pages at once apart. */
export const newId = (prefix: string): string => `${prefix}${Date.now().toString(36)}-${(made++).toString(36)}-${Math.floor(Math.random() * 1296).toString(36)}`;
