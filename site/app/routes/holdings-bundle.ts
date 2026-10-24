// The holdings data (lib/holdings.server.ts): the regulator's tracks per wrapper with their fee averages, the fit
// table, the rule texts the holdings screens quote and the ids the export file carries. Pre-rendered once like the
// comparison bundle and fetched by the browser the first time a holdings screen opens.
export async function loader() {
  const { holdingsBundle } = await import("../lib/holdings.server");
  return Response.json(holdingsBundle());
}
