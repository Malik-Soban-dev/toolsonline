import { KeywordStudio } from "@/components/keyword-studio";
import { PageSchema } from "@/components/page-schema";
import { ToolGuide } from "@/components/tool-guide";
import { pages } from "@/lib/pages";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(pages.studio);

export default function KeywordStudioPage() {
  return (
    <>
      <PageSchema page={pages.studio} />
      <KeywordStudio />
      <ToolGuide tool="studio" />
    </>
  );
}
