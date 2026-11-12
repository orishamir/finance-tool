// The fee page's data (lib/fees.server.ts), pre-rendered once like the comparison bundle and fetched by the browser
// when the fee page opens.
export async function loader() {
  const { feesData } = await import("../lib/fees.server");
  return Response.json(feesData());
}
