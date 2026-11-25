import { describe, expect, it } from "vitest";
import { canZoom, movedView, sameView, snapOf, viewBetween, type PlaneLimits, type PlaneView } from "./region-view";

const limits: PlaneLimits = { x: [0, 500_000], y: [0, 10_000], least: { x: 5000, y: 100 } };
const view: PlaneView = { x: [0, 80_000], y: [0, 2000] };

describe("a plane's view as a hand moves it (the region map)", () => {
  it("a drag keeps the point under the press under the pointer", () => {
    // pressed at a quarter across and half up, moved to half across and three quarters up: the view moves 20,000 left and 500 down
    expect(movedView({ x: [40_000, 120_000], y: [1000, 3000] }, [0.25, 0.5], [0.5, 0.75], 1, limits)).toEqual({ x: [20_000, 100_000], y: [500, 2500] });
  });

  it("a zoom keeps the point under the pointer where it is, and widens or narrows the view by its factor", () => {
    // halved about 60,000 today and 500 a month, three quarters across and a quarter up
    expect(movedView(view, [0.75, 0.25], [0.75, 0.25], 0.5, limits)).toEqual({ x: [30_000, 70_000], y: [250, 1250] });
  });

  it("holds the view inside the limits: never under 0, never past the end, never narrower than the least nor wider than the whole", () => {
    expect(movedView(view, [0.5, 0.5], [0.9, 0.9], 1, limits)).toEqual(view);
    expect(movedView({ x: [480_000, 500_000], y: [9000, 10_000] }, [0.5, 0.5], [0.1, 0.1], 1, limits)).toEqual({ x: [480_000, 500_000], y: [9000, 10_000] });
    expect(movedView(view, [0.5, 0.5], [0.5, 0.5], 0.01, limits)).toEqual({ x: [37_500, 42_500], y: [950, 1050] });
    expect(movedView(view, [0.5, 0.5], [0.5, 0.5], 100, limits)).toEqual({ x: [0, 500_000], y: [0, 10_000] });
  });

  it("can zoom in until both axes are at their least, and out until both reach their limits", () => {
    expect(canZoom(view, 1 / 1.5, limits)).toBe(true);
    expect(canZoom({ x: [0, 5000], y: [0, 100] }, 1 / 1.5, limits)).toBe(false);
    expect(canZoom({ x: [0, 5000], y: [0, 100] }, 1.5, limits)).toBe(true);
    expect(canZoom({ x: [0, 500_000], y: [0, 10_000] }, 1.5, limits)).toBe(false);
  });

  it("knows a view it is already on, and the frames of a move from one to another", () => {
    expect(sameView(view, { x: [0, 80_000.0001], y: [0, 2000] })).toBe(true);
    expect(sameView(view, { x: [1, 80_000], y: [0, 2000] })).toBe(false);
    expect(viewBetween(view, { x: [20_000, 60_000], y: [500, 1500] }, 0.5)).toEqual({ x: [10_000, 70_000], y: [250, 1750] });
  });

  it("rounds a read point to a power of ten about a fiftieth of the view", () => {
    expect([snapOf([0, 60_000]), snapOf([0, 1000]), snapOf([20_000, 25_000]), snapOf([300, 400])]).toEqual([1000, 10, 100, 1]);
  });
});
