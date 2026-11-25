import type { EntryContext, RouterContextProvider } from "react-router";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";

export const streamTimeout = 5_000;

// React Router's own web entry, with one change: a Suspense part already finished when the page is written stays in its place
// (`progressiveChunkSize`). React otherwise writes a finished part met past about 12.5 KB of page at the end of the HTML, put back in
// place by an inline script, so it shows a moment after the rest; a house's terms on a company page are such a part
// (components/decoder/institutions/brokerage-card.tsx, `LoadedTerms`). The site is pre-rendered whole at build, so nothing is gained by
// sending the page in pieces.
export default async function handleRequest(request: Request, responseStatusCode: number, responseHeaders: Headers, routerContext: EntryContext, _loadContext: RouterContextProvider) {
  // https://httpwg.org/specs/rfc9110.html#HEAD
  if (request.method.toUpperCase() === "HEAD") return new Response(null, { status: responseStatusCode, headers: responseHeaders });

  let shellRendered = false;
  const userAgent = request.headers.get("user-agent");
  const body = await renderToReadableStream(<ServerRouter context={routerContext} url={request.url} />, {
    signal: AbortSignal.timeout(streamTimeout + 1000),
    progressiveChunkSize: Number.POSITIVE_INFINITY,
    onError(error: unknown) {
      responseStatusCode = 500;
      // an error inside the shell rejects and is logged by React Router; only those after it are logged here
      if (shellRendered) console.error(error);
    },
  });
  shellRendered = true;

  // bots and the SPA fallback get the page once every part is in
  if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) await body.allReady;

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, { headers: responseHeaders, status: responseStatusCode });
}
