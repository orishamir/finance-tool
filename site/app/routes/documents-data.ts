// The documents page's cards, pre-rendered as /documents-data.json: the page starts with its kinds of document folded and fetches this file
// when one is opened, or when the address names a document inside one, so its first HTML carries the counts and anchors only.
export async function loader() {
  const { loadDocuments } = await import("../lib/documents.server");
  return Response.json(loadDocuments());
}
