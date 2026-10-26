// One read of each file per process (tests, the build's prerender, the dev server): a page's loader reads the same records many times
// (every rule card's page reads all ~600 rule records), and reading and checking them again each time was most of the tests' and the
// build's time. A file is read again when its modification time changes, so the dev server still shows an edit. What comes back is
// frozen, deep: it is shared by every caller, so a caller that changed it would change it for every page; copy before changing.
import { readFileSync, statSync } from "node:fs";
import type { z } from "zod";

interface Entry<T> {
  mtime: number;
  value: T;
}

function mtimeOf(path: string): number {
  return statSync(path).mtimeMs;
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
  const mtime = mtimeOf(path);
  const hit = texts.get(path);
  if (hit && hit.mtime === mtime) return hit.value;
  const value = readFileSync(path, "utf8");
  texts.set(path, { mtime, value });
  return value;
}

const raw = new Map<string, Entry<unknown>>();

/** A JSON file as it stands (no schema), read once while it is unchanged; frozen. */
export function readJsonCached<T = unknown>(path: string): T {
  const mtime = mtimeOf(path);
  const hit = raw.get(path);
  if (hit && hit.mtime === mtime) return hit.value as T;
  const value = deepFreeze(JSON.parse(readFileSync(path, "utf8")) as unknown);
  raw.set(path, { mtime, value });
  return value as T;
}

const parsed = new WeakMap<z.ZodType, Map<string, Entry<unknown>>>();

/** A JSON file checked against a schema, once per schema while the file is unchanged; frozen. Throws, naming the file, on a problem. */
export function readParsedCached<T extends z.ZodType>(path: string, schema: T): z.infer<T> {
  let bySchema = parsed.get(schema);
  if (!bySchema) parsed.set(schema, (bySchema = new Map()));
  const mtime = mtimeOf(path);
  const hit = bySchema.get(path);
  if (hit && hit.mtime === mtime) return hit.value as z.infer<T>;
  const result = schema.safeParse(JSON.parse(readFileSync(path, "utf8")));
  if (!result.success) throw new Error(`${path}: ${result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
  const value = deepFreeze(result.data);
  bySchema.set(path, { mtime, value });
  return value;
}
