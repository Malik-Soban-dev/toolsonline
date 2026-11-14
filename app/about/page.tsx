import Link from "next/link";
import { Leaf, LockKeyhole, Waypoints } from "lucide-react";
import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "About",
  "Meet Online Tools: a small, independent, local-first SEO workbench built to reduce busywork, not invent search data.",
  "/about/",
);
export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="A SMALL TOOLKIT WITH A CLEAR PURPOSE"
      title="Less dashboard."
      accent="More doing."
      description="Online Tools is a quieter corner of the SEO workflow. A place to organize what you have, explore what might come next, and get back to making something useful."
    >
      <p className="prose-lead">
        Not every useful SEO task needs a subscription, an API key, or another complicated
        dashboard.
      </p>
      <p>
        Some of the most practical work starts with a list: removing the duplicates, seeing which
        phrases belong together, checking the words on a page, or writing a clearer introduction for
        a search result. That’s the part we’re here for.
      </p>
      <div className="about-values">
        <div>
          <Leaf size={21} />
          <h2>Small on purpose</h2>
          <p>Five focused tools. No sign-up wall or pretend premium tier.</p>
        </div>
        <div>
          <LockKeyhole size={21} />
          <h2>Local by default</h2>
          <p>Your keywords and drafts are processed in your browser.</p>
        </div>
        <div>
          <Waypoints size={21} />
          <h2>Honest about limits</h2>
          <p>Rules and patterns can be useful without pretending to be market data.</p>
        </div>
      </div>
      <h2>What you can do here</h2>
      <p>
        Clean and organize a keyword list, import a CSV, explore lexical topic groups, generate
        template-based angles, inspect text frequency, and draft search snippets. Export the useful
        bits and keep working wherever you like.
      </p>
      <h2>What you won’t find here</h2>
      <p>
        Search volume, cost-per-click, keyword difficulty, live rankings, or scraped search results.
        We don’t have a visitor-facing keyword data provider, and we won’t fill that gap with
        invented numbers. Heuristic labels are starting points for a human to review.
      </p>
      <h2>An independent project</h2>
      <p>
        Online Tools is maintained through{" "}
        <a href="https://github.com/Malik-Soban-dev/toolsonline" target="_blank" rel="noreferrer">
          Malik-Soban-dev/toolsonline on GitHub
        </a>
        . It is not affiliated with Google or any keyword-data provider. The visual identity,
        interface, and writing here are our own.
      </p>
      <p>
        Want to understand what goes into a label? Read the{" "}
        <Link href="/methodology/">field guide</Link>. Found a rough edge?{" "}
        <Link href="/contact/">Tell us about it</Link>.
      </p>
    </InfoPage>
  );
}
