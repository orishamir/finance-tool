// Screenshot a region of a local PNG at 2x, for looking closely at dot clusters. Usage: node zoom.mjs in.png out.png x y w h
import { createRequire } from "module";
import { readFileSync } from "fs";
const require = createRequire("/home/ori/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/");
const { chromium } = require("playwright");
const [inp, out, x, y, w, h] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: "/home/ori/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome" });
const page = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
await page.setContent(`<body style="margin:0;overflow:hidden"><img src="data:image/png;base64,${readFileSync(inp).toString("base64")}" style="position:absolute;left:${-x}px;top:${-y}px;image-rendering:pixelated"></body>`);
await page.screenshot({ path: out });
await b.close();
