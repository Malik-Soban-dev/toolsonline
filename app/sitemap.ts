import type { MetadataRoute } from "next";
import { publicPages } from "@/lib/pages";
import { publicOrigin } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!publicOrigin) return [];
  // No private collection, 404, fabricated modification dates, or invented priorities.
  return publicPages.map((page) => ({ url: `${publicOrigin}${page.path}` }));
}
