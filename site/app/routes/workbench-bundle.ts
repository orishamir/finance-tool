// The data the provider workbench and the fund-variant page run on (lib/providers.server.ts), pre-rendered once like
// the comparison bundle and fetched by the browser when either page opens.
export async function loader() {
  const { workbenchBundle } = await import("../lib/providers.server");
  return Response.json(workbenchBundle());
}
