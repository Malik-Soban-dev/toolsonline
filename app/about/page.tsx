import Link from "next/link";
import { Leaf, LockKeyhole, Waypoints } from "lucide-react";
import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site";
import { pages } from "@/lib/pages";
import { PageSchema } from "@/components/page-schema";
export const metadata = pageMetadata(pages.about);
export default function AboutPage() {
  return (
    <>
      <PageSchema page={pages.about} />
      <InfoPage
        eyebrow="A SMALL TOOLKIT WITH A CLEAR PURPOSE"
        title="About Online Tools."
        accent="Small on purpose."
        description="Online Tools is a quieter corner of the SEO workflow. A place to organize what you have, explore what might come next, and get back to making something useful."
      >
        <p className="prose-lead">
          Not every useful SEO task needs a subscription, an API key, or another complicated
          dashboard.
        </p>
        <p>
          Some of the most practical work starts with a list: removing the duplicates, seeing which
          phrases belong together, checking the words on a page, or writing a clearer introduction
          for a search result. That’s the part we’re here for.
        </p>
        <div className="about-values">
          <div>
            <Leaf size={21} />
            <h2>Small on purpose</h2>
            <p>Six focused tools. No sign-up wall or pretend premium tier.</p>
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
          Start with the <Link href="/">keyword list cleaner</Link> to deduplicate a CSV or organize
          shared-word topics. Group a long list with the{" "}
          <Link href="/keyword-clusters/">keyword clustering tool</Link>, explore{" "}
          <Link href="/keyword-ideas/">template keyword ideas</Link>, review repeated words with the{" "}
          <Link href="/text-analyzer/">text analyzer</Link>, or write page copy with the{" "}
          <Link href="/meta-helper/">title and meta description helper</Link>. Check your
          introduction in the <Link href="/serp-preview/">SERP snippet preview</Link>, then export
          what you want to keep.
        </p>
        <h2>What you won’t find here</h2>
        <p>
          Search volume, cost-per-click, keyword difficulty, live rankings, or scraped search
          results. We don’t have a visitor-facing keyword data provider, and we won’t fill that gap
          with invented numbers. Heuristic labels are starting points for a human to review.
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
          <Link href="/methodology/">guide to the tools’ methods and limits</Link>. Found a rough
          edge? <Link href="/contact/">Tell us about it</Link>.
        </p>
      </InfoPage>
    </>
  );
}
