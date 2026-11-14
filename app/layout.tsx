import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./globals.css";
import { WorkspaceProvider } from "@/components/workspace-provider";
import { Shell } from "@/components/shell";
import { indexable, publicOrigin, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  ...(publicOrigin ? { metadataBase: new URL(publicOrigin) } : {}),
  title: { default: "Online Tools — Free Local-First SEO Tools", template: "%s · Online Tools" },
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
  return (
    <html lang="en">
      <body>
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
