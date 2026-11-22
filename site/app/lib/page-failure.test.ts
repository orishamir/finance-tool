// Which failures on a page are the site's own and raise its failure notice (lib/page-failure.ts).
import { describe, expect, it } from "vitest";
import { isOwnError, isOwnRejection } from "./page-failure";

const own = "https://example.test/finance-tool/";

describe("a failure is the site's only where its own scripts are in it", () => {
  it("an exception: thrown in a script under the site's origin and base path", () => {
    expect(isOwnError("https://example.test/finance-tool/assets/index-abc.js", own)).toBe(true);
    expect(isOwnError("https://example.test/finance-tool/guide", own)).toBe(true);
    // a browser extension, another site on the same host, another site, the browser's own (no address)
    expect(isOwnError("chrome-extension://abcdef/content.js", own)).toBe(false);
    expect(isOwnError("https://example.test/other/app.js", own)).toBe(false);
    expect(isOwnError("https://cdn.example.org/x.js", own)).toBe(false);
    expect(isOwnError("", own)).toBe(false);
    expect(isOwnError(undefined, own)).toBe(false);
  });
  it("a rejection: its stack runs through a script of the site, in Chrome's form or Firefox's", () => {
    const chrome = Object.assign(new Error("x"), { stack: "Error: x\n    at load (https://example.test/finance-tool/assets/page-1.js:1:200)" });
    const firefox = Object.assign(new Error("x"), { stack: "load@https://example.test/finance-tool/assets/page-1.js:1:200\n" });
    const extension = Object.assign(new Error("x"), { stack: "Error: x\n    at run (chrome-extension://abcdef/content.js:3:9)" });
    expect(isOwnRejection(chrome, own)).toBe(true);
    expect(isOwnRejection(firefox, own)).toBe(true);
    expect(isOwnRejection(extension, own)).toBe(false);
    // a reason that is no error has no stack to say whose it is
    expect(isOwnRejection("failed", own)).toBe(false);
    expect(isOwnRejection(undefined, own)).toBe(false);
  });
});
