import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { pages, type ToolId } from "@/lib/pages";

type Guide = {
  title: string;
  intro: string;
  steps: { title: string; text: string }[];
  example: string;
  limitTitle: string;
  limit: string;
  methodology: string;
  related: { tool: ToolId; label: string }[];
};

const guides: Record<ToolId, Guide> = {
  studio: {
    title: "From messy list to working brief",
    intro:
      "Use this keyword list cleaner when you already have phrases to organize. It tidies and groups the text you supply; it does not research how often people search.",
    steps: [
      {
        title: "Paste a list or import a file",
        text: "Start with one keyword per line, or import CSV, TSV, or TXT. For a delimited file, choose the keyword column and confirm the header row. Other columns, including supplied metrics, are ignored.",
      },
      {
        title: "Choose your cleaning rules",
        text: "Unicode and repeated whitespace are normalized automatically. Duplicate checks ignore case. Lowercase conversion is on by default; switch it off to keep capitalization. Punctuation stays unless you opt to replace it.",
      },
      {
        title: "Review, shortlist, and export",
        text: "Explore the shared-word topic groups and English intent labels, then select useful rows for your collection or export CSV. Treat the labels as review aids, not a finished content strategy.",
      },
    ],
    example:
      "With the default settings, “  Best   Coffee Beans  ” and “best coffee beans” become one row: “best coffee beans.” Turn off duplicate removal if you need to keep repeated rows.",
    limitTitle: "Shared wording is not shared intent",
    limit:
      "Lexical groups can separate synonyms or combine unrelated phrases. No volume, CPC, keyword difficulty, or live rankings are added. Work with up to 5,000 non-empty keyword lines, 500,000 characters, and files up to 2 MiB.",
    methodology: "cleaning",
    related: [
      { tool: "ideas", label: "Explore template keyword ideas" },
      { tool: "analyzer", label: "Check word and phrase frequency" },
    ],
  },
  ideas: {
    title: "Turn a topic into prompts worth editing",
    intro:
      "This keyword idea generator combines your topic with 24 fixed English templates. Use the results to explore possible angles, not as a list of verified search queries.",
    steps: [
      {
        title: "Start with a focused topic",
        text: "A noun phrase such as “indoor plants” fits the templates better than a complete question. Keep the seed to 100 characters or fewer, or try one of the examples.",
      },
      {
        title: "Explore three kinds of angle",
        text: "Questions, comparisons, and long-tail prompts each contain eight patterns. Filter the list to one category and read the suggestions for relevance and natural wording.",
      },
      {
        title: "Keep only what fits",
        text: "Select useful prompts to save or export, or add them to the keyword studio to edit and organize. The studio applies your current cleaning preferences when ideas are added.",
      },
    ],
    example:
      "The seed “indoor plants” produces prompts such as “how to choose indoor plants” and “indoor plants for beginners.” A pattern like “indoor plants maintenance guide” needs editing before it becomes a useful brief.",
    limitTitle: "Prompts, not autocomplete",
    limit:
      "These are not Google autocomplete, People Also Ask, or live search results. The tool cannot tell you whether a phrase has demand or competition. Validate promising angles against your audience and independent research.",
    methodology: "ideas",
    related: [
      { tool: "studio", label: "Clean and organize your keyword list" },
      { tool: "meta", label: "Draft a title and meta description" },
    ],
  },
  analyzer: {
    title: "Use repetition as an editing clue",
    intro:
      "Paste article text to count words and inspect the top 15 recurring terms or adjacent two-word phrases. This text analyzer reads what you paste, not a webpage or document URL.",
    steps: [
      {
        title: "Bring the text you want to review",
        text: "Paste up to 100,000 characters of plain text. Counts update as you edit. Unicode letters and numbers form word tokens; the character count uses code points rather than visible symbols.",
      },
      {
        title: "Compare words with phrases",
        text: "Switch the frequency table between single words and two-word phrases. Common English words are hidden from these lists, but still count toward the total. Export the displayed frequency list as CSV.",
      },
      {
        title: "Inspect a focus phrase",
        text: "Enter a phrase to see case-insensitive whole-token matches. Occurrence frequency divides matches by total words; token coverage also multiplies by the number of words in the phrase.",
      },
    ],
    example:
      "In “coffee beans coffee beans,” the focus phrase “coffee beans” matches twice across four words: 50% occurrence frequency and 100% token coverage. These are descriptive counts, not writing targets.",
    limitTitle: "There is no ideal density here",
    limit:
      "A count cannot judge quality or relevance. Punctuation is ignored, so phrase matches can cross sentence boundaries; overlapping matches can count a token more than once. Stop-word filtering is English-only, not language-aware analysis.",
    methodology: "text-analysis",
    related: [
      { tool: "meta", label: "Draft a title for your page copy" },
      { tool: "snippet", label: "Preview a search-style introduction" },
    ],
  },
  snippet: {
    title: "An introduction to your page, before you publish",
    intro:
      "SERP means search engine results page. This preview lets you compare a title and meta description in desktop and mobile search-style layouts, without fetching or publishing a page.",
    steps: [
      {
        title: "Enter the page details",
        text: "Add a URL, site name, title, and description. The URL only supplies the displayed host and path; entering it does not request that page or check its existing metadata.",
      },
      {
        title: "Compare both layouts",
        text: "Switch between desktop and mobile. Check whether the main idea remains clear in the shorter display. Character counts and approximate title width are drafting aids, not exact search-engine cutoffs.",
      },
      {
        title: "Take the tags into your site",
        text: "Open “Take the HTML with you” to copy an escaped title tag and meta description tag. Add them through your own site or CMS, then check the published HTML. This tool does not publish changes.",
      },
    ],
    example:
      "Compare “Coffee Guide” with “How to Store Coffee Beans at Home.” The second names a specific task. Use that promise only if the page really explains how to store beans at home.",
    limitTitle: "A layout, not a live result",
    limit:
      "Search engines can choose different title links and query-specific snippets, including text from the page instead of its meta description. This approximation does not predict an exact cutoff, ranking, or click rate.",
    methodology: "snippets",
    related: [
      { tool: "meta", label: "Create editable title and description drafts" },
      { tool: "analyzer", label: "Review repeated words in your page text" },
    ],
  },
  meta: {
    title: "A small workflow for titles and meta descriptions",
    intro:
      "Provide a topic, an optional brand, and a reader benefit to make editable drafts. Four title patterns and three description patterns offer a starting point—without AI or page crawling.",
    steps: [
      {
        title: "Describe the actual page",
        text: "Choose a specific topic and a benefit the page genuinely provides. Add a brand only when you want it in the title. The helper does not read your page or verify any claim.",
      },
      {
        title: "Choose a pattern, then rewrite it",
        text: "Generate drafts and choose a title and description as starting points. Edit both on the editing desk so they describe the page accurately. Generic guide language may not fit a product or service page.",
      },
      {
        title: "Review length and export the HTML",
        text: "Use the counters as editorial guides, not pass/fail SEO rules. Copy or download the escaped tags, and use the SERP preview separately to compare desktop and mobile layouts. Drafts do not transfer automatically between these tools.",
      },
    ],
    example:
      "“Indoor Plants: A Practical Guide | Green Corner” is one possible title pattern. If the page is a watering checklist, rewrite it to describe that narrower task rather than promise a complete guide.",
    limitTitle: "Templates cannot replace page knowledge",
    limit:
      "The output is assembled from fixed sentences, not a researched recommendation. Remove claims the page cannot support. Search engines may choose different titles and snippets; neither a character count nor a draft guarantees visibility.",
    methodology: "snippets",
    related: [
      { tool: "snippet", label: "Compare desktop and mobile snippet layouts" },
      { tool: "analyzer", label: "Inspect the words in your page draft" },
    ],
  },
};

// Kept outside client tool components so useful instructions are present in exported HTML.
export function ToolGuide({ tool }: { tool: ToolId }) {
  const guide = guides[tool];
  const id = `${tool}-guide-title`;
  return (
    <section className="tool-guide" aria-labelledby={id}>
      <header className="tool-guide-heading">
        <span className="eyebrow">A FEW PRACTICAL FIELD NOTES</span>
        <h2 id={id}>{guide.title}</h2>
        <p>{guide.intro}</p>
      </header>
      <div className="tool-guide-grid">
        <div>
          <ol className="guide-steps">
            {guide.steps.map((step, index) => (
              <li key={step.title}>
                <span className="guide-step-number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="guide-example">
            <span className="eyebrow">A WORKED EXAMPLE</span>
            <p>{guide.example}</p>
          </div>
        </div>
        <aside className="guide-aside" aria-label="Limits and next steps">
          <h3>{guide.limitTitle}</h3>
          <p>{guide.limit}</p>
          <Link className="guide-method" href={`/methodology/#${guide.methodology}`}>
            Read the method and its limits <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
          <nav aria-label="Related tools">
            <span className="eyebrow">KEEP WORKING</span>
            {guide.related.map(({ tool: related, label }) => (
              <Link key={related} href={pages[related].path}>
                <span>{label}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </section>
  );
}
