import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { pages, type PageDefinition } from "../../lib/pages";

const mainRoutes = [
  "/",
  "/keyword-ideas/",
  "/text-analyzer/",
  "/serp-preview/",
  "/meta-helper/",
  "/saved/",
  "/about/",
  "/methodology/",
  "/privacy/",
  "/terms/",
  "/contact/",
];

test("studio cleans and filters a real list, then exports the actual CSV", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("A cleaner keyword list");
  await expect(page.getByText("Example list · coffee")).toBeVisible();
  await page
    .getByLabel("Keyword list, one keyword per line")
    .fill("  BEST Coffee  \nBEST COFFEE\nhow to brew coffee\nbuy coffee online\ncoffee beans");
  await expect(page.getByText("Your input changed.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Clean & organize" }).click();
  await expect(page.getByRole("status")).toContainText("4 keywords organized. 1 duplicate removed");
  await expect(page.locator(".keyword-table tbody tr")).toHaveCount(4);
  await page.getByLabel("Filter by intent").selectOption("Transactional");
  await expect(page.locator(".keyword-table tbody tr")).toHaveCount(1);
  await expect(page.locator(".keyword-table tbody")).toContainText("buy coffee online");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const download = await downloadPromise;
  const csv = await readFile((await download.path())!, "utf8");
  expect(csv).toContain('"buy coffee online","Transactional"');
  expect(csv).toContain('"Intent (heuristic)"');
  expect(csv).not.toContain('"best coffee"');
});

test("supports topic exploration, pagination, selection, and saving", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Next keyword page" }).click();
  await expect(page.locator(".pagination")).toContainText("9–16 of 24");
  await page.getByRole("button", { name: "Topic groups", exact: false }).click();
  await expect(page.locator(".cluster-card")).toHaveCount(4);
  await page.getByRole("button", { name: "Explore group" }).first().click();
  await page.getByLabel("Select all keywords on this page").check();
  await page.locator(".selection-bar").getByRole("button", { name: "Save", exact: true }).click();
  await page.getByRole("link", { name: "My collection", exact: false }).click();
  await expect(page.locator(".collection-table tbody tr")).not.toHaveCount(0);
  await page.getByLabel("Search saved keywords").fill("no-match-xyz");
  await expect(page.getByRole("heading", { name: "No keepers match that search" })).toBeVisible();
});

test("CSV import maps a non-first keyword column and normalizes quoted line breaks", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Choose a keyword file").setInputFiles({
    name: "keywords.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      'Volume,Search term,Notes\n42,"Coffee, Beans",example\n55,"cold\nbrew",other\n10,"Coffee, Beans",duplicate',
    ),
  });
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.getByLabel("Keyword column")).toHaveValue("1");
  await dialog.getByRole("button", { name: "Import & organize" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator(".keyword-table tbody tr")).toHaveCount(2);
  await expect(page.locator(".keyword-table tbody")).toContainText("coffee, beans");
  await expect(page.locator(".keyword-table tbody")).toContainText("cold brew");
  await expect(page.getByLabel("Keyword list, one keyword per line")).not.toContainText("42");
});

test("malformed, oversized, empty, and unsupported imports show real errors", async ({ page }) => {
  await page.goto("/");
  const file = page.getByLabel("Choose a keyword file");
  await file.setInputFiles({
    name: "bad.csv",
    mimeType: "text/csv",
    buffer: Buffer.from('keyword\n"unclosed'),
  });
  await expect(page.getByRole("main").getByRole("alert")).toContainText("not closed");
  await file.setInputFiles({ name: "empty.csv", mimeType: "text/csv", buffer: Buffer.from("") });
  await expect(page.getByRole("main").getByRole("alert")).toContainText("empty");
  await file.setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from("{}"),
  });
  await expect(page.getByRole("main").getByRole("alert")).toContainText(".csv, .tsv, or .txt");
  await file.setInputFiles({
    name: "huge.txt",
    mimeType: "text/plain",
    buffer: Buffer.alloc(2 * 1024 * 1024 + 1, "x"),
  });
  await expect(page.getByRole("main").getByRole("alert")).toContainText("under 2 MB");
});

test("import dialog traps focus and Escape returns to the invoking control", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Import a CSV or text file" }).focus();
  await page.getByLabel("Choose a keyword file").setInputFiles({
    name: "safe.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("Keyword\ncoffee"),
  });
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  const focusedInDialog = await page.evaluate(() =>
    Boolean(document.activeElement?.closest("dialog")),
  );
  expect(focusedInDialog).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Import a CSV or text file" })).toBeFocused();
});

test("local persistence is opt-in and can be revoked without clearing the session", async ({
  page,
}) => {
  await page.goto("/");
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  await page.getByLabel("Keyword list, one keyword per line").fill("My private keyword");
  await page.getByRole("button", { name: "Clean & organize" }).click();
  await page.getByRole("button", { name: "Save my private keyword", exact: true }).click();
  await page.getByRole("button", { name: "Remember my workspace", exact: true }).click();
  await page.reload();
  await expect(page.getByLabel("Keyword list, one keyword per line")).toHaveValue(
    "My private keyword",
  );
  await expect(page.locator(".count-badge")).toHaveText("1");
  await page.getByRole("button", { name: "Turn off local saving" }).click();
  expect(await page.evaluate(() => localStorage.getItem("online-tools.workspace.v1"))).toBeNull();
  await expect(page.getByLabel("Keyword list, one keyword per line")).toHaveValue(
    "My private keyword",
  );
  await page.reload();
  await expect(page.getByLabel("Keyword list, one keyword per line")).not.toHaveValue(
    "My private keyword",
  );
});

test("corrupted storage is rejected safely", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "online-tools.workspace.v1",
      JSON.stringify({ version: 1, input: null, saved: "wrong" }),
    ),
  );
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText("could not be restored");
  await expect(page.getByText("Example list · coffee")).toBeVisible();
});

test("ideas are template-labeled, filterable, savable, and transferable", async ({ page }) => {
  await page.goto("/keyword-ideas/");
  await page.getByLabel("Your topic or seed keyword").fill("indoor plants");
  await page.getByRole("button", { name: "Explore ideas" }).click();
  await expect(page.locator(".suggestion-row")).toHaveCount(24);
  await expect(
    page.getByText("Template suggestions are not autocomplete data.", { exact: false }),
  ).toBeVisible();
  await page
    .locator(".category-tabs")
    .getByRole("button", { name: "Questions", exact: false })
    .click();
  await expect(page.locator(".suggestion-row")).toHaveCount(8);
  await page.getByRole("button", { name: "Add 8 to studio" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByLabel("Keyword list, one keyword per line")).toHaveValue(
    /how to choose indoor plants/,
  );
});

test("text analyzer calculates real frequency and clears to an empty state", async ({ page }) => {
  await page.goto("/text-analyzer/");
  await page.getByLabel("Text to analyze").fill("Coffee beans. Coffee beans and tea.");
  await expect(page.locator(".focus-results").first()).toContainText("2");
  await expect(page.locator(".frequency-row").first()).toContainText("beans");
  await page.getByRole("button", { name: "Clear text" }).click();
  await expect(
    page.getByRole("heading", { name: "Your words will find their place" }),
  ).toBeVisible();
});

test("snippet preview is responsive, validates URLs, and escapes injected HTML", async ({
  page,
}) => {
  await page.goto("/serp-preview/");
  await page.getByLabel("Page URL", { exact: true }).fill("not a valid url");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("valid web address");
  await page
    .getByLabel("Page title", { exact: true })
    .fill("</title><script>window.HACKED=1</script>");
  await expect(page.locator(".search-result-title")).toContainText("<script>");
  expect(await page.evaluate(() => "HACKED" in window)).toBe(false);
  await page.getByRole("button", { name: "Mobile preview", exact: true }).click();
  await expect(page.locator(".search-stage")).toHaveClass(/search-stage-mobile/);
  await page.getByRole("button", { name: "Take the HTML with you", exact: false }).click();
  await expect(page.locator("#snippet-html pre")).toContainText("&lt;script&gt;");
});

test("title and meta helper produces editable drafts and downloadable safe markup", async ({
  page,
}) => {
  await page.goto("/meta-helper/");
  await page.getByLabel("Page topic", { exact: true }).fill("Plant Care");
  await page.getByRole("button", { name: "Draft a few options" }).click();
  await expect(page.locator(".title-ideas .draft-option")).toHaveCount(4);
  await page.locator(".title-ideas .draft-option").first().click();
  await expect(page.getByLabel("Your page title", { exact: true })).toHaveValue(/Plant Care/);
  await page.getByLabel("Your page title", { exact: true }).fill("Plants & People");
  await expect(page.locator(".final-code pre")).toContainText("Plants &amp; People");
  const promise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download", exact: true }).click();
  const download = await promise;
  expect(download.suggestedFilename()).toBe("online-tools-meta-tags.html");
});

test("contact prepares an honest public issue draft without a network submission", async ({
  page,
}) => {
  await page.goto("/contact/");
  const outgoing: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith(new URL(page.url()).origin + "/")) outgoing.push(request.url());
  });
  await page.getByLabel("A short subject").fill("CSV example");
  await page.getByLabel("A little more context").fill("The first row should be a header.");
  await page.getByRole("button", { name: "Prepare a GitHub draft" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Your draft is ready" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Review on GitHub" })).toHaveAttribute(
    "href",
    /github\.com\/Malik-Soban-dev\/toolsonline\/issues\/new\?/,
  );
  expect(outgoing).toEqual([]);
});

test("typed keywords never leave the browser and no analytics or external fonts load", async ({
  page,
}) => {
  const requests: { url: string; body: string | null }[] = [];
  page.on("request", (request) => requests.push({ url: request.url(), body: request.postData() }));
  await page.goto("/");
  await page.getByLabel("Keyword list, one keyword per line").fill("CONFIDENTIAL_KEYWORD_SENTINEL");
  await page.getByRole("button", { name: "Clean & organize" }).click();
  await expect(page.getByRole("status")).toContainText("1 keyword organized");
  expect(
    requests.filter((request) => !request.url.startsWith(new URL(page.url()).origin + "/")),
  ).toEqual([]);
  expect(
    requests.some(
      (request) => request.url.includes("CONFIDENTIAL") || request.body?.includes("CONFIDENTIAL"),
    ),
  ).toBe(false);
});

for (const route of mainRoutes) {
  test(`accessible and well-formed: ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    const definition: PageDefinition = Object.values(pages).find((item) => item.path === route)!;
    await expect(page).toHaveTitle(`${definition.title} · Online Tools`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      definition.description,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      `${definition.title} · Online Tools`,
    );
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
      "content",
      "Online Tools",
    );
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute(
      "content",
      definition.description,
    );
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents();
    if (definition.private) {
      expect(schemas).toEqual([]);
    } else {
      expect(schemas).toHaveLength(1);
      expect(JSON.parse(schemas[0])).toMatchObject({
        "@type": definition.schemaType,
        name: definition.title,
      });
    }
    expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
    expect(errors).toEqual([]);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
  });
}

test("mobile navigation and narrow layouts are usable without document overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.getByRole("link", { name: "Keyword ideas", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Keyword ideas", exact: true }).click();
  await expect(page).toHaveURL("/keyword-ideas/");
  await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  for (const route of mainRoutes) {
    await page.goto(route);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
      route,
    ).toBeLessThanOrEqual(390);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((item) => ({ id: item.id, nodes: item.nodes.length })),
      route,
    ).toEqual([]);
  }
});

test("unknown routes get a genuine 404 page", async ({ page }) => {
  const response = await page.goto("/this-does-not-exist/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("out exploring");
  await expect(page).toHaveTitle("Page Not Found · Online Tools");
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
  expect(response?.headers()["x-robots-tag"]).toBe("noindex, nofollow");
});

test("the 5,000 keyword boundary works through the real bulk import workflow", async ({ page }) => {
  await page.goto("/");
  const file = page.getByLabel("Choose a keyword file");
  await file.setInputFiles({
    name: "bulk.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(
      Array.from({ length: 5000 }, (_, index) => `coffee topic ${index}`).join("\n"),
    ),
  });
  await expect(page.locator(".stats-row .stat-value").first()).toContainText("5,000");
  await expect(page.locator(".pagination")).toContainText("of 5000 keywords");
  await file.setInputFiles({
    name: "too-many.txt",
    mimeType: "text/plain",
    buffer: Buffer.from(Array.from({ length: 5001 }, () => "coffee").join("\n")),
  });
  await expect(page.getByRole("main").getByRole("alert")).toContainText("5,000");
});

test("clear input yields a real empty result state", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(page.getByRole("heading", { name: "A fresh starting point" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Clean & organize" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Export CSV" })).toBeDisabled();
});

test("mobile navigation contains focus, closes with Escape, and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 667 });
  await page.goto("/");
  const opener = page.getByRole("button", { name: "Open navigation" });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Main navigation" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  expect(await page.evaluate(() => Boolean(document.activeElement?.closest("aside")))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  await opener.click();
  await dialog.getByRole("link", { name: "A little about us" }).click();
  await expect(page).toHaveURL("/about/");
  await expect(opener).toHaveAttribute("aria-expanded", "false");
});

for (const width of [320, 768, 1024]) {
  test(`no horizontal document overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of mainRoutes) {
      await page.goto(route);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        route,
      ).toBeLessThanOrEqual(width);
    }
  });
}

test("technical SEO and static hosting are safely configured before the domain", async ({
  page,
  request,
}) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("Allow: /");
  expect(await robots.text()).not.toContain("Disallow:");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).not.toContain("<loc>");
  await page.goto("/");
  const schema = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(schema!)).toMatchObject({
    "@type": "WebApplication",
    name: pages.studio.title,
    isAccessibleForFree: true,
  });
  const image = await request.get("/social-card.png");
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toBe("image/png");
  const headers = await request.head("/");
  expect(headers.headers()["x-content-type-options"]).toBe("nosniff");
  expect(headers.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect(headers.headers()["x-frame-options"]).toBeUndefined();
  const missing = await request.get("/not-an-asset.js");
  expect(missing.status()).toBe(404);
});
