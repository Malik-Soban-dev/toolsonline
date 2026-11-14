import { expect, test } from "@playwright/test";
import { pages, publicPages, type PageDefinition } from "../../lib/pages";

const definitions: PageDefinition[] = Object.values(pages);
const tasks: Record<string, string> = {
  "/": "A cleaner keyword list",
  "/keyword-clusters/": "Keyword clustering",
  "/keyword-ideas/": "Keyword ideas",
  "/text-analyzer/": "Word frequency counter",
  "/serp-preview/": "SERP snippet preview",
  "/meta-helper/": "Title & meta helper",
  "/saved/": "Your keyword collection",
  "/about/": "About Online Tools",
  "/methodology/": "How the tools work",
  "/privacy/": "Privacy policy",
  "/terms/": "Terms of use",
  "/contact/": "Contact Online Tools",
};

// Also run this suite against a local, fixture-domain launch build. No domain is requested.
const launchOrigin = process.env.TEST_LAUNCH_ORIGIN;

test("exported SEO signals agree with launch state on every route", async ({ page, request }) => {
  for (const definition of definitions) {
    const response = await page.goto(definition.path);
    expect(response?.status()).toBe(200);
    // npm start is a preview server even when evaluating a launch-mode export locally.
    expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
    await expect(page).toHaveTitle(`${definition.title} · Online Tools`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(tasks[definition.path]);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      definition.description,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      launchOrigin && !definition.private ? "index, follow" : "noindex, nofollow",
    );
    const canonical = page.locator('link[rel="canonical"]');
    const schemas = (
      await page.locator('script[type="application/ld+json"]').allTextContents()
    ).map((text) => JSON.parse(text));
    if (launchOrigin && !definition.private) {
      const url = `${launchOrigin}${definition.path}`;
      await expect(canonical).toHaveCount(1);
      await expect(canonical).toHaveAttribute("href", url);
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", url);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        "content",
        `${launchOrigin}/social-card.png`,
      );
      await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
        "content",
        `${launchOrigin}/social-card.png`,
      );
      expect(schemas[0]).toMatchObject({
        "@type": definition.schemaType,
        name: definition.title,
        url,
      });
      if (definition.path === "/") {
        expect(schemas).toHaveLength(2);
        expect(schemas[1]).toMatchObject({
          "@type": "WebSite",
          name: "Online Tools",
          url: `${launchOrigin}/`,
        });
      } else {
        expect(schemas).toHaveLength(1);
      }
    } else {
      await expect(canonical).toHaveCount(0);
      await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
      if (definition.private) expect(schemas).toHaveLength(0);
      else {
        expect(schemas).toHaveLength(1);
        expect(schemas[0]).not.toHaveProperty("url");
      }
    }
  }
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Allow: /");
  expect(await robots.text()).not.toContain("Disallow:");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const locations = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  expect(locations).toEqual(
    launchOrigin ? publicPages.map((page) => `${launchOrigin}${page.path}`) : [],
  );
  expect(await robots.text()).toContain(
    launchOrigin ? `Sitemap: ${launchOrigin}/sitemap.xml` : "User-Agent: *",
  );
  if (!launchOrigin) expect(await robots.text()).not.toContain("Sitemap:");

  const missing = await page.goto("/missing-seo-audit-page/");
  expect(missing?.status()).toBe(404);
  await expect(page).toHaveTitle("Page Not Found · Online Tools");
  expect((await page.locator('meta[name="robots"]').allTextContents()).length).toBeGreaterThan(0);
  const missingRobots = await page
    .locator('meta[name="robots"]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("content")));
  expect(missingRobots.some((value) => value?.includes("noindex"))).toBe(true);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});

test("all internal links and methodology fragments resolve", async ({ page }) => {
  const documents = new Map<string, { ids: string[]; links: string[] }>();
  for (const definition of definitions) {
    const response = await page.goto(definition.path);
    expect(response?.status()).toBe(200);
    documents.set(
      definition.path,
      await page.evaluate(() => ({
        ids: [...document.querySelectorAll("[id]")].map((node) => node.id),
        links: [...document.querySelectorAll<HTMLAnchorElement>("a[href]")]
          .map((node) => node.getAttribute("href")!)
          .filter((href) => href.startsWith("/") || href.startsWith("#")),
      })),
    );
  }
  for (const [path, document] of documents) {
    for (const href of document.links) {
      const target = new URL(href, `https://internal.invalid${path}`);
      expect(documents.has(target.pathname), `${path} → ${href}`).toBe(true);
      if (target.hash)
        expect(documents.get(target.pathname)?.ids, `${path} → ${href}`).toContain(
          decodeURIComponent(target.hash.slice(1)),
        );
    }
  }
});

test("tool instructions, examples, and contextual links are readable without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    for (const definition of definitions.filter((item) => item.schemaType === "WebApplication")) {
      await page.goto(definition.path);
      const guide = page.locator(".tool-guide");
      await expect(guide.getByRole("heading", { level: 2 })).toBeVisible();
      await expect(guide.locator(".guide-steps li")).toHaveCount(3);
      await expect(guide.locator(".guide-example")).toBeVisible();
      await expect(
        guide.getByRole("navigation", { name: "Related tools" }).getByRole("link"),
      ).toHaveCount(2);
    }
    await page.goto("/");
    await page
      .locator(".tool-guide")
      .getByRole("link", { name: "Explore template keyword ideas" })
      .click();
    await expect(page).toHaveURL("/keyword-ideas/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Keyword ideas");
  } finally {
    await context.close();
  }
});

test("worked examples agree with real keyword and text-analysis output", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".guide-example")).toContainText("become one row");
  await page
    .getByLabel("Keyword list, one keyword per line")
    .fill("  Best   Coffee Beans  \nbest coffee beans");
  await page.getByRole("button", { name: "Clean & organize" }).click();
  await expect(page.locator(".keyword-table tbody tr")).toHaveCount(1);
  await expect(page.locator(".keyword-table tbody")).toContainText("best coffee beans");
  await expect(page.getByRole("status")).toContainText("1 duplicate removed");
  await page.goto("/text-analyzer/");
  await page.getByLabel("Text to analyze").fill("coffee beans coffee beans");
  await page.getByLabel("Focus phrase", { exact: false }).fill("coffee beans");
  await expect(page.locator(".focus-results")).toContainText("2exact phrase matches");
  await expect(page.locator(".focus-results")).toContainText("50.0%");
  await expect(page.locator(".focus-results")).toContainText("100.0%");
  await expect(page.locator(".guide-example")).toContainText(
    "50% occurrence frequency and 100% token coverage",
  );
});

test("structured data never incorporates keyword input or the private collection", async ({
  page,
}) => {
  await page.goto("/");
  const before = await page.locator('script[type="application/ld+json"]').allTextContents();
  await page.getByLabel("Keyword list, one keyword per line").fill("private SEO content sentinel");
  await page.getByRole("button", { name: "Clean & organize" }).click();
  await page.locator(".keyword-table .save-keyword").first().click();
  expect(await page.locator('script[type="application/ld+json"]').allTextContents()).toEqual(
    before,
  );
  await page.getByRole("link", { name: "My collection", exact: false }).click();
  await expect(page.locator(".collection-table")).toContainText("private seo content sentinel");
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});
