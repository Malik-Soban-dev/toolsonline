import { SerpPreview } from "@/components/serp-preview";
import { PageSchema } from "@/components/page-schema";
import { ToolGuide } from "@/components/tool-guide";
import { pages } from "@/lib/pages";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(pages.snippet);

export default function SerpPreviewPage() {
  return (
    <>
      <PageSchema page={pages.snippet} />
      <SerpPreview />
      <ToolGuide tool="snippet" />
    </>
  );
}
