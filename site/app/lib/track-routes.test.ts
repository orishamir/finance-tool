// The addresses of the track browser (D54): /tracks and each of the six products are pre-rendered, and an unknown product is a 404.
import { describe, expect, it } from "vitest";
import { loader } from "../routes/tracks";
import { prerenderPaths } from "./paths.server";
import { trackProductIds } from "./track-browser";

describe("the track browser's addresses", () => {
  const paths = new Set(prerenderPaths());

  it("pre-renders /tracks and a page for each of the six products", () => {
    expect(paths.has("/tracks")).toBe(true);
    for (const id of trackProductIds) expect(paths.has(`/tracks/${id}`), id).toBe(true);
  });

  it("an unknown product is not found, and the default product loads", async () => {
    await expect(loader({ params: { product: "nonsense" } } as never)).rejects.toMatchObject({ status: 404 });
    const data = (await loader({ params: {} } as never)) as { data: { products: unknown[] } };
    expect(data.data.products).toHaveLength(6);
  }, 120_000);
});
