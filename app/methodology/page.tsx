import Link from "next/link";
import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "How it works",
  "A transparent guide to keyword cleaning, lexical topic grouping, English intent rules, template ideas, text frequency, and approximate search snippets.",
  "/methodology/",
);
export default function MethodologyPage() {
  return (
    <InfoPage
      eyebrow="THE FIELD GUIDE"
      title="Useful patterns."
      accent="No black boxes."
      description="Every label here has a simple explanation. Knowing the limits makes the tools more useful—not less."
    >
      <div className="prose-callout">
        <strong>First, the important bit.</strong>
        <p>
          Nothing here measures search demand or competition. There is no keyword API, live SERP
          analysis, or external AI behind these results.
        </p>
      </div>
      <h2>01 · Cleaning your keyword list</h2>
      <p>
        We normalize Unicode characters using NFKC, trim leading and trailing whitespace, and
        collapse repeated whitespace into a single space. You can choose lowercase conversion,
        case-insensitive duplicate removal, and punctuation replacement. Accents are not removed.
        Punctuation stays unless you opt to replace it with spaces.
      </p>
      <p>
        The input accepts one keyword per line, up to 5,000 non-empty lines and 500,000 characters.
        Files must be under 2 MB and within those text limits. Commas in a pasted keyword are kept
        as text; CSV files use the import dialog.
      </p>
      <h2>02 · CSV import and export</h2>
      <p>
        Comma-, tab-, and semicolon-delimited files are supported, including quoted fields, escaped
        double quotes, and quoted line breaks. Choose the keyword column and whether the first row
        is a header. We ignore every other column, including any metrics you supplied, rather than
        guessing their provenance.
      </p>
      <p>
        Exports contain keywords, rule-based intent, lexical topic, and word count. Formula-like
        cells are prefixed with an apostrophe to reduce spreadsheet formula injection risk. No
        hidden demand or competition metrics are added.
      </p>
      <h2>03 · Lexical topic groups</h2>
      <p>
        We tokenize words and numbers, remove a small English modifier/stop-word list, and simplify
        some English plurals. Recurring adjacent two-word phrases take priority as topic anchors. If
        there’s no recurring pair, a shared single word can be used, provided it isn’t present in
        almost every keyword. Phrases without a useful shared anchor go into “Other topics.”
      </p>
      <p>
        This is lexical grouping: shared wording, not shared meaning. It doesn’t use embeddings,
        Google results, or SERP overlap. Related synonyms may be separated; unrelated phrases that
        share a word may land together. Group names are normalized anchors, not editorial
        recommendations.
      </p>
      <h2>04 · Rule-based intent</h2>
      <p>Intent is estimated from English modifiers, in this priority order:</p>
      <ul>
        <li>
          <strong>Transactional:</strong> words such as buy, purchase, shop, order, coupon,
          discount, sale, pricing, price, or cost.
        </li>
        <li>
          <strong>Commercial:</strong> best, top, review, reviews, vs, versus, compare, comparison,
          or alternatives.
        </li>
        <li>
          <strong>Informational:</strong> how, what, why, when, where, who, guide, tutorial, tips,
          recipe, or benefits.
        </li>
        <li>
          <strong>Unclassified:</strong> none of those signals were found.
        </li>
      </ul>
      <p>
        A phrase can serve several intents; these simple labels cannot resolve that ambiguity.
        “Unclassified” is more honest than a guess. Navigational intent is not inferred because we
        don’t maintain a brand database.
      </p>
      <h2>05 · Keyword ideas</h2>
      <p>
        The ideas tool applies 24 fixed English templates across questions, comparisons, and longer
        phrases. For example, a topic might become “how to choose [topic]” or “[topic] for
        beginners.” These are writing prompts, not autocomplete suggestions, real queries, or
        evidence of demand. Expect to edit awkward wording and validate useful ideas through your
        own research.
      </p>
      <h2>06 · Text analysis</h2>
      <p>
        Word counts use Unicode letter/number tokens. Character counts count Unicode code points,
        not displayed grapheme clusters, so some emoji count as more than one. Common English words
        are excluded from the top-15 frequency lists. Two-word phrases must be adjacent in the token
        stream; no phrases are manufactured by removing a stop word between them. Punctuation is
        ignored, so phrase counts can cross sentence boundaries.
      </p>
      <p>
        Focus phrases use case-insensitive whole-token matching. Occurrence frequency is matches
        divided by total words; phrase token coverage also multiplies by the number of words in your
        phrase. Overlapping matches can count tokens more than once. These are descriptive
        calculations, not targets. There is no “ideal” density. Reading time assumes 225 words per
        minute, rounded up.
      </p>
      <h2>07 · Snippets, titles, and descriptions</h2>
      <p>
        The preview is a search-style layout, not a live search result. Titles and descriptions may
        be clamped to a few lines. Approximate title width uses a simple character-width model, not
        the real search engine font renderer. The ~60-character title and ~160-character description
        ranges are editorial guidelines; they do not guarantee visibility or improve ranking by
        themselves.
      </p>
      <p>
        The title/meta helper uses fixed sentence templates. It doesn’t read your page or verify
        your claims. Search engines can rewrite both titles and snippets. Review every draft for
        accuracy before publishing. Exported HTML escapes user-provided characters.
      </p>
      <h2>Your next step is still yours</h2>
      <p>
        Use these tools to make a messy task simpler. Then review the output, check it against real
        audience needs, and apply your own judgment. If something behaves differently from this
        guide, <Link href="/contact/">please report it</Link>.
      </p>
    </InfoPage>
  );
}
