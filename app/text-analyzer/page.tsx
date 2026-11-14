import { TextAnalyzer } from "@/components/text-analyzer";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Text analyzer",
  "Count words, inspect recurring terms and phrases, and check exact focus-phrase frequency. Free private text analysis in your browser, without an SEO score.",
  "/text-analyzer/",
);
export default function TextAnalyzerPage() {
  return <TextAnalyzer />;
}
