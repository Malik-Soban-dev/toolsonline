import { describe, expect, it } from "vitest";
import {
  analyzeText,
  characterCount,
  descriptionIdeas,
  escapeHtml,
  estimatePixels,
  metaMarkup,
  normalizePreviewUrl,
  titleIdeas,
} from "../../lib/analysis";

describe("text analysis", () => {
  it("counts words, sentences, paragraphs, and approximate reading time", () => {
    const result = analyzeText("Coffee is good. Tea is good!\n\nBrew slowly.");
    expect(result.words).toBe(8);
    expect(result.sentences).toBe(3);
    expect(result.paragraphs).toBe(2);
    expect(result.readingMinutes).toBe(1);
    expect(result.uniqueWords).toBe(6);
  });
  it("counts focus phrases by whole tokens and case-insensitively", () => {
    const result = analyzeText("Coffee beans, coffee BEANS and beanstalk.", "coffee beans");
    expect(result.focusOccurrences).toBe(2);
    expect(result.focusDensity).toBeCloseTo(100 / 3);
    expect(result.focusCoverage).toBeCloseTo(200 / 3);
  });
  it("does not join words across removed stop words", () =>
    expect(analyzeText("coffee and beans").phrases).toEqual([]));
  it("handles overlapping phrase matches explicitly", () =>
    expect(analyzeText("go go go", "go go").focusOccurrences).toBe(2));
  it("excludes common English words from frequency results", () =>
    expect(analyzeText("the the coffee coffee and tea").frequencies[0]).toMatchObject({
      phrase: "coffee",
      count: 2,
    }));
  it("returns finite zeros for empty input", () => {
    const result = analyzeText("");
    expect(result.words).toBe(0);
    expect(result.focusDensity).toBe(0);
    expect(result.readingMinutes).toBe(0);
    expect(result.sentences).toBe(0);
  });
  it("counts code points, not UTF-16 code units", () => expect(characterCount("😀é")).toBe(2));
});

describe("snippet and title helpers", () => {
  it("normalizes a display URL without fetching it", () =>
    expect(normalizePreviewUrl("example.com/guides/coffee%20beans")).toEqual({
      host: "example.com",
      path: "guides › coffee beans",
      valid: true,
    }));
  it.each(["javascript:alert(1)", "not a url", "https://", "ftp://example.com"])(
    "rejects invalid or non-web URL %s",
    (url) => expect(normalizePreviewUrl(url).valid).toBe(false),
  );
  it("does not crash on malformed URI escapes", () =>
    expect(normalizePreviewUrl("https://example.com/%E0%A4%A").path).toBe("%E0%A4%A"));
  it("uses an illustrative URL for an empty preview", () =>
    expect(normalizePreviewUrl("").host).toBe("example.com"));
  it("estimates wide letters as wider than narrow letters", () =>
    expect(estimatePixels("WWW")).toBeGreaterThan(estimatePixels("iii")));
  it("handles Unicode in width estimates", () => expect(estimatePixels("東京")).toBe(40));
  it("escapes HTML and attribute characters", () =>
    expect(escapeHtml("<script>\"&'")).toBe("&lt;script&gt;&quot;&amp;&#39;"));
  it("produces non-executable escaped meta tags", () => {
    const markup = metaMarkup("</title><script>alert(1)</script>", '" onload="alert(1)');
    expect(markup).not.toContain("<script>");
    expect(markup).toContain("&lt;/title&gt;");
    expect(markup).toContain("&quot; onload=&quot;");
  });
  it("generates four titles, with optional brand", () => {
    expect(titleIdeas("Coffee", "Brew")).toHaveLength(4);
    expect(titleIdeas("Coffee", "")[0]).not.toContain("|");
    expect(titleIdeas("", "Brand")).toEqual([]);
  });
  it("generates three descriptions and handles an optional benefit", () => {
    expect(descriptionIdeas("Coffee", "")).toHaveLength(3);
    expect(descriptionIdeas("Coffee", "Save time.")[0]).toContain("save time.");
    expect(descriptionIdeas("", "")).toEqual([]);
  });
});
