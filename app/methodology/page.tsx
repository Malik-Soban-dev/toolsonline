import Link from "next/link";
import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site";
import { pages } from "@/lib/pages";
import { PageSchema } from "@/components/page-schema";
export const metadata = pageMetadata(pages.methodology);
export default function MethodologyPage() {
  return (
    <>
      <PageSchema page={pages.methodology} />
      <InfoPage
        eyebrow="THE FIELD GUIDE"
        title="How the tools work."
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
        <h2 id="cleaning">01 · Cleaning your keyword list</h2>
        <p>
          The <Link href="/">keyword list cleaner</Link> normalizes Unicode characters using NFKC,
          trims leading and trailing whitespace, and collapses repeated whitespace into a single
          space. You can choose lowercase conversion, case-insensitive duplicate removal, and
          punctuation replacement. Accents are not removed. Punctuation stays unless you opt to
          replace it with spaces.
        </p>
        <p>
          The input accepts one keyword per line, up to 5,000 non-empty lines and 500,000
          characters. Files must be no larger than 2 MiB (2,097,152 bytes) and within those text
          limits; delimited files support up to 100 columns. Commas in a pasted keyword are kept as
          text; CSV files use the import dialog.
        </p>
        <h2 id="csv">02 · CSV import and export</h2>
        <p>
          Comma-, tab-, and semicolon-delimited files are supported, including quoted fields,
          escaped double quotes, and quoted line breaks. Choose the keyword column and whether the
          first row is a header. We ignore every other column, including any metrics you supplied,
          rather than guessing their provenance.
        </p>
        <p>
          Exports contain keywords, rule-based intent, lexical topic, and word count. Formula-like
          cells are prefixed with an apostrophe to reduce spreadsheet formula injection risk. No
          hidden demand or competition metrics are added.
        </p>
        <h2 id="groups">03 · Lexical topic groups</h2>
        <p>
          We tokenize words and numbers, remove a small English modifier/stop-word list, and
          simplify some English plurals. Recurring adjacent two-word phrases take priority as topic
          anchors. If there’s no recurring pair, a shared single word can be used, provided it isn’t
          present in almost every keyword. Phrases without a useful shared anchor go into “Other
          topics.”
        </p>
        <p>
          This is lexical grouping: shared wording, not shared meaning. It doesn’t use embeddings,
          Google results, or SERP overlap. Related synonyms may be separated; unrelated phrases that
          share a word may land together. Group names are normalized anchors, not editorial
          recommendations.
        </p>
        <p>
          The <Link href="/keyword-clusters/">keyword clustering tool</Link> runs the same grouping
          as a dedicated workflow, adds the shared wording behind each group, and sets aside phrases
          with no shared wording for review.
        </p>
        <h2 id="intent">04 · Rule-based intent</h2>
        <p>Intent is estimated from English modifiers, in this priority order:</p>
        <ul>
          <li>
            <strong>Transactional:</strong> words such as buy, purchase, shop, order, coupon,
            discount, sale, pricing, price, or cost.
          </li>
          <li>
            <strong>Commercial:</strong> best, top, review, reviews, vs, versus, compare,
            comparison, or alternatives.
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
        <h2 id="ideas">05 · Keyword ideas</h2>
        <p>
          The <Link href="/keyword-ideas/">keyword idea generator</Link> applies 24 fixed English
          templates across questions, comparisons, and longer phrases. For example, a topic might
          become “how to choose [topic]” or “[topic] for beginners.” These are writing prompts, not
          autocomplete suggestions, real queries, or evidence of demand. Expect to edit awkward
          wording and validate useful ideas through your own research.
        </p>
        <h2 id="text-analysis">06 · Text analysis</h2>
        <p>
          The <Link href="/text-analyzer/">word frequency counter</Link> uses Unicode letter/number
          tokens for word counts. Character counts count Unicode code points, not displayed grapheme
          clusters, so some emoji count as more than one. Common English words are excluded from the
          top-15 frequency lists. Two-word phrases must be adjacent in the token stream; no phrases
          are manufactured by removing a stop word between them. Punctuation is ignored, so phrase
          counts can cross sentence boundaries.
        </p>
        <p>
          Focus phrases use case-insensitive whole-token matching. Occurrence frequency is matches
          divided by total words; phrase token coverage also multiplies by the number of words in
          your phrase. Overlapping matches can count tokens more than once. These are descriptive
          calculations, not targets. There is no “ideal” density. Reading time assumes 225 words per
          minute, rounded up.
        </p>
        <h2 id="snippets">07 · Snippets, titles, and descriptions</h2>
        <p>
          The <Link href="/serp-preview/">SERP preview</Link> is a search-style layout, not a live
          search result. Titles and descriptions may be clamped to a few lines. Approximate title
          width uses a simple character-width model, not the real search engine font renderer. The
          ~60-character title and ~160-character description ranges are editorial guidelines; they
          do not guarantee visibility or improve ranking by themselves.
        </p>
        <p>
          The <Link href="/meta-helper/">title and meta description helper</Link> uses fixed
          sentence templates. It doesn’t read your page or verify your claims. Search engines can
          rewrite both titles and snippets. Review every draft for accuracy before publishing.
          Exported HTML escapes user-provided characters.
        </p>
        <h2 id="clustering">08 · Keyword clustering</h2>
        <p>
          Clustering starts from the cleaned list, then anchors groups on recurring wording.
          Adjacent two-word phrases are considered before single words, because “coffee grinder”
          separates more than “coffee.” A word that appears in almost every phrase is skipped: it
          cannot divide a list. Each phrase joins the most specific group it matches, so it appears
          exactly once, and phrases with no qualifying shared wording go to a review list instead of
          a group.
        </p>
        <p>
          You can require a shared two-word phrase rather than any shared word, and raise the
          smallest group size from two to four phrases. Both controls change which groups qualify;
          neither adds information that isn’t already in your list. Group names are normalized
          anchors taken from your wording, and the shared-wording line shows the evidence behind
          each group.
        </p>
        <p>
          This is still lexical grouping. It does not read search results, measure SERP overlap, use
          embeddings, or estimate demand, difficulty, or cost. Two phrases about the same topic can
          sit in different groups because they use different words, and two unrelated phrases can
          share a group because they use the same words.
        </p>
        <h2 id="references">Primary guidance, not fixed SEO rules</h2>
        <p>
          Our counters are editorial aids. Google’s documentation explains how it chooses{" "}
          <a href="https://developers.google.com/search/docs/appearance/title-link">title links</a>{" "}
          from several page signals and how{" "}
          <a href="https://developers.google.com/search/docs/appearance/snippet">search snippets</a>{" "}
          can use page content or a meta description. Neither has a universal character limit. The
          tools here do not predict how a particular search result will appear.
        </p>
        <h2>Your next step is still yours</h2>
        <p>
          Use these tools to make a messy task simpler. Then review the output, check it against
          real audience needs, and apply your own judgment. If something behaves differently from
          this guide, <Link href="/contact/">please report it</Link>.
        </p>
      </InfoPage>
    </>
  );
}
