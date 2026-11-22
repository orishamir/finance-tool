// The data the indices page runs on (lib/providers.server.ts), pre-rendered once like the search index and fetched
// by the browser when the page opens.
export async function loader() {
  const { indicesBundle } = await import("../lib/providers.server");
  return Response.json(indicesBundle());
}
