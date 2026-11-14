import { KeywordIdeas } from "@/components/keyword-ideas";
import { PageSchema } from "@/components/page-schema";
import { ToolGuide } from "@/components/tool-guide";
import { pages } from "@/lib/pages";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(pages.ideas);

export default function KeywordIdeasPage() {
  return (
    <>
      <PageSchema page={pages.ideas} />
      <KeywordIdeas />
      <ToolGuide tool="ideas" />
    </>
  );
}
