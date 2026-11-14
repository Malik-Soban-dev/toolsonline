import type { Metadata } from "next";
import { isIP } from "node:net";
import type { PageDefinition } from "./pages";

const NON_LAUNCH_DOMAINS = [
  "example.com",
  "example.net",
  "example.org",
  "localhost",
  "local",
  "internal",
  "invalid",
  "test",
  "example",
  "e2b.app",
  "vercel.app",
  "netlify.app",
  "pages.dev",
  "github.io",
  "web.app",
  "firebaseapp.com",
  "onrender.com",
  "railway.app",
  "replit.app",
  "ngrok.io",
  "ngrok-free.app",
  "trycloudflare.com",
];

function configuredOrigin(): string | undefined {
  if (!process.env.SITE_URL) return undefined;
  try {
    const url = new URL(process.env.SITE_URL);
    const host = url.hostname;
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      url.pathname !== "/" ||
      url.search ||
      url.hash ||
      isIP(host.replace(/^\[|\]$/g, "")) ||
      host.length > 253 ||
      !host.includes(".") ||
      host.split(".").some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label)) ||
      NON_LAUNCH_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`))
    )
      return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

export const siteOrigin = configuredOrigin();
// A URL alone is not a launch. Opt-in is build-time and non-production Vercel builds fail closed.
export const indexable = Boolean(
  siteOrigin &&
    process.env.ALLOW_INDEXING === "true" &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production"),
);
export const publicOrigin = indexable ? siteOrigin : undefined;
export const SITE_NAME = "Online Tools";
export const SITE_DESCRIPTION =
  "Free, local-first SEO tools for keyword lists and page copy. Clean keywords, explore template prompts, count repeated words, and draft titles and search snippets.";

export function pageMetadata(page: PageDefinition): Metadata {
  const title = `${page.title} · ${SITE_NAME}`;
  const url = publicOrigin && !page.private ? `${publicOrigin}${page.path}` : undefined;
  const images = publicOrigin
    ? [
        {
          url: `${publicOrigin}/social-card.png`,
          width: 1200,
          height: 630,
          alt: "Online Tools — A little less noise. A lot more direction.",
        },
      ]
    : undefined;
  return {
    // Root-page titles do not inherit the root layout's template. Use an explicit full title.
    title: { absolute: title },
    description: page.description,
    ...(page.private ? { robots: { index: false, follow: false } } : {}),
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      title,
      description: page.description,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      ...(url ? { url } : {}),
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.description,
      ...(images ? { images } : {}),
    },
  };
}

export function pageSchema(page: PageDefinition): Record<string, unknown> | undefined {
  if (page.private || !page.schemaType) return undefined;
  const url = publicOrigin ? `${publicOrigin}${page.path}` : undefined;
  return {
    "@context": "https://schema.org",
    "@type": page.schemaType,
    name: page.title,
    description: page.description,
    inLanguage: "en",
    ...(url
      ? { "@id": `${url}#${page.schemaType === "WebApplication" ? "app" : "page"}`, url }
      : {}),
    ...(page.schemaType === "WebApplication"
      ? {
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any",
          browserRequirements: "Requires a modern browser with JavaScript enabled",
          isAccessibleForFree: true,
          featureList: page.features,
        }
      : {}),
  };
}

export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
