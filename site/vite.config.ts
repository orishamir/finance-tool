import { fileURLToPath } from "node:url";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { newestChecked } from "./app/lib/data-as-of.ts";
import { hasSideEffects } from "./app/lib/side-effect-modules.ts";
import { chunkModules } from "../tools/chunk-modules.mjs";

export default defineConfig({
  // Must match `basename` in react-router.config.ts (GitHub Pages project path).
  base: "/finance-tool/",
  // chunkModules writes build/chunk-modules.json only when CHUNK_REPORT is set (tools/weight.mjs reads it)
  plugins: [tailwindcss(), reactRouter(), chunkModules(fileURLToPath(new URL("build/chunk-modules.json", import.meta.url)))],
  resolve: { tsconfigPaths: true },
  // The browser build reads our own modules as free of side effects, except those app/lib/side-effect-modules.ts lists: a module
  // reached only through a re-export nobody uses (the kit's index, the schema package's index) then stays out of a page's scripts,
  // and the script every page loads holds what the frame of every page uses, not the whole kit and engine (tools/weight.mjs).
  environments: { client: { build: { rolldownOptions: { treeshake: { moduleSideEffects: hasSideEffects } } } } },
  // The newest `checked` date in data/, for the footer ("נתונים נכון ל־"); same value as `dataAsOf()` in lib/data.server.ts.
  define: { __DATA_AS_OF__: JSON.stringify(newestChecked(fileURLToPath(new URL("../data", import.meta.url)))) },
});
