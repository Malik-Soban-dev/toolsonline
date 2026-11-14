import type { PageDefinition } from "@/lib/pages";
import { jsonLd, pageSchema, publicOrigin, SITE_NAME } from "@/lib/site";

// Server-only, static route facts. Never serialize keywords, drafts, or saved collection data.
export function PageSchema({ page }: { page: PageDefinition }) {
  const schema = pageSchema(page);
  if (!schema) return null;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
      {page.path === "/" && publicOrigin && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${publicOrigin}/#website`,
              name: SITE_NAME,
              url: `${publicOrigin}/`,
              inLanguage: "en",
            }),
          }}
        />
      )}
    </>
  );
}
