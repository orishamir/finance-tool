// The data bundle every comparison runs on (lib/compare.server.ts), pre-rendered once like the search index
// and fetched by the browser the first time a result opens.
export async function loader() {
  const { compareBundle } = await import("../lib/compare.server");
  return Response.json(compareBundle());
}
