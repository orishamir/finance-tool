// The root loader's data (root.tsx): the same for every page, so a production build's prerender builds it once instead of once for each of
// its ~1,900 requests (about a fifth of a fund page's time); the dev server and the tests build it on every call.
import { builtOnce } from "./read-cache.server";
import { loadFormulaParameters, loadFormulaTex, loadOpenQuestions, loadParameterAnchors, loadPublishersHe } from "./data.server";
import { companyLinks, ownDocuments } from "./institutions.server";

export const rootData = builtOnce(() => ({
  formulaParameters: loadFormulaParameters(),
  formulaTex: loadFormulaTex(),
  parameterAnchors: loadParameterAnchors(),
  publishersHe: loadPublishersHe(),
  openQuestions: loadOpenQuestions(),
  companies: companyLinks(),
  ownDocs: ownDocuments(),
}));
