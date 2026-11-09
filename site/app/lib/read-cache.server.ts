// One read of each file per process (tests, the build's prerender, the dev server): a page's loader reads the same records many times
// (every rule card's page reads all ~600 rule records), and reading and checking them again each time was most of the tests' and the
// build's time. A file is read again when its modification time changes, so the dev server still shows an edit (a production build's
// prerender, where nothing under data/ changes, reads each file once and checks no times; see `watching`). What comes back is
// frozen, deep: it is shared by every caller, so a caller that changed it would change it for every page; copy before changing. A record
// under data/ first gains the words its cited web pages open at (`withFragments`, fragments.server.ts).
import { readFileSync, statSync } from "node:fs";
import type { z } from "zod";
import { fragmentsMtime, withFragments } from "./fragments.server";

interface Entry<T> {
  mtime: number | string;
  value: T;
}

/**
 * Whether a file can change while this process runs: in the dev server and the tests, so a read checks the file's time; not in a
 * production build, whose prerender reads every file once (checking two file times on every read was a fifth of the prerender's time).
 * Plain node (vite.config.ts reading data-as-of.ts) has no import.meta.env, and checks.
 */
export const watching = import.meta.env?.DEV !== false;

/**
 * A value built from files that is the same for every page (the root loader's): built once in a production build, and again on every call
 * where files can change. Frozen, as the cache's records are, since every page shares it.
 */
export function builtOnce<T>(build: () => T): () => T {
  let built: { value: T } | null = null;
  return () => (watching ? build() : (built ??= { value: deepFreeze(build()) }).value);
}

function mtimeOf(path: string): number {
  return statSync(path).mtimeMs;
}

/** A record's own time and the fragments file's, so either change reads the record again (the words a cited page opens at). */
function recordMtime(path: string): string {
  return `${mtimeOf(path)}:${fragmentsMtime(path)}`;
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const v of Object.values(value as object)) deepFreeze(v);
  return value;
}

const texts = new Map<string, Entry<string>>();

/** A file's text, read once while it is unchanged. */
export function readTextCached(path: string): string {
  const hit = texts.get(path);
  if (hit && !watching) return hit.value;
  const mtime = mtimeOf(path);
  if (hit && hit.mtime === mtime) return hit.value;
  const value = readFileSync(path, "utf8");
  texts.set(path, { mtime, value });
  return value;
}

const raw = new Map<string, Entry<unknown>>();

/** A JSON file as it stands (no schema), read once while it is unchanged; frozen. */
export function readJsonCached<T = unknown>(path: string): T {
  const hit = raw.get(path);
  if (hit && !watching) return hit.value as T;
  const mtime = recordMtime(path);
  if (hit && hit.mtime === mtime) return hit.value as T;
  const value = deepFreeze(withFragments(JSON.parse(readFileSync(path, "utf8")) as unknown, path));
  raw.set(path, { mtime, value });
  return value as T;
}

const parsed = new WeakMap<z.ZodType, Map<string, Entry<unknown>>>();

/** A JSON file checked against a schema, once per schema while the file is unchanged; frozen. Throws, naming the file, on a problem. */
export function readParsedCached<T extends z.ZodType>(path: string, schema: T): z.infer<T> {
  let bySchema = parsed.get(schema);
  if (!bySchema) parsed.set(schema, (bySchema = new Map()));
  const hit = bySchema.get(path);
  if (hit && !watching) return hit.value as z.infer<T>;
  const mtime = recordMtime(path);
  if (hit && hit.mtime === mtime) return hit.value as z.infer<T>;
  const result = schema.safeParse(JSON.parse(readFileSync(path, "utf8")));
  if (!result.success) throw new Error(`${path}: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  const value = deepFreeze(withFragments(result.data, path));
  bySchema.set(path, { mtime, value });
  return value;
}
