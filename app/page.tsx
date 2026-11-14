import { KeywordStudio } from "@/components/keyword-studio";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Keyword studio",
  "Clean keyword lists, remove duplicates, explore lexical topic groups, and export an organized CSV. A free browser-only SEO workbench with honest heuristic labels.",
  "/",
);
export default function HomePage() {
  return <KeywordStudio />;
}
