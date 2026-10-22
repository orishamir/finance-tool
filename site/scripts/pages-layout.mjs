// Lays out build/client for GitHub Pages, which serves the artifact root at /finance-tool/.
// React Router writes pre-rendered pages under build/client/finance-tool/ (the basename) and the
// SPA fallback at build/client/index.html. Pages wants the pages at the root and serves 404.html
// for any path it has no file for, so the fallback becomes 404.html and can hydrate that path.
import { cpSync, existsSync, renameSync, rmSync } from "node:fs";

const client = new URL("../build/client/", import.meta.url);
const prerendered = new URL("finance-tool/", client);

if (!existsSync(prerendered)) throw new Error("no pre-rendered pages under build/client/finance-tool/");
renameSync(new URL("index.html", client), new URL("404.html", client));
cpSync(prerendered, client, { recursive: true });
rmSync(prerendered, { recursive: true });
