import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { PageHeading } from "./ui";
import type { ReactNode } from "react";

export function InfoPage({
  eyebrow,
  title,
  accent,
  description,
  children,
  nav = true,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  children: ReactNode;
  nav?: boolean;
}) {
  return (
    <>
      <PageHeading eyebrow={eyebrow} title={title} accent={accent} description={description} />
      <div className="info-layout">
        <article className="panel prose">{children}</article>
        {nav && (
          <aside className="info-aside">
            <span className="eyebrow">A FEW USEFUL PAGES</span>
            <nav aria-label="About this workspace">
              <Link href="/about/">
                The idea behind the tools
                <ArrowUpRight size={14} />
              </Link>
              <Link href="/methodology/">
                How the tools work
                <ArrowUpRight size={14} />
              </Link>
              <Link href="/privacy/">
                Your data, explained
                <ArrowUpRight size={14} />
              </Link>
              <Link href="/terms/">
                Terms of use
                <ArrowUpRight size={14} />
              </Link>
              <Link href="/contact/">
                Get in touch
                <ArrowUpRight size={14} />
              </Link>
            </nav>
            <div className="aside-note">
              <span className="status-dot" />
              <p>
                Small, useful, and honest.
                <br />
                That’s the whole idea.
              </p>
            </div>
            <Link className="button button-secondary" href="/">
              Back to the studio
              <ArrowRight size={14} />
            </Link>
          </aside>
        )}
      </div>
    </>
  );
}
