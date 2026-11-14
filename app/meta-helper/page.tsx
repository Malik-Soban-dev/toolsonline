import { MetaHelper } from "@/components/meta-helper";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Title & meta helper",
  "Draft and refine page titles and meta descriptions with simple transparent templates. Edit your own copy, check length, and export HTML tags with no API.",
  "/meta-helper/",
);
export default function MetaHelperPage() {
  return <MetaHelper />;
}
