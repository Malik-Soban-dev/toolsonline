import type { Metadata } from "next";

function configuredOrigin(): string | undefined {
  if (!process.env.SITE_URL) return undefined;
  try {
    const url = new URL(process.env.SITE_URL);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      !url.hostname.includes(".") ||
      url.hostname === "example.com"
    )
      return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

export const siteOrigin = configuredOrigin();
export const indexable = Boolean(
  siteOrigin && process.env.ALLOW_INDEXING === "true" && process.env.VERCEL_ENV !== "preview",
);
export const SITE_NAME = "Online Tools";
export const SITE_DESCRIPTION =
  "A calmer SEO workspace. Clean and organize keywords, explore rule-based ideas, analyze your writing, and refine search snippets. Free, local-first, and no API required.";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: siteOrigin ? { canonical: `${siteOrigin}${path}` } : undefined,
    openGraph: {
      title: `${title} · Online Tools`,
      description,
      type: "website",
      ...(siteOrigin
        ? {
            url: `${siteOrigin}${path}`,
            images: [
              {
                url: `${siteOrigin}/social-card.png`,
                width: 1200,
                height: 630,
                alt: "Online Tools — A little less noise. A lot more direction.",
              },
            ],
          }
        : {}),
    },
    twitter: { card: "summary_large_image", title: `${title} · Online Tools`, description },
  };
}
