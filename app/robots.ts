import type { MetadataRoute } from "next";
import { indexable, siteOrigin } from "@/lib/site";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(indexable ? { allow: "/", disallow: "/saved/" } : { disallow: "/" }),
    },
    ...(indexable && siteOrigin ? { sitemap: `${siteOrigin}/sitemap.xml`, host: siteOrigin } : {}),
  };
}
