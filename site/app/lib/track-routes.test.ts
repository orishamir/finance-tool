// The addresses of the track browser (D54): /tracks and each of the six products are pre-rendered, the old workbench address of each sends
// the browser on, an unknown product is a 404, and every link the site writes to a product's tracks is a page it pre-renders.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loader as oldLoader } from "../routes/workbench-tracks";
import { loader } from "../routes/tracks";
import { prerenderPaths } from "./paths.server";
import { providerWrapperIds } from "./providers.server";
import { trackProductIds } from "./track-browser";

describe("the track browser's addresses", () => {
  const paths = new Set(prerenderPaths());

  it("pre-renders /tracks and a page for each of the six products, and the old address of each", () => {
    expect(paths.has("/tracks")).toBe(true);
    for (const id of trackProductIds) {
      expect(paths.has(`/tracks/${id}`), id).toBe(true);
      expect(paths.has(`/workbench/tracks/${id}`), id).toBe(true);
    }
  });

  it("the old address sends the browser to the new one", () => {
    const res = oldLoader({ params: { wrapper: "kupat-gemel-lehashkaa" } } as never) as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/tracks/kupat-gemel-lehashkaa");
  });

  it("an unknown product is not found, and the default product loads", async () => {
    await expect(loader({ params: { product: "nonsense" } } as never)).rejects.toMatchObject({ status: 404 });
    const data = (await loader({ params: {} } as never)) as { data: { products: unknown[] } };
    expect(data.data.products).toHaveLength(6);
  }, 120_000);

  it("the securities account and child savings have no providers page, so nothing leads to one", () => {
    expect(providerWrapperIds()).not.toContain("brokerage-account");
    expect(providerWrapperIds()).not.toContain("child-savings-provident");
    expect(paths.has("/workbench/providers/brokerage-account")).toBe(false);
  });

  it("no page of the site links to the old address", () => {
    const root = new URL("..", import.meta.url).pathname;
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const f = join(dir, name);
        if (statSync(f).isDirectory()) walk(f);
        else if (/\.(ts|tsx)$/.test(name) && !/\.test\./.test(name)) files.push(f);
      }
    };
    walk(root);
    const offenders = files.filter((f) => !/routes\/workbench-tracks\.tsx$|lib\/paths\.server\.ts$|routes\.ts$/.test(f) && readFileSync(f, "utf8").includes("/workbench/tracks"));
    expect(offenders).toEqual([]);
  });
});
