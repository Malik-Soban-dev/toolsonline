import { describe, expect, it } from "vitest";
import {
  buildClusters,
  cleanKeywords,
  groupByCluster,
  DEFAULT_OPTIONS,
  generateSuggestions,
  inferIntent,
  keywordSignature,
  SAMPLE_INPUT,
  tokenize,
} from "../../lib/keywords";

describe("keyword cleaning", () => {
  it("trims, normalizes whitespace, lowercases, and deduplicates", () => {
    const result = cleanKeywords(" Coffee   Beans \ncoffee beans\nTEA\n\n");
    expect(result.keywords.map((item) => item.keyword)).toEqual(["coffee beans", "tea"]);
    expect(result.duplicatesRemoved).toBe(1);
    expect(result.inputCount).toBe(3);
  });
  it("normalizes compatibility Unicode without stripping accents", () =>
    expect(cleanKeywords("Ｃａｆé\ncafé").keywords.map((item) => item.keyword)).toEqual(["café"]));
  it("preserves case when requested but deduplicates case-insensitively", () =>
    expect(
      cleanKeywords("Coffee\nCOFFEE", { ...DEFAULT_OPTIONS, lowercase: false }).keywords.map(
        (item) => item.keyword,
      ),
    ).toEqual(["Coffee"]));
  it("can preserve duplicates", () => {
    const result = cleanKeywords("Coffee\ncoffee", { ...DEFAULT_OPTIONS, deduplicate: false });
    expect(result.keywords).toHaveLength(2);
    expect(result.duplicatesRemoved).toBe(0);
  });
  it("preserves punctuation by default", () =>
    expect(cleanKeywords("coffee, beans!").keywords[0].keyword).toBe("coffee, beans!"));
  it("can replace punctuation with spaces", () =>
    expect(
      cleanKeywords("coffee/beans!!!", { ...DEFAULT_OPTIONS, stripPunctuation: true }).keywords[0]
        .keyword,
    ).toBe("coffee beans"));
  it("handles empty and punctuation-only input", () => {
    expect(cleanKeywords("").keywords).toEqual([]);
    expect(cleanKeywords("!!!").keywords).toEqual([]);
    expect(cleanKeywords("!!!", { ...DEFAULT_OPTIONS, stripPunctuation: true }).keywords).toEqual(
      [],
    );
  });
  it("accepts arrays and normalizes newlines inside a single cell", () =>
    expect(cleanKeywords(["coffee\nbeans", " tea "]).keywords.map((item) => item.keyword)).toEqual([
      "coffee beans",
      "tea",
    ]));
  it("supports Urdu and other Unicode tokens", () =>
    expect(tokenize("کافی کے بیج café 東京 123")).toEqual([
      "کافی",
      "کے",
      "بیج",
      "café",
      "東京",
      "123",
    ]));
  it("processes the visibly labeled sample honestly", () => {
    const result = cleanKeywords(SAMPLE_INPUT);
    expect(result.inputCount).toBe(26);
    expect(result.keywords).toHaveLength(24);
    expect(result.duplicatesRemoved).toBe(2);
    expect(groupByCluster(result.keywords)).toHaveLength(4);
  });
  it("tracks the input and options used for a result", () => {
    const result = cleanKeywords("coffee");
    expect(result.sourceKey).toBe(keywordSignature("coffee", DEFAULT_OPTIONS));
    expect(result.sourceKey).not.toBe(keywordSignature("Coffee", DEFAULT_OPTIONS));
  });
  it("rejects excessive row counts", () =>
    expect(() => cleanKeywords(Array.from({ length: 5001 }, () => "coffee"))).toThrow("5,000"));
  it("rejects excessive character counts", () =>
    expect(() => cleanKeywords("a".repeat(500001))).toThrow("500,000"));
  it("processes 5,000 distinct rows", () =>
    expect(
      cleanKeywords(Array.from({ length: 5000 }, (_, i) => `coffee topic ${i}`)).keywords,
    ).toHaveLength(5000));
});

describe("transparent intent and topics", () => {
  it.each([
    ["buy coffee", "Transactional"],
    ["best coffee reviews", "Commercial"],
    ["how to brew coffee", "Informational"],
    ["coffee beans", "Unclassified"],
    ["how to buy the best coffee", "Transactional"],
    ["buyer coffee", "Unclassified"],
  ])("classifies %s as %s", (keyword, intent) => expect(inferIntent(keyword)).toBe(intent));
  it("groups recurring phrases and leaves isolated wording unclassified", () => {
    const items = cleanKeywords(
      "coffee beans\nbest coffee beans\ncoffee grinder\nbest coffee grinder\nisolated zebra",
    ).keywords;
    expect(items[0].cluster).toBe(items[1].cluster);
    expect(items[2].cluster).toBe(items[3].cluster);
    expect(items[0].cluster).not.toBe(items[2].cluster);
    expect(items[4].cluster).toBe("Other topics");
  });
  it("has no invented search metrics", () =>
    expect(Object.keys(cleanKeywords("coffee").keywords[0]).sort()).toEqual([
      "cluster",
      "id",
      "intent",
      "keyword",
      "words",
    ]));
});

describe("lexical clustering", () => {
  const example = [
    "best coffee beans",
    "how to store coffee beans",
    "coffee grinder reviews",
    "best coffee grinder",
    "how to clean a coffee grinder",
    "cold brew ratio",
    "coffee subscription",
  ];
  it("builds groups from shared wording and reports the shared words", () => {
    const { clusters } = buildClusters(cleanKeywords(example).keywords);
    expect(clusters.map((cluster) => cluster.label)).toEqual(["Coffee grinder", "Coffee beans"]);
    expect(clusters[0].keywords.map((item) => item.keyword)).toEqual([
      "coffee grinder reviews",
      "best coffee grinder",
      "how to clean a coffee grinder",
    ]);
    expect(clusters[0].anchor).toEqual(["coffee", "grinder"]);
  });
  it("separates wording that is too rare to group and too common to anchor", () => {
    const result = buildClusters(cleanKeywords(example).keywords);
    expect(result.keywordCount).toBe(7);
    expect(result.groupedCount).toBe(5);
    expect(result.largestGroup).toBe(3);
    // "coffee" appears in 6 of 7 phrases, so it cannot anchor a group by itself.
    expect(result.ungrouped.map((item) => item.keyword)).toEqual([
      "cold brew ratio",
      "coffee subscription",
    ]);
    expect(result.clusters.every((cluster) => cluster.label !== "Coffee")).toBe(true);
  });
  it("keeps every phrase in exactly one group or the review list", () => {
    const result = buildClusters(cleanKeywords(SAMPLE_INPUT).keywords);
    const grouped = result.clusters.flatMap((cluster) => cluster.keywords.map((item) => item.id));
    expect(new Set(grouped).size).toBe(grouped.length);
    expect(grouped.length + result.ungrouped.length).toBe(result.keywordCount);
  });
  it("honours a larger minimum group size", () => {
    const items = cleanKeywords(example).keywords;
    expect(buildClusters(items, { minSharedWords: 1, minSize: 3 }).clusters).toHaveLength(1);
    expect(buildClusters(items, { minSharedWords: 1, minSize: 5 }).clusters).toHaveLength(0);
  });
  it("can require a shared two-word phrase instead of one shared word", () => {
    const items = cleanKeywords([
      "coffee beans",
      "coffee grinder",
      "coffee maker reviews",
      "coffee maker",
    ]).keywords;
    expect(buildClusters(items, { minSharedWords: 1, minSize: 2 }).clusters[0].label).toBe(
      "Coffee maker",
    );
    // With one shared word allowed, the rare wording "coffee" still separates nothing.
    expect(
      buildClusters(items, { minSharedWords: 2, minSize: 2 }).clusters.map(
        (cluster) => cluster.label,
      ),
    ).toEqual(["Coffee maker"]);
  });
  it("reports the intent mix of a group without inventing metrics", () => {
    const { clusters } = buildClusters(cleanKeywords(example).keywords);
    expect(clusters[0].intentMix).toEqual([
      { intent: "Commercial", count: 2 },
      { intent: "Informational", count: 1 },
    ]);
    expect(Object.keys(clusters[0]).sort()).toEqual([
      "anchor",
      "id",
      "intentMix",
      "keywords",
      "label",
      "sharedTerms",
    ]);
  });
  it("groups the published sample into four shared-word groups", () => {
    const result = cleanKeywords(SAMPLE_INPUT);
    const { clusters, ungrouped } = buildClusters(result.keywords);
    expect(result.keywords).toHaveLength(24);
    expect(clusters.map((cluster) => cluster.label)).toEqual([
      "Coffee grinder",
      "Cold brew",
      "Pour over",
      "Coffee beans",
    ]);
    expect(ungrouped).toHaveLength(0);
    expect(groupByCluster(result.keywords)).toHaveLength(4);
  });
  it("gives studio topic labels from the same engine", () => {
    const items = cleanKeywords(example).keywords;
    const labels = new Map(
      buildClusters(items).clusters.flatMap((cluster) =>
        cluster.keywords.map((item) => [item.keyword, cluster.label] as const),
      ),
    );
    for (const item of items) expect(item.cluster).toBe(labels.get(item.keyword) ?? "Other topics");
    expect(items.find((item) => item.keyword === "cold brew ratio")?.cluster).toBe("Other topics");
  });
  it("stays deterministic for the same input and options", () => {
    const items = cleanKeywords(SAMPLE_INPUT).keywords;
    expect(buildClusters(items)).toEqual(buildClusters(items));
  });
});

describe("template suggestions", () => {
  it("returns 24 unique suggestions in three categories", () => {
    const items = generateSuggestions("coffee beans");
    expect(items).toHaveLength(24);
    expect(new Set(items.map((item) => item.keyword)).size).toBe(24);
    expect(new Set(items.map((item) => item.category)).size).toBe(3);
  });
  it("does not claim to generate data for an empty seed", () =>
    expect(generateSuggestions("   ")).toEqual([]));
  it("normalizes seed whitespace", () =>
    expect(generateSuggestions(" Coffee   Beans ")[0].keyword).toBe(
      "what to know about coffee beans",
    ));
  it("caps seed length", () =>
    expect(() => generateSuggestions("a".repeat(101))).toThrow("100 characters"));
});
