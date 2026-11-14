import { SerpPreview } from "@/components/serp-preview";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "SERP snippet preview",
  "Preview page titles and meta descriptions in desktop and mobile search-style layouts. Edit locally, check approximate length, and copy safe HTML tags.",
  "/serp-preview/",
);
export default function SerpPreviewPage() {
  return <SerpPreview />;
}
