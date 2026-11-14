export type PageDefinition = {
  path: string;
  title: string;
  description: string;
  schemaType?: "WebApplication" | "AboutPage" | "ContactPage" | "WebPage";
  features?: readonly string[];
  private?: boolean;
};

// A single catalogue keeps route metadata, structured data, and the launch sitemap aligned.
export const pages = {
  studio: {
    path: "/",
    title: "Keyword List Cleaner & Organizer",
    description:
      "Clean keyword lists, remove duplicates, organize shared-word topic groups, and export CSV. Free browser-based tools with no API or invented search metrics.",
    schemaType: "WebApplication",
    features: [
      "Keyword list cleaning and case-insensitive deduplication",
      "Local CSV, TSV, and TXT import",
      "Lexical topic groups and rule-based English intent",
      "Keyword filtering, collection, and CSV export",
    ],
  },
  clusters: {
    path: "/keyword-clusters/",
    title: "Keyword Clustering & Grouping Tool — Shared Wording",
    description:
      "Group a keyword list into clusters by shared words and phrases. See the wording behind every group, review what stays ungrouped, and export CSV. Local lexical grouping, not SERP or AI data.",
    schemaType: "WebApplication",
    features: [
      "Clusters built from shared words and two-word phrases",
      "Adjustable minimum group size and shared-wording rule",
      "Shared-wording evidence, intent mix, and per-group review",
      "Copy, save, CSV export, and transfer to the keyword studio",
    ],
  },
  ideas: {
    path: "/keyword-ideas/",
    title: "Keyword Idea Generator — Template Prompts",
    description:
      "Turn a topic into 24 template-based keyword questions, comparisons, and long-tail prompts. Save, export, or organize ideas locally. No autocomplete or demand data.",
    schemaType: "WebApplication",
    features: [
      "24 fixed English keyword templates",
      "Question, comparison, and long-tail prompts",
      "Selection, saving, CSV export, and transfer to the keyword studio",
    ],
  },
  analyzer: {
    path: "/text-analyzer/",
    title: "Word Frequency Counter & Text Analyzer",
    description:
      "Count words, repeated terms, and two-word phrases in pasted text. Check exact focus-phrase frequency and export counts. Local text analysis, not an SEO score.",
    schemaType: "WebApplication",
    features: [
      "Word and character counts",
      "Top-15 word and adjacent two-word phrase frequency lists",
      "Whole-token focus-phrase matching and CSV frequency export",
      "Reading-time estimate at 225 words per minute",
    ],
  },
  snippet: {
    path: "/serp-preview/",
    title: "SERP Preview for Titles & Descriptions",
    description:
      "Preview page titles and meta descriptions in desktop and mobile search-style layouts. Check approximate length and copy HTML. No page fetching or live results.",
    schemaType: "WebApplication",
    features: [
      "Editable desktop and mobile search-style previews",
      "Character counts and approximate title-width guide",
      "URL display validation without page fetching",
      "Escaped title and meta description HTML",
    ],
  },
  meta: {
    path: "/meta-helper/",
    title: "Title & Meta Description Helper",
    description:
      "Draft page titles and meta descriptions from transparent sentence templates. Edit your copy, check length, and copy or download HTML tags. No API or AI required.",
    schemaType: "WebApplication",
    features: [
      "Four title patterns and three meta description patterns",
      "Optional brand and benefit inputs",
      "Manual editing and character-count guides",
      "Escaped HTML copy and download",
    ],
  },
  saved: {
    path: "/saved/",
    title: "My Keyword Collection",
    description:
      "Keep useful keywords in your browser-only collection. Filter, remove, and export saved ideas. Session-only by default, with optional local saving.",
    private: true,
  },
  about: {
    path: "/about/",
    title: "About This Local-First SEO Workspace",
    description:
      "Meet Online Tools: five free browser-based utilities for keyword lists and page copy. An independent project with no sign-up, keyword API, or fabricated metrics.",
    schemaType: "AboutPage",
  },
  methodology: {
    path: "/methodology/",
    title: "How the SEO Tools Work",
    description:
      "Understand keyword cleaning, lexical groups, English intent rules, fixed-template ideas, word frequency, and approximate snippets. Methods, examples, and limits.",
    schemaType: "WebPage",
  },
  privacy: {
    path: "/privacy/",
    title: "Privacy Policy",
    description:
      "How Online Tools handles keywords, imported files, optional local storage, clipboard actions, and hosting requests. No accounts, analytics, or keyword API calls.",
    schemaType: "WebPage",
  },
  terms: {
    path: "/terms/",
    title: "Terms of Use",
    description:
      "Terms for using Online Tools: free browser-based utilities, heuristic limits, responsible use, storage risks, and no promises about rankings or search visibility.",
    schemaType: "WebPage",
  },
  contact: {
    path: "/contact/",
    title: "Contact & Feedback",
    description:
      "Report a bug, suggest a feature, or ask about Online Tools through GitHub. Prepare an issue draft locally and review it before opening the public tracker.",
    schemaType: "ContactPage",
  },
} satisfies Record<string, PageDefinition>;

export const publicPages: PageDefinition[] = Object.values(pages).filter(
  (page: PageDefinition) => !page.private,
);
export type ToolId = "studio" | "clusters" | "ideas" | "analyzer" | "snippet" | "meta";
