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

function contentTokens(text: string): string[] {
  return tokenize(text).filter((token) => !STOPWORDS.has(token) && token.length > 1);
}

function topicTokens(text: string): string[] {
  return contentTokens(text).map(stem);
}

export type ClusterOptions = {
  /** 1 lets one shared word anchor a group; 2 requires a shared two-word phrase. */
  minSharedWords: 1 | 2;
  /** Smallest group to keep. */
  minSize: number;
};

export const DEFAULT_CLUSTER_OPTIONS: ClusterOptions = { minSharedWords: 1, minSize: 2 };
// A readable review surface matters more than an exhaustive list of tiny groups.
export const CLUSTER_MAX_GROUPS = 60;
export const UNGROUPED_LABEL = "Other topics";

export type Cluster = {
  id: string;
  /** Normalized shared wording, e.g. "Coffee grinder". */
  label: string;
  /** Stemmed anchor wording that every phrase in the group contains. */
  anchor: string[];
  /** Other wording shared by most of the group, shown as evidence. */
  sharedTerms: string[];
  keywords: Keyword[];
  intentMix: { intent: Intent; count: number }[];
};

export type ClusterResult = {
  clusters: Cluster[];
  ungrouped: Keyword[];
  keywordCount: number;
  groupedCount: number;
  largestGroup: number;
  /** True when CLUSTER_MAX_GROUPS stopped the greedy pass. */
  truncated: boolean;
};

function bigrams(tokens: string[]): string[] {
  return tokens.slice(0, -1).map((token, index) => `${token} ${tokens[index + 1]}`);
}

function containsSequence(tokens: string[], sequence: string[]): boolean {
  if (!sequence.length) return false;
  for (let start = 0; start + sequence.length <= tokens.length; start++) {
    let matched = true;
    for (let offset = 0; offset < sequence.length; offset++) {
      if (tokens[start + offset] !== sequence[offset]) {
        matched = false;
        break;
      }
    }
    if (matched) return true;
  }
  return false;
}

function mostCommonSurface(stemmed: string, surfaces: string[][]): string {
  const counts = new Map<string, number>();
  for (const tokens of surfaces) {
    const index = tokens.findIndex((token) => stem(token) === stemmed);
    if (index < 0) continue;
    counts.set(tokens[index], (counts.get(tokens[index]) ?? 0) + 1);
  }
  const ranked = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return ranked[0]?.[0] ?? stemmed;
}

/**
 * One greedy, deterministic lexical clustering pass shared by the studio and the clustering tool.
 * Most specific recurring wording anchors first; each phrase joins its first matching group.
 * Shared wording is evidence, never SERP overlap, embeddings, or demand data.
 */
export function buildClusters(
  keywords: Keyword[],
  options: ClusterOptions = DEFAULT_CLUSTER_OPTIONS,
): ClusterResult {
  const documents = keywords.map((item) => topicTokens(item.keyword));
  const surfaces = keywords.map((item) => contentTokens(item.keyword));
  const minSize = Math.max(2, Math.floor(options.minSize));
  const singleCounts = new Map<string, number>();
  const pairCounts = new Map<string, number>();
  for (const tokens of documents) {
    for (const token of new Set(tokens))
      singleCounts.set(token, (singleCounts.get(token) ?? 0) + 1);
    for (const pair of new Set(bigrams(tokens)))
      pairCounts.set(pair, (pairCounts.get(pair) ?? 0) + 1);
  }
  const candidates: { anchor: string[]; count: number; starts: number }[] = [];
  for (const [pair, count] of pairCounts) {
    if (count < minSize) continue;
    const anchor = pair.split(" ");
    const starts = documents.filter((tokens) =>
      containsSequence(tokens.slice(0, anchor.length), anchor),
    ).length;
    candidates.push({ anchor, count, starts });
  }
  if (options.minSharedWords < 2)
    for (const [token, count] of singleCounts) {
      // Suppress corpus-wide anchors; a word in almost every phrase separates nothing.
      if (count < minSize || count >= keywords.length * 0.85) continue;
      candidates.push({
        anchor: [token],
        count,
        starts: documents.filter((t) => t[0] === token).length,
      });
    }
  candidates.sort(
    (a, b) =>
      b.anchor.length - a.anchor.length ||
      b.count - a.count ||
      b.starts - a.starts ||
      a.anchor.join(" ").localeCompare(b.anchor.join(" ")),
  );

  const assigned = new Set<number>();
  const clusters: Cluster[] = [];
  for (const candidate of candidates) {
    if (clusters.length >= CLUSTER_MAX_GROUPS) break;
    const members: number[] = [];
    documents.forEach((tokens, index) => {
      if (assigned.has(index)) return;
      if (containsSequence(tokens, candidate.anchor)) members.push(index);
    });
    if (members.length < minSize) continue;
    for (const index of members) assigned.add(index);
    const memberSurfaces = members.map((index) => surfaces[index]);
    const memberDocuments = members.map((index) => documents[index]);
    const label = candidate.anchor
      .map((token) => mostCommonSurface(token, memberSurfaces))
      .join(" ");
    const anchorSet = new Set(candidate.anchor);
    const otherCounts = new Map<string, number>();
    for (const tokens of memberDocuments)
      for (const token of new Set(tokens)) {
        if (anchorSet.has(token)) continue;
        otherCounts.set(token, (otherCounts.get(token) ?? 0) + 1);
      }
    const threshold = Math.max(2, Math.ceil(members.length / 2));
    const sharedTerms = [...otherCounts]
      .filter(([, count]) => count >= threshold)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 4)
      .map(([token]) => mostCommonSurface(token, memberSurfaces));
    const intentCounts = new Map<Intent, number>();
    for (const index of members) {
      const intent = keywords[index].intent;
      intentCounts.set(intent, (intentCounts.get(intent) ?? 0) + 1);
    }
    clusters.push({
      id: `cluster-${clusters.length}`,
      label: label.charAt(0).toUpperCase() + label.slice(1),
      anchor: candidate.anchor,
      sharedTerms,
      keywords: members.map((index) => keywords[index]),
      intentMix: [...intentCounts]
        .map(([intent, count]) => ({ intent, count }))
        .sort((a, b) => b.count - a.count || a.intent.localeCompare(b.intent)),
    });
  }
  clusters.sort((a, b) => b.keywords.length - a.keywords.length || a.label.localeCompare(b.label));
  clusters.forEach((cluster, index) => {
    cluster.id = `cluster-${index}`;
  });
  const ungrouped = keywords.filter((_, index) => !assigned.has(index));
  return {
    clusters,
    ungrouped,
    keywordCount: keywords.length,
    groupedCount: keywords.length - ungrouped.length,
    largestGroup: clusters.reduce((max, cluster) => Math.max(max, cluster.keywords.length), 0),
    truncated: clusters.length >= CLUSTER_MAX_GROUPS,
  };
}

/** Per-keyword labels for the studio, derived from the shared clustering engine. */
export function clusterKeywords(items: Omit<Keyword, "cluster">[]): Keyword[] {
  const seeded: Keyword[] = items.map((item) => ({ ...item, cluster: UNGROUPED_LABEL }));
  const { clusters } = buildClusters(seeded);
  const labels = new Map<string, string>();
  for (const cluster of clusters)
    for (const item of cluster.keywords) labels.set(item.id, cluster.label);
  return seeded.map((item) => ({ ...item, cluster: labels.get(item.id) ?? UNGROUPED_LABEL }));
}

/**
 * Studio topic view: groups by the label each phrase already carries, so filtering never
 * re-clusters a subset. Labels come from the shared engine, so they cannot drift apart.
 */
export function groupByCluster(keywords: Keyword[]) {
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
