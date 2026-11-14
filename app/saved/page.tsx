import { Collection } from "@/components/collection";
import { pageMetadata } from "@/lib/site";
export const metadata = {
  ...pageMetadata(
    "My collection",
    "Keep useful keywords together in your private, browser-only collection. Filter, remove, and export your saved ideas.",
    "/saved/",
  ),
  robots: { index: false, follow: false },
};
export default function CollectionPage() {
  return <Collection />;
}
