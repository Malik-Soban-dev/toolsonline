import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pages, publicPages, type PageDefinition } from "../../lib/pages";

// Fixture only. Tests never request or connect this domain.
const launchOrigin = "https://tools.launch-fixture.net";

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("SITE_URL", "");
  vi.stubEnv("ALLOW_INDEXING", "false");
  vi.stubEnv("VERCEL_ENV", "");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

function launch() {
  vi.stubEnv("SITE_URL", launchOrigin);
  vi.stubEnv("ALLOW_INDEXING", "true");
  vi.stubEnv("VERCEL_ENV", "production");
}

describe("safe metadata before a deliberate custom-domain launch", () => {
  it("omits public URLs and disables indexing without a configured origin", async () => {
    vi.stubEnv("ALLOW_INDEXING", "true");
    const site = await import("../../lib/site");
    expect(site.indexable).toBe(false);
    expect(site.publicOrigin).toBeUndefined();
    expect(site.pageMetadata(pages.studio).alternates).toBeUndefined();
    expect(site.pageSchema(pages.studio)).not.toHaveProperty("url");
  });

  it.each([
    "http://owned-domain.net",
    "https://example.com",
    "https://www.example.org",
    "https://example.net",
    "not-a-url",
    "https://user:password@owned-domain.net",
    "https://owned-domain.net:8443",
    "https://owned-domain.net/path",
    "https://owned-domain.net/?preview=true",
    "https://owned-domain.net/#launch",
    "https://localhost",
    "https://127.0.0.1",
    "https://[::1]",
    "https://192.168.1.4",
    "https://workspace.local",
    "https://workspace.internal",
    "https://workspace.invalid",
    "https://workspace.test",
    "https://workspace.example",
    "https://workspace.localhost",
    "https://owned-domain.net.",
    "https://-invalid.domain.net",
    "https://preview.vercel.app",
    "https://branch.project.vercel.app",
    "https://3000-sandbox.e2b.app",
    "https://preview.netlify.app",
    "https://preview.pages.dev",
    "https://owner.github.io",
    "https://preview.web.app",
    "https://preview.firebaseapp.com",
    "https://preview.onrender.com",
    "https://preview.railway.app",
    "https://preview.replit.app",
    "https://preview.ngrok.io",
    "https://preview.ngrok-free.app",
    "https://preview.trycloudflare.com",
  ])("rejects inappropriate launch origin %s", async (origin) => {
    launch();
    vi.stubEnv("SITE_URL", origin);
    const site = await import("../../lib/site");
    expect(site.siteOrigin).toBeUndefined();
    expect(site.indexable).toBe(false);
    expect(site.publicOrigin).toBeUndefined();
  });

  it.each(["preview", "development", "unknown"])(
    "keeps Vercel %s builds noindex even with a valid domain and opt-in",
    async (environment) => {
      launch();
      vi.stubEnv("VERCEL_ENV", environment);
      const site = await import("../../lib/site");
      expect(site.indexable).toBe(false);
      expect(site.pageMetadata(pages.ideas).alternates).toBeUndefined();
      expect(site.pageMetadata(pages.ideas).openGraph).not.toHaveProperty("url");
    },
  );

  it.each(["false", "TRUE", "1", "yes", ""])(
    "does not treat %s as deliberate indexing opt-in",
    async (value) => {
      launch();
      vi.stubEnv("ALLOW_INDEXING", value);
      const site = await import("../../lib/site");
      expect(site.indexable).toBe(false);
      expect(site.pageMetadata(pages.studio).alternates).toBeUndefined();
    },
  );

  it.each(["", "production"])(
    "accepts an explicitly launched build with Vercel env %s",
    async (env) => {
      launch();
      vi.stubEnv("VERCEL_ENV", env);
      vi.stubEnv("SITE_URL", "https://TOOLS.LAUNCH-FIXTURE.NET/");
      const site = await import("../../lib/site");
      expect(site.siteOrigin).toBe(launchOrigin);
      expect(site.indexable).toBe(true);
      expect(site.pageMetadata(pages.ideas).alternates?.canonical).toBe(
        `${launchOrigin}/keyword-ideas/`,
      );
    },
  );
});

describe("route-specific public facts", () => {
  it("has unique titles and descriptions and excludes the private collection from public routes", () => {
    const all = Object.values(pages);
    expect(all).toHaveLength(11);
    expect(new Set(all.map((page) => page.path)).size).toBe(all.length);
    expect(new Set(all.map((page) => page.title)).size).toBe(all.length);
    expect(new Set(all.map((page) => page.description)).size).toBe(all.length);
    expect(publicPages).toHaveLength(10);
    expect(publicPages.map((page) => page.path)).not.toContain("/saved/");
    for (const page of all) expect(page.path).toMatch(/^\/(?:[a-z-]+\/)?$/);
  });

  it.each(Object.values(pages))(
    "uses an explicit branded title and complete social metadata for $path",
    async (page: PageDefinition) => {
      const site = await import("../../lib/site");
      const metadata = site.pageMetadata(page);
      const title = `${page.title} · Online Tools`;
      expect(metadata.title).toEqual({ absolute: title });
      expect(metadata.description).toBe(page.description);
      expect(metadata.openGraph).toMatchObject({
        title,
        siteName: "Online Tools",
        locale: "en_US",
        description: page.description,
      });
      expect(metadata.twitter).toMatchObject({
        title,
        card: "summary_large_image",
        description: page.description,
      });
      expect(metadata.openGraph).not.toHaveProperty("url");
      expect(metadata.openGraph).not.toHaveProperty("images");
      expect(metadata.twitter).not.toHaveProperty("images");
    },
  );

  it("aligns canonical, Open Graph, Twitter, and route schema URLs after launch", async () => {
    launch();
    const site = await import("../../lib/site");
    for (const page of publicPages) {
      const url = `${launchOrigin}${page.path}`;
      const metadata = site.pageMetadata(page);
      expect(metadata.alternates?.canonical).toBe(url);
      expect(metadata.openGraph).toMatchObject({
        url,
        images: [{ url: `${launchOrigin}/social-card.png`, width: 1200, height: 630 }],
      });
      expect(metadata.twitter).toMatchObject({
        images: [{ url: `${launchOrigin}/social-card.png` }],
      });
      expect(site.pageSchema(page)).toMatchObject({
        url,
        "@type": page.schemaType,
        name: page.title,
      });
    }
  });

  it("describes only the relevant tool or trust-page type without invented ratings or personal input", async () => {
    const site = await import("../../lib/site");
    for (const page of publicPages) {
      const schema = site.pageSchema(page);
      expect(schema).toMatchObject({
        "@context": "https://schema.org",
        "@type": page.schemaType,
        name: page.title,
        description: page.description,
      });
      if (page.schemaType === "WebApplication") {
        expect(schema).toMatchObject({ isAccessibleForFree: true, featureList: page.features });
      } else {
        expect(schema).not.toHaveProperty("applicationCategory");
        expect(schema).not.toHaveProperty("featureList");
      }
      for (const key of ["aggregateRating", "review", "dateModified", "keywords"]) {
        expect(schema).not.toHaveProperty(key);
      }
    }
    expect(site.pageSchema(pages.about)?.["@type"]).toBe("AboutPage");
    expect(site.pageSchema(pages.contact)?.["@type"]).toBe("ContactPage");
  });

  it("keeps the collection noindex without a canonical or structured data even after launch", async () => {
    launch();
    const site = await import("../../lib/site");
    const metadata = site.pageMetadata(pages.saved);
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).not.toHaveProperty("url");
    expect(site.pageSchema(pages.saved)).toBeUndefined();
  });

  it("escapes inline script delimiters without corrupting JSON-LD", async () => {
    const { jsonLd } = await import("../../lib/site");
    const data = { name: "</script><script>alert('x')</script> & text" };
    const serialized = jsonLd(data);
    expect(serialized).not.toContain("<");
    expect(JSON.parse(serialized)).toEqual(data);
  });
});

describe("crawl and sitemap controls", () => {
  it("lets crawlers read noindex while publishing no preview sitemap URLs", async () => {
    const { default: robots } = await import("../../app/robots");
    const { default: sitemap } = await import("../../app/sitemap");
    expect(robots()).toEqual({ rules: { userAgent: "*", allow: "/" } });
    expect(sitemap()).toEqual([]);
  });

  it("publishes exactly the public canonical routes after a deliberate launch", async () => {
    launch();
    const { default: robots } = await import("../../app/robots");
    const { default: sitemap } = await import("../../app/sitemap");
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${launchOrigin}/sitemap.xml`,
      host: launchOrigin,
    });
    expect(sitemap()).toEqual(publicPages.map((page) => ({ url: `${launchOrigin}${page.path}` })));
    expect(sitemap()).not.toContainEqual(
      expect.objectContaining({ lastModified: expect.anything() }),
    );
  });

  it("keeps Vercel hostnames and the collection covered by noindex header rules", () => {
    const config = JSON.parse(readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"));
    const rule = config.headers.find((entry: { has?: unknown }) => entry.has);
    const hostPattern = new RegExp(`^(?:${rule.has[0].value})$`);
    expect(rule.headers).toContainEqual({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    expect(hostPattern.test("toolsonline-branch.vercel.app")).toBe(true);
    expect(hostPattern.test("3000-sandbox.e2b.app")).toBe(true);
    expect(hostPattern.test("tools.launch-fixture.net")).toBe(false);
    expect(hostPattern.test("preview.vercel.app.customer-domain.net")).toBe(false);
    expect(config.headers).toContainEqual({
      source: "/saved/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    });
  });
});
