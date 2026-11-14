import { Collection } from "@/components/collection";
import { pages } from "@/lib/pages";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata(pages.saved);

export default function CollectionPage() {
  return (
    <>
      <Collection />
    </>
  );
}
