import type { Config } from "@react-router/dev/config";

// Static site, no runtime server (docs/architecture.md K1): every route is pre-rendered at build.
// Served by GitHub Pages as a project site, under /finance-tool/.
export default {
  ssr: false,
  prerender: true,
  basename: "/finance-tool/",
} satisfies Config;
