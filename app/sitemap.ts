import type { MetadataRoute } from "next";
import { indexable, siteOrigin } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexable || !siteOrigin) return [];
  return [
    "/",
    "/keyword-ideas/",
    "/text-analyzer/",
    "/serp-preview/",
    "/meta-helper/",
    "/about/",
    "/methodology/",
    "/privacy/",
    "/terms/",
    "/contact/",
  ].map((path) => ({ url: `${siteOrigin}${path}` }));
}
