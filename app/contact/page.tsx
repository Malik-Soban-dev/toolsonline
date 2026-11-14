import { InfoPage } from "@/components/info-page";
import { ContactForm } from "@/components/contact-form";
import { pageMetadata } from "@/lib/site";
import { pages } from "@/lib/pages";
import { PageSchema } from "@/components/page-schema";
export const metadata = pageMetadata(pages.contact);
export default function ContactPage() {
  return (
    <>
      <PageSchema page={pages.contact} />
      <InfoPage
        eyebrow="LET’S MAKE THE TOOLS A LITTLE BETTER"
        title="Contact Online Tools."
        accent="We’re listening."
        description="Useful feedback starts with a real place to send it. During this preview, GitHub is the project’s contact channel."
      >
        <p>
          For bugs, feature ideas, or general questions, visit the{" "}
          <a
            href="https://github.com/Malik-Soban-dev/toolsonline/issues"
            target="_blank"
            rel="noreferrer"
          >
            Online Tools issue tracker
          </a>
          . A clear description and a small reproducible example are more useful than a screenshot
          alone.
        </p>
        <p>
          For a security or sensitive privacy matter, don’t post details in a public issue. Visit
          the{" "}
          <a href="https://github.com/Malik-Soban-dev" target="_blank" rel="noreferrer">
            maintainer’s GitHub profile
          </a>{" "}
          to look for a private contact route. We have not configured a private support inbox or
          ticketing system for this preview.
        </p>
        <ContactForm />
        <p className="contact-expectations">
          This is an early independent project, not a staffed help desk. We can’t promise a response
          time. There’s no hidden email delivery behind this page.
        </p>
      </InfoPage>
    </>
  );
}
