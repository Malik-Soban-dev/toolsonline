import { MetaHelper } from "@/components/meta-helper";
import { PageSchema } from "@/components/page-schema";
import { ToolGuide } from "@/components/tool-guide";
import { pages } from "@/lib/pages";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(pages.meta);

export default function MetaHelperPage() {
  return (
    <>
      <PageSchema page={pages.meta} />
      <MetaHelper />
      <ToolGuide tool="meta" />
    </>
  );
}
