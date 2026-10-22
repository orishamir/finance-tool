import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  // Must match `basename` in react-router.config.ts (GitHub Pages project path).
  base: "/finance-tool/",
  plugins: [tailwindcss(), reactRouter()],
  resolve: { tsconfigPaths: true },
});
