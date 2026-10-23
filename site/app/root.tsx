import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from "react-router";
import type { ReactNode } from "react";
import "./app.css";
import { InputsProvider } from "./lib/inputs";
import NotFound from "./routes/not-found";
import { system } from "./copy";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="robots" content="noindex" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <InputsProvider>
      <Outlet />
    </InputsProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  return (
    <main className="mx-auto max-w-measure px-gutter py-12">
      <h1 className="text-2xl font-semibold">{system.calcFailed}</h1>
    </main>
  );
}
