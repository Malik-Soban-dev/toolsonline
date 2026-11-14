import Link from "next/link";
import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Terms of use",
  "The essential terms for using Online Tools: free browser-based utilities, transparent heuristic limits, responsible use, and no ranking guarantees.",
  "/terms/",
);
export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="A FEW GROUND RULES"
      title="Useful tools."
      accent="Reasonable expectations."
      description="Essential terms for the current preview. Last updated 14 November 2026."
    >
      <h2>Using Online Tools</h2>
      <p>
        Online Tools provides free browser-based utilities for organizing keywords and preparing
        page copy. By using this site, you agree to use it lawfully and responsibly. No account or
        payment is required for the current MVP.
      </p>
      <h2>What the output means</h2>
      <p>
        Topic groups and intent labels are heuristics. Suggestions and meta drafts are generated
        from fixed templates. Snippet displays and width calculations are approximate. No output
        represents verified demand, CPC, keyword difficulty, live rankings, guaranteed search-engine
        appearance, or professional SEO advice.
      </p>
      <p>
        You are responsible for checking the accuracy, usefulness, and suitability of all output
        before acting on or publishing it. We make no promises about rankings, traffic, revenue, or
        search visibility.
      </p>
      <h2>Your content and responsibility</h2>
      <p>
        You retain your rights to input you provide. Only use content and keyword lists you are
        entitled to process. Do not use the site to violate law or another person’s rights,
        distribute harmful material, or attempt to compromise the service.
      </p>
      <h2>Storage and continuity</h2>
      <p>
        Your session can be lost. Optional local saving is a convenience, not a backup, sync
        service, or security boundary. Export important work. Browser changes, clearing site data,
        software updates, or storage limits can remove saved data.
      </p>
      <h2>Availability and warranties</h2>
      <p>
        The tools are provided “as is” and “as available,” without a promise of uninterrupted
        access, fitness for a particular purpose, or error-free results. Features may change or be
        removed. To the extent permitted by applicable law, the maintainers are not liable for
        indirect losses, lost data, or decisions based on heuristic output. Nothing here excludes
        rights or liabilities that cannot lawfully be excluded.
      </p>
      <h2>External services and independence</h2>
      <p>
        Linked sites are governed by their own terms. Online Tools is independent and is not
        endorsed by Google or any keyword-research vendor. Product names mentioned to explain
        limitations belong to their respective owners.
      </p>
      <h2>Privacy, updates, and contact</h2>
      <p>
        Read the <Link href="/privacy/">privacy policy</Link> for details about local processing and
        storage. Material changes to these terms will be reflected on this page with an updated
        date. Questions can be raised through the <Link href="/contact/">contact page</Link>.
      </p>
      <div className="prose-callout">
        <strong>Before a public production launch</strong>
        <p>
          These are practical MVP terms, not a substitute for legal review. The operator should
          confirm their legal identity, support channel, jurisdiction-specific obligations, and
          final policies before enabling production indexing.
        </p>
      </div>
    </InfoPage>
  );
}
