import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("guide", "routes/guide-index.tsx"),
  route("guide/limited-bond-fund", "routes/guide-limited-bond-fund.tsx"),
  route("guide/mutual-funds", "routes/guide-mutual-funds.tsx"),
  route("guide/:id", "routes/guide.tsx"),
  route("exposure/:id", "routes/exposure.tsx"),
  route("companies", "routes/companies.tsx"),
  route("company-figures.json", "routes/company-figures.ts"),
  route("companies/:id", "routes/company.tsx"),
  route("companies/:id/:fund", "routes/track.tsx"),
  route("rules", "routes/rules.tsx"),
  route("rules/:shelf", "routes/rules-shelf.tsx"),
  route("rules-data/:shelf.json", "routes/rules-data.ts"),
  route("documents", "routes/documents.tsx"),
  route("parameters", "routes/parameters.tsx"),
  route("not-covered", "routes/not-covered.tsx"),
  route("search-index.json", "routes/search-index.ts"),
  route("search-texts.json", "routes/search-texts.ts"),
  route("compare-bundle.json", "routes/compare-bundle.ts"),
  // one route for /tracks and every /tracks/<product>: choosing another product keeps the page and fetches nothing (routes/tracks.tsx)
  route("tracks/:product?", "routes/tracks.tsx"),
  route("deposits", "routes/deposits.tsx"),
  route("fees", "routes/fees.tsx"),
  route("fees-data.json", "routes/fees-data.ts"),
  route("transfer", "routes/transfer.tsx"),
  // one route for /indices and every /indices/<x>: choosing another index keeps the page and fetches nothing (routes/invest.tsx)
  route("indices/:slug?", "routes/invest.tsx"),
  route("indices-bundle.json", "routes/indices-bundle.ts"),
  route("kit", "routes/kit.tsx"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
