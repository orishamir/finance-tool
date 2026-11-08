import type { Config } from "@react-router/dev/config";

// Static site, no runtime server (docs/architecture.md K1): every route is pre-rendered at build, with
// its loader data written beside it. Served by GitHub Pages as a project site, under /finance-tool/.
export default {
  ssr: false,
  // QUICK=1 skips the ~890 company and track pages, for a quick local build (about 12 s instead of 40); QUICK=/companies/x,...
  // keeps those listed. One of each kind is always built, since every route with a loader must be pre-rendered. GitHub
  // always builds every page.
  prerender: async () => {
    const { prerenderPaths } = await import("./app/lib/paths.server");
    const all = prerenderPaths();
    if (!process.env.QUICK) return all;
    const only = process.env.QUICK.split(",").map((p) => p.trim());
    const depth = (p: string) => p.split("/").length;
    const firstOf = new Set([2, 3, 4].map((d) => all.find((p) => p.startsWith("/companies") && depth(p) === d)));
    return all.filter((p) => !p.startsWith("/companies") || only.includes(p) || firstOf.has(p));
  },
  basename: "/finance-tool/",
} satisfies Config;
