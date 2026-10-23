import type { Config } from "@react-router/dev/config";

// Static site, no runtime server (docs/architecture.md K1): every route is pre-rendered at build, with
// its loader data written beside it. Served by GitHub Pages as a project site, under /finance-tool/.
export default {
  ssr: false,
  prerender: async () => {
    const { prerenderPaths } = await import("./app/lib/paths.server");
    return prerenderPaths();
  },
  basename: "/finance-tool/",
} satisfies Config;
