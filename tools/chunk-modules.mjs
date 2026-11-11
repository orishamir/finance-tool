// A Vite plugin for tools/weight.mjs: with CHUNK_REPORT=1 set during `npm run build`, it writes site/build/chunk-modules.json, what each
// browser script file holds, module by module (the code before minifying, raw and gzipped, so a module's share of its file can be read).
// Without CHUNK_REPORT it does nothing. The server-side build is left out: only what a reader downloads matters here.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, relative } from "node:path";
import { gzipSync } from "node:zlib";

export function chunkModules(out) {
  return {
    name: "chunk-modules",
    apply: "build",
    generateBundle(_options, bundle) {
      if (!process.env.CHUNK_REPORT || this.environment?.name !== "client") return;
      const root = process.cwd();
      const chunks = {};
      for (const [file, c] of Object.entries(bundle)) {
        if (c.type !== "chunk") continue;
        const modules = Object.entries(c.modules)
          .map(([id, m]) => ({ id: relative(root, id.replace(/\?.*$/, "")), raw: m.renderedLength, gz: m.code ? gzipSync(m.code).length : 0 }))
          .filter((m) => m.raw > 0)
          .sort((a, b) => b.raw - a.raw);
        chunks[file] = { imports: c.imports, dynamicImports: c.dynamicImports, modules };
      }
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, JSON.stringify(chunks, null, 1));
    },
  };
}
