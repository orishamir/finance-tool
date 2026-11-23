// The tab's title of an address a route matches but finds nothing at: the not-found page's, not the site's name alone.
import { describe, expect, it } from "vitest";
import { site, system } from "./copy";
import { meta } from "./root";

const titleOf = (error: unknown) => (meta({ location: { pathname: "/guide/nonexistent" }, error }).find((m) => "title" in m) as { title: string }).title;
const notFound = `${system.notFound.title} · ${site.name}`;

describe("the root's head", () => {
  it("says the page was not found where a loader found nothing, or its data file is missing", () => {
    // a loader's `throw new Response("Not found", { status: 404 })`, as the router hands it to the boundary
    expect(titleOf({ status: 404, statusText: "Not Found", internal: false, data: "Not found" })).toBe(notFound);
    expect(titleOf(new Error("Unable to decode turbo-stream response"))).toBe(notFound);
  });
  it("is the site's own name with no error, and for another failure", () => {
    expect(titleOf(undefined)).toBe(site.name);
    expect(titleOf(new Error("x is undefined"))).toBe(site.name);
  });
});
