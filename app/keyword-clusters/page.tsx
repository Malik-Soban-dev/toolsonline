import { KeywordClusters } from "@/components/keyword-clusters";
import { PageSchema } from "@/components/page-schema";
import { ToolGuide } from "@/components/tool-guide";
import { pages } from "@/lib/pages";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(pages.clusters);

export default function KeywordClustersPage() {
  return (
    <>
      <PageSchema page={pages.clusters} />
      <KeywordClusters />
      <ToolGuide tool="clusters" />
    </>
  );
}
