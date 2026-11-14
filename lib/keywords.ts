import { MAX_INPUT_CHARS, MAX_ROWS } from "./csv";

export type Intent = "Informational" | "Commercial" | "Transactional" | "Unclassified";
export type Keyword = {
  id: string;
  keyword: string;
  words: number;
  intent: Intent;
  cluster: string;
};
export type CleanOptions = { lowercase: boolean; deduplicate: boolean; stripPunctuation: boolean };
export type CleanResult = {
  keywords: Keyword[];
  inputCount: number;
  duplicatesRemoved: number;
  emptyRemoved: number;
  cleanedCount: number;
  sourceKey: string;
};

export const DEFAULT_OPTIONS: CleanOptions = {
  lowercase: true,
  deduplicate: true,
  stripPunctuation: false,
};
export const SAMPLE_INPUT = `best coffee beans
coffee beans for espresso
how to store coffee beans
buy coffee beans online
organic coffee beans
Best Coffee Beans
  coffee beans for espresso\u0020\u0020
coffee grinder
best coffee grinder
manual coffee grinder
coffee grinder reviews
buy coffee grinder
coffee grinder vs blender
how to clean a coffee grinder
cold brew coffee
how to make cold brew
cold brew ratio
cold brew coffee recipe
cold brew maker
best cold brew maker
pour over coffee
how to make pour over coffee
pour over coffee ratio
pour over coffee kit
best pour over coffee maker
buy pour over coffee kit
\n`;

// These modifiers do not make good topic anchors. Matching remains lexical, not semantic.
const STOPWORDS = new Set(
  `a an the and or of to in on for from with without is are was be by at as it my your our their how what why when where which who can do does should will best top good better cheap cheapest affordable review reviews vs versus compare comparison buy purchase shop online price pricing cost costs near me guide guides tips tutorial beginners beginner benefits new sale discount coupon free`.split(
    " ",
  ),
);
const canonical = (text: string) => text.normalize("NFKC").toLocaleLowerCase("en");

export function tokenize(text: string): string[] {
  return canonical(text).match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];
}

export function inferIntent(text: string): Intent {
  const words = new Set(tokenize(text));
  if (
    [
      "buy",
      "purchase",
      "shop",
      "order",
      "coupon",
      "discount",
      "sale",
      "pricing",
      "price",
      "cost",
    ].some((word) => words.has(word))
  )
    return "Transactional";
  if (
    [
      "best",
      "top",
      "review",
      "reviews",
      "vs",
      "versus",
      "compare",
      "comparison",
      "alternatives",
    ].some((word) => words.has(word))
  )
    return "Commercial";
  if (
    [
      "how",
      "what",
      "why",
      "when",
      "where",
      "who",
      "guide",
      "tutorial",
      "tips",
      "recipe",
      "benefits",
    ].some((word) => words.has(word))
  )
    return "Informational";
  return "Unclassified";
}

/** Lightweight English suffix normalization, deliberately not advertised as semantic analysis. */
function stem(token: string): string {
  if (token.length > 5 && token.endsWith("ies")) return token.slice(0, -3) + "y";
  if (token.length > 4 && token.endsWith("s") && !token.endsWith("ss")) return token.slice(0, -1);
  return token;
}

function topicTokens(text: string): string[] {
  return tokenize(text)
    .filter((token) => !STOPWORDS.has(token) && token.length > 1)
    .map(stem);
}

/** Bigram-first lexical grouping, O(n * words). Shared ordered phrases are evidence, not SERP overlap. */
export function clusterKeywords(items: Omit<Keyword, "cluster">[]): Keyword[] {
  const documents = items.map((item) => topicTokens(item.keyword));
  const singles = new Map<string, number>();
  const pairs = new Map<string, number>();
  for (const tokens of documents) {
    for (const token of new Set(tokens)) singles.set(token, (singles.get(token) ?? 0) + 1);
    const bigrams = tokens.slice(0, -1).map((token, index) => `${token} ${tokens[index + 1]}`);
    for (const pair of new Set(bigrams)) pairs.set(pair, (pairs.get(pair) ?? 0) + 1);
  }
  return items.map((item, index) => {
    const tokens = documents[index];
    const bigrams = tokens.slice(0, -1).map((token, i) => `${token} ${tokens[i + 1]}`);
    // Prefer specific recurring phrases, but suppress corpus-wide anchors (e.g. 'coffee').
    const candidatePairs = bigrams
      .filter((pair) => (pairs.get(pair) ?? 0) >= 2)
      .sort((a, b) => (pairs.get(b) ?? 0) - (pairs.get(a) ?? 0) || a.localeCompare(b));
    const candidateSingles = [...new Set(tokens)]
      .filter(
        (token) =>
          (singles.get(token) ?? 0) >= 2 && (singles.get(token) ?? 0) < items.length * 0.85,
      )
      .sort((a, b) => (singles.get(b) ?? 0) - (singles.get(a) ?? 0) || a.localeCompare(b));
    const cluster = candidatePairs[0] ?? candidateSingles[0] ?? "Other topics";
    return {
      ...item,
      cluster:
        cluster === "Other topics" ? cluster : cluster.charAt(0).toUpperCase() + cluster.slice(1),
    };
  });
}

export function keywordSignature(input: string | string[], options: CleanOptions): string {
  return JSON.stringify([
    Array.isArray(input) ? input.join("\n") : input,
    options.lowercase,
    options.deduplicate,
    options.stripPunctuation,
  ]);
}

export function cleanKeywords(
  input: string | string[],
  options: CleanOptions = DEFAULT_OPTIONS,
): CleanResult {
  const raw = Array.isArray(input) ? input : input.split(/\r?\n|\r/u);
  if ((Array.isArray(input) ? input.join("\n") : input).length > MAX_INPUT_CHARS)
    throw new Error("Use up to 500,000 characters at a time.");
  const nonEmpty = raw.filter((line) => line.trim());
  if (nonEmpty.length > MAX_ROWS) throw new Error("Use no more than 5,000 keywords at a time.");
  let duplicatesRemoved = 0;
  let cleanedCount = 0;
  const seen = new Set<string>();
  const items: Omit<Keyword, "cluster">[] = [];
  for (const rawKeyword of nonEmpty) {
    let keyword = rawKeyword.normalize("NFKC").trim().replace(/\s+/gu, " ");
    if (options.lowercase) keyword = canonical(keyword);
    if (options.stripPunctuation)
      keyword = keyword
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/gu, " ")
        .trim();
    if (!keyword || !tokenize(keyword).length) continue;
    if (keyword !== rawKeyword) cleanedCount++;
    const key = canonical(keyword);
    if (options.deduplicate && seen.has(key)) {
      duplicatesRemoved++;
      continue;
    }
    seen.add(key);
    items.push({
      id: `k-${items.length}`,
      keyword,
      words: tokenize(keyword).length,
      intent: inferIntent(keyword),
    });
  }
  return {
    keywords: clusterKeywords(items),
    inputCount: nonEmpty.length,
    duplicatesRemoved,
    emptyRemoved: raw.length - nonEmpty.length,
    cleanedCount,
    sourceKey: keywordSignature(input, options),
  };
}

export type Suggestion = {
  keyword: string;
  category: "Questions" | "Comparisons" | "Long-tail";
  intent: Intent;
};
export function generateSuggestions(seed: string): Suggestion[] {
  const topic = seed.normalize("NFKC").replace(/\s+/gu, " ").trim().toLowerCase();
  if (!topic) return [];
  if (topic.length > 100) throw new Error("Keep your seed topic to 100 characters or fewer.");
  const groups: { category: Suggestion["category"]; templates: string[] }[] = [
    {
      category: "Questions",
      templates: [
        `what to know about ${topic}`,
        `how to choose ${topic}`,
        `how to get started with ${topic}`,
        `why choose ${topic}`,
        `what to check before buying ${topic}`,
        `how to use ${topic}`,
        `what to look for in ${topic}`,
        `how to compare ${topic}`,
      ],
    },
    {
      category: "Comparisons",
      templates: [
        `best ${topic}`,
        `${topic} alternatives`,
        `${topic} comparison`,
        `${topic} reviews`,
        `affordable ${topic}`,
        `${topic} pros and cons`,
        `best ${topic} for beginners`,
        `${topic} buying guide`,
      ],
    },
    {
      category: "Long-tail",
      templates: [
        `${topic} for beginners`,
        `${topic} step by step`,
        `${topic} checklist`,
        `${topic} tips and tricks`,
        `${topic} common mistakes`,
        `${topic} maintenance guide`,
        `${topic} for small spaces`,
        `${topic} on a budget`,
      ],
    },
  ];
  return groups.flatMap(({ category, templates }) =>
    templates.map((keyword) => ({ keyword, category, intent: inferIntent(keyword) })),
  );
}

export function clusterSummary(keywords: Keyword[]) {
  const groups = new Map<string, Keyword[]>();
  for (const item of keywords) {
    const group = groups.get(item.cluster);
    if (group) group.push(item);
    else groups.set(item.cluster, [item]);
  }
  return [...groups]
    .map(([name, items]) => ({ name, items }))
    .sort((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name));
}
