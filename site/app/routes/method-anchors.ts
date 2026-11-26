// Where in docs/method.md each formula that it writes in words, with no line of math, is defined, pre-rendered as /method-anchors.json: the
// anchor GitHub gives the heading the formula stands under (`loadFormulaAnchors`). A formula's sheet fetches it when it opens, so the link to
// the full definition opens at that section; no page carries it.
export async function loader() {
  const { loadFormulaAnchors, loadFormulaTex } = await import("../lib/data.server");
  const tex = loadFormulaTex();
  return Response.json(Object.fromEntries(Object.entries(loadFormulaAnchors()).filter(([id]) => !tex[id]?.length)));
}
