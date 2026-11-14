import { TextAnalyzer } from "@/components/text-analyzer";
import { PageSchema } from "@/components/page-schema";
import { ToolGuide } from "@/components/tool-guide";
import { pages } from "@/lib/pages";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(pages.analyzer);

export default function TextAnalyzerPage() {
  return (
    <>
      <PageSchema page={pages.analyzer} />
      <TextAnalyzer />
      <ToolGuide tool="analyzer" />
    </>
  );
}
