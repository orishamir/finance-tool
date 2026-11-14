// The prerender time check: a Vite plugin that times every request the build's prerender makes and warns when one nears the time
// React Router gives it. The prerender asks Vite's preview server for each page and data file, and fails the build on any request that
// takes longer than its timeout (`timeout = 1e4` in @react-router/dev's prerender plugin, which the config cannot change). A page that
// takes half of that on this machine can pass here and still fail on a slower GitHub runner, so the warning starts at half.
// On GitHub the warning is also an annotation on the run.

/** React Router's prerender timeout, in milliseconds (@react-router/dev, vite/plugins/prerender.ts). */
export const PRERENDER_TIMEOUT_MS = 10_000;

/** The share of the timeout from which a request is reported. */
export const WARN_SHARE = 0.5;

/** The warning for a request that took `ms`, or null when it is well under the timeout. */
export function slowPrerender(path, ms, timeout = PRERENDER_TIMEOUT_MS, share = WARN_SHARE) {
  if (ms < timeout * share) return null;
  return `prerender of ${path} took ${(ms / 1000).toFixed(1)} s, ${Math.round((100 * ms) / timeout)}% of the ${timeout / 1000} s React Router allows a request: a slower machine can time it out`;
}

export function prerenderTime() {
  return {
    name: "prerender-time",
    configurePreviewServer(server) {
      // only the build's own prerender; a preview opened by hand is not timed
      if (process.env.IS_RR_BUILD_REQUEST !== "yes") return;
      let slowest = { path: "", ms: 0 };
      server.middlewares.use((req, res, next) => {
        const start = performance.now();
        res.on("finish", () => {
          const ms = performance.now() - start;
          const path = decodeURI((req.url ?? "").split("?")[0]);
          if (ms > slowest.ms) slowest = { path, ms };
          const warning = slowPrerender(path, ms);
          if (!warning) return;
          console.warn(`[prerender-time] ${warning}`);
          if (process.env.GITHUB_ACTIONS) console.log(`::warning title=Prerender near its timeout::${warning}`);
        });
        next();
      });
      server.httpServer?.on("close", () => {
        if (slowest.path) console.log(`[prerender-time] slowest prerender: ${slowest.path}, ${(slowest.ms / 1000).toFixed(1)} s of ${PRERENDER_TIMEOUT_MS / 1000} s`);
      });
    },
  };
}
