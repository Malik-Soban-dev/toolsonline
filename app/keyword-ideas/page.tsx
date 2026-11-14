import { KeywordIdeas } from "@/components/keyword-ideas";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Keyword ideas",
  "Explore template-based keyword questions, comparisons, and long-tail phrases. No fabricated volumes or autocomplete claims. Works locally without an API.",
  "/keyword-ideas/",
);
export default function KeywordIdeasPage() {
  return <KeywordIdeas />;
}
