import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./globals.css";
import { WorkspaceProvider } from "@/components/workspace-provider";
import { Shell } from "@/components/shell";
import { indexable, siteOrigin, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  ...(siteOrigin ? { metadataBase: new URL(siteOrigin) } : {}),
  title: { default: "Online Tools — A calmer SEO workspace", template: "%s · Online Tools" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: { index: indexable, follow: indexable },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  openGraph: { siteName: SITE_NAME, locale: "en_US", type: "website" },
  twitter: { card: "summary_large_image" },
  category: "productivity",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f8faf7" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with JavaScript enabled",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Keyword list cleaning",
      "Lexical keyword clustering",
      "Rule-based keyword suggestions",
      "CSV import and export",
      "Text frequency analysis",
      "Search snippet preview",
      "Title and meta description helper",
    ],
    ...(siteOrigin ? { url: siteOrigin } : {}),
  };
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
        <WorkspaceProvider>
          <Shell>{children}</Shell>
        </WorkspaceProvider>
        <noscript>
          <div className="noscript-note">
            The interactive tools need JavaScript, but never send your keywords to a server. Enable
            JavaScript to use your local workspace.
          </div>
        </noscript>
      </body>
    </html>
  );
}
