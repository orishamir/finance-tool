// Which of our modules run code when they load (beyond declaring what they export), for the browser build (site/vite.config.ts).
// Every other module of the site and of the engine and schema packages is declared free of side effects there, so a module reached
// only through a re-export no one uses (the kit's index, the schema package's index) stays out of a page's scripts, and the script
// every page loads holds only what the frame of every page uses. side-effect-modules.test.ts fails when a module that runs code at
// load is missing here.

/** The modules, as a path ending, from the repository root. */
export const SIDE_EFFECT_MODULES = [
  "site/app/root.tsx", // reads the kept scroll positions
  "site/app/entry.client.tsx", // starts the app
  "site/app/copy.ts", // adds a name to its own parameters page list
  "site/app/lib/providers.ts", // adds formula names and flags to copy.ts
  "site/app/lib/compare.ts", // adds formula names to copy.ts
] as const;

/** Our own source modules: the site's app and the engine and schema packages, TypeScript only (a style sheet keeps its effect). */
const OURS = /\/(site\/app|packages\/(engine|schema)\/src)\/[^?]*\.tsx?(\?.*)?$/;

/** Whether the bundler must keep a module for what it does at load even when nothing it exports is used. */
export function hasSideEffects(id: string): boolean {
  if (!OURS.test(id)) return true;
  const path = id.replace(/\?.*$/, "").replace(/\\/g, "/");
  return SIDE_EFFECT_MODULES.some((m) => path.endsWith(`/${m}`));
}
