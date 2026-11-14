import Link from "next/link";
import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site";
export const metadata = pageMetadata(
  "Privacy",
  "How Online Tools handles keywords, imported files, local storage, clipboard actions, and hosting requests. No accounts, tracking scripts, or keyword API calls.",
  "/privacy/",
);
export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="YOUR WORK SHOULD STAY YOURS"
      title="Private by default."
      accent="Simple by design."
      description="This policy describes the MVP you’re using today. Last updated 14 November 2026."
    >
      <p className="prose-lead">We don’t need your keyword list to help you organize it.</p>
      <h2>What happens to your input</h2>
      <p>
        Keyword cleaning, CSV parsing, clustering, idea templates, text analysis, snippet previews,
        and meta drafts run in your browser. This app does not send your keywords, imported file
        contents, text drafts, or preview URLs to a server. Entering a page URL does not fetch that
        page.
      </p>
      <h2>Session state and optional browser storage</h2>
      <p>
        By default, your studio input and collection live in the current tab’s memory. They can
        survive navigation inside the app, but are not promised to survive a reload, closed tab, or
        browser failure.
      </p>
      <p>
        If you choose “Remember my workspace,” we use localStorage on this browser to keep your
        keyword studio input, cleaning preferences, example-list flag, and saved keyword collection
        under <code>online-tools.workspace.v1</code>. This is not cloud storage or encryption. Other
        people using the same browser profile, and browser extensions with relevant permissions, may
        be able to access it.
      </p>
      <p>
        Text-analyzer drafts, snippet fields, and title/meta drafts are not saved by the remember
        option. Export anything important. Turning off local saving removes the stored snapshot but
        leaves your current session usable. “Clear data” clears the studio and collection, removes
        the stored snapshot, and disables local saving. You can also remove site data through your
        browser’s settings. Close or reload the tab to discard unsaved drafts in the companion
        tools.
      </p>
      <h2>Downloads and clipboard</h2>
      <p>
        Exports are created on your device. We do not upload them. Clipboard writes occur only when
        you press a copy button; the app never reads your clipboard automatically.
      </p>
      <h2>Hosting and ordinary web requests</h2>
      <p>
        Your browser still requests the app’s pages, scripts, styles, and self-hosted fonts. Hosting
        providers may process IP addresses, request paths, browser information, and diagnostic logs
        to serve and secure the site. Those requests are separate from tool input. The Arena preview
        is served by Arena’s preview infrastructure; a Vercel deployment, if configured later, uses
        Vercel’s infrastructure and may include its preview feedback interface.
      </p>
      <p>
        This MVP adds no analytics, advertising pixels, external font service, third-party keyword
        requests, or account database. We do not set application cookies. Hosting or preview
        infrastructure may set its own cookies under its policies.
      </p>
      <h2>External links and contact</h2>
      <p>
        GitHub links leave this site. Preparing a contact draft sends nothing. Opening the GitHub
        link includes your subject and details in a request URL sent to GitHub, even before you
        submit the issue. The issue is only published when you choose to submit it there. GitHub’s
        privacy policy applies on GitHub. Never include private keyword lists, passwords, or access
        tokens in a public issue.
      </p>
      <h2>No accounts, sale, or profiling</h2>
      <p>
        There is no login, payment flow, visitor profile, or sale of your tool input in this MVP. A
        future feature that changes data handling will require an updated policy before launch.
      </p>
      <h2>Questions or corrections</h2>
      <p>
        Use the channels on our <Link href="/contact/">contact page</Link> for privacy questions.
        Please don’t post sensitive personal information publicly. This policy describes our app
        behavior, not a guarantee about your device, browser extensions, or hosting provider.
      </p>
    </InfoPage>
  );
}
