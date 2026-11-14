import type { MetadataRoute } from "next";
import { publicOrigin } from "@/lib/site";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return {
    // Crawlers must be able to read each page's noindex. robots.txt is not an indexing control.
    // Preview protection, page metadata, and preview-host HTTP headers enforce the launch gate.
    rules: { userAgent: "*", allow: "/" },
    ...(publicOrigin ? { sitemap: `${publicOrigin}/sitemap.xml`, host: publicOrigin } : {}),
  };
}
