import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
describe("safe metadata before a final domain", () => {
  it("omits canonical URLs and disables indexing without a real origin", async () => {
    vi.stubEnv("SITE_URL", "");
    vi.stubEnv("ALLOW_INDEXING", "true");
    const site = await import("../../lib/site");
    expect(site.indexable).toBe(false);
    expect(site.pageMetadata("Test", "Description", "/test/").alternates).toBeUndefined();
  });
  it.each([
    "http://example.org",
    "https://example.com",
    "not-a-url",
    "https://user:password@example.org",
  ])("rejects inappropriate domain %s", async (origin) => {
    vi.stubEnv("SITE_URL", origin);
    const site = await import("../../lib/site");
    expect(site.siteOrigin).toBeUndefined();
  });
  it("keeps Vercel previews noindex even with indexing opt-in", async () => {
    vi.stubEnv("SITE_URL", "https://owned-domain.test");
    vi.stubEnv("ALLOW_INDEXING", "true");
    vi.stubEnv("VERCEL_ENV", "preview");
    const site = await import("../../lib/site");
    expect(site.indexable).toBe(false);
  });
  it("allows deliberate production-domain indexing and per-page canonicals", async () => {
    vi.stubEnv("SITE_URL", "https://owned-domain.test/path");
    vi.stubEnv("ALLOW_INDEXING", "true");
    vi.stubEnv("VERCEL_ENV", "production");
    const site = await import("../../lib/site");
    expect(site.indexable).toBe(true);
    expect(site.pageMetadata("Test", "Description", "/test/").alternates?.canonical).toBe(
      "https://owned-domain.test/test/",
    );
  });
});
