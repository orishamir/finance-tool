import { fileURLToPath } from "node:url";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { newestChecked } from "./app/lib/data-as-of.ts";

export default defineConfig({
  // Must match `basename` in react-router.config.ts (GitHub Pages project path).
  base: "/finance-tool/",
  plugins: [tailwindcss(), reactRouter()],
  resolve: { tsconfigPaths: true },
  // The newest `checked` date in data/, for the footer ("נתונים נכון ל־"); same value as `dataAsOf()` in lib/data.server.ts.
  define: { __DATA_AS_OF__: JSON.stringify(newestChecked(fileURLToPath(new URL("../data", import.meta.url)))) },
});
