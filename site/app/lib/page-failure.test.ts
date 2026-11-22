// Which failures on a page are the site's own and raise its failure notice (lib/page-failure.ts).
import { describe, expect, it } from "vitest";
import { isOwnError, isOwnRejection } from "./page-failure";

const own = "https://example.test/finance-tool/";

describe("a failure is the site's only where its own scripts are in it", () => {
  it("an exception: a thrown value, in a script under the site's origin and base path", () => {
    const thrown = (filename: unknown) => ({ filename, error: new Error("x") });
    expect(isOwnError(thrown("https://example.test/finance-tool/assets/index-abc.js"), own)).toBe(true);
    expect(isOwnError(thrown("https://example.test/finance-tool/guide"), own)).toBe(true);
    // a browser extension, another site on the same host, another site, no address
    expect(isOwnError(thrown("chrome-extension://abcdef/content.js"), own)).toBe(false);
    expect(isOwnError(thrown("https://example.test/other/app.js"), own)).toBe(false);
    expect(isOwnError(thrown("https://cdn.example.org/x.js"), own)).toBe(false);
    expect(isOwnError(thrown(""), own)).toBe(false);
    expect(isOwnError(thrown(undefined), own)).toBe(false);
  });
  it("the browser's own report under the page's address, with no thrown value (Chrome's ResizeObserver loop), is not the site's", () => {
    expect(isOwnError({ filename: "https://example.test/finance-tool/deal", error: null }, own)).toBe(false);
    expect(isOwnError({ filename: "https://example.test/finance-tool/deal", error: undefined }, own)).toBe(false);
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
