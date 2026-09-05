/// <reference types="vite/client" />
import { Suspense, lazy, useEffect, type ReactNode } from "react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { DEFAULT_LOCALE } from "@wattlyzer/i18n";
import { DATA_STALE_TIME_MS } from "@/lib/queries";
import { localeFromSearch, setLocale, useLocale } from "@/lib/locale";
import { useI18n } from "@/lib/i18n";
import appCss from "@/styles/app.css?url";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=JetBrains+Mono:wght@400;500;600&display=swap";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: "wattlyzer" },
      {
        name: "description",
        content:
          "Smart energy scheduling tool that optimizes when to run your appliances based on solar production and electricity prices.",
      },
      { name: "theme-color", content: "#0f1430" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      },
      { name: "apple-mobile-web-app-title", content: "wattlyzer" },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: FONTS_URL },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
})

// Dev-only: the unified devtools shell does NOT exclude itself from
// production bundles, so gate it behind a statically eliminable branch.
const Devtools = import.meta.env.DEV
  ? lazy(async () => {
      const [devtools, router, query] = await Promise.all([
        import("@tanstack/react-devtools"),
        import("@tanstack/react-router-devtools"),
        import("@tanstack/react-query-devtools"),
      ]);
      const { TanStackDevtools } = devtools;
      const { TanStackRouterDevtoolsPanel } = router;
      const { ReactQueryDevtoolsPanel } = query;
      return {
        default: () => (
          <TanStackDevtools
            plugins={[
              {
                name: "TanStack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
              {
                name: "TanStack Query",
                render: <ReactQueryDevtoolsPanel />,
              },
            ]}
          />
        ),
      };
    })
  : () => null;

const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : null,
  key: "wattlyzer_query_cache",
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // Consume a website link once per document, after hydration. Later changes
  // in Settings must remain free to override the incoming language choice.
  useEffect(() => {
    const linkedLocale = localeFromSearch(window.location.search);
    if (linkedLocale) setLocale(linkedLocale);
  }, []);
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: DATA_STALE_TIME_MS }}
    >
      <DocumentLanguage />
      <Outlet />
      <Suspense fallback={null}>
        <Devtools />
      </Suspense>
    </PersistQueryClientProvider>
  );
}

// The shell renders `lang` and the head metadata for the default locale
// (SSR cannot know the browser's preference). Once the resolved locale is
// known, reflect it on the live document so assistive tech announces the
// right language — mutating the attributes avoids a hydration mismatch on
// <html>, which React never patches.
function DocumentLanguage() {
  const locale = useLocale();
  const { t } = useI18n();
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t("app.title");
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", t("app.description"));
  }, [locale, t]);
  return null;
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang={DEFAULT_LOCALE}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
