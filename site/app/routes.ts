import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("guide", "routes/guide-index.tsx"),
  route("guide/:id", "routes/guide.tsx"),
  route("exposure/:id", "routes/exposure.tsx"),
  route("companies", "routes/companies.tsx"),
  route("companies/:id", "routes/company.tsx"),
  route("companies/:id/:fund", "routes/track.tsx"),
  route("rules", "routes/rules.tsx"),
  route("parameters", "routes/parameters.tsx"),
  route("not-covered", "routes/not-covered.tsx"),
  route("search-index.json", "routes/search-index.ts"),
  route("idle-cash", "routes/idle-cash.tsx"),
  route("goal", "routes/goal.tsx"),
  route("goal/compare", "routes/goal-compare.tsx"),
  route("compare-bundle.json", "routes/compare-bundle.ts"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
