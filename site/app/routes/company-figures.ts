// The sourced values behind the companies page's figures (lib/company-focus.server.ts), pre-rendered once and fetched by the browser when
// the page opens: each with what it was computed from, too heavy to ship inside the page.
export async function loader() {
  const { buildCompanyFocus } = await import("../lib/company-focus.server");
  return Response.json(buildCompanyFocus().figures);
}
