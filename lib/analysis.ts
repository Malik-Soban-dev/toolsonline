import { tokenize } from "./keywords";

const COMMON_WORDS = new Set(
  "a an the and or but for from to of in on at by with is are was were be been being it its this that these those i you he she we they my your our their as not no so if can will do does have has had into about than then also more most very just".split(
    " ",
  ),
);

export function analyzeText(text: string, focus = "") {
  const tokens = tokenize(text);
  const meaningfulTokens = tokens.filter((token) => !COMMON_WORDS.has(token));
  const frequencies = new Map<string, number>();
  for (const word of meaningfulTokens) frequencies.set(word, (frequencies.get(word) ?? 0) + 1);
  const phrases = new Map<string, number>();
  // Build phrases from original adjacent tokens, never across removed stop words.
  for (let i = 0; i < tokens.length - 1; i++) {
    if (!COMMON_WORDS.has(tokens[i]) && !COMMON_WORDS.has(tokens[i + 1])) {
      const phrase = `${tokens[i]} ${tokens[i + 1]}`;
      phrases.set(phrase, (phrases.get(phrase) ?? 0) + 1);
    }
  }
  const sentences = text.trim() ? (text.match(/[^.!?\n]+[.!?]+|[^.!?\n]+$/gm) ?? []).length : 0;
  const focusTokens = tokenize(focus);
  let focusOccurrences = 0;
  if (focusTokens.length) {
    for (let i = 0; i <= tokens.length - focusTokens.length; i++) {
      if (focusTokens.every((word, j) => tokens[i + j] === word)) focusOccurrences++;
    }
  }
  const sorted = (map: Map<string, number>) =>
    [...map.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 15)
      .map(([phrase, count]) => ({
        phrase,
        count,
        density: tokens.length ? (count / tokens.length) * 100 : 0,
      }));
  return {
    words: tokens.length,
    characters: [...text].length,
    charactersNoSpaces: [...text.replace(/\s/gu, "")].length,
    sentences,
    paragraphs: text.trim() ? text.trim().split(/\n\s*\n/u).length : 0,
    readingMinutes: tokens.length ? Math.max(1, Math.ceil(tokens.length / 225)) : 0,
    uniqueWords: new Set(tokens).size,
    frequencies: sorted(frequencies),
    phrases: sorted(phrases),
    focusOccurrences,
    focusDensity: tokens.length ? (focusOccurrences / tokens.length) * 100 : 0,
    focusCoverage: tokens.length
      ? ((focusOccurrences * focusTokens.length) / tokens.length) * 100
      : 0,
  };
}

export const SAMPLE_TEXT =
  "Better coffee starts with a little curiosity. Fresh coffee beans, a consistent grind, and clean water can make a noticeable difference in your cup.\n\nChoose coffee beans that suit the way you brew. For espresso, try a balanced medium roast. For pour over coffee, a lighter roast can bring out delicate flavors. Store your coffee beans in an airtight container, away from heat and sunlight.\n\nYou do not need a complicated setup to enjoy better coffee. Start with a simple recipe, change one thing at a time, and let your taste guide you.";

export function characterCount(text: string) {
  return [...text].length;
}

/** Approximate Latin glyph widths at desktop search-result font sizes. Not Google's rendering engine. */
export function estimatePixels(text: string, fontSize = 20): number {
  let units = 0;
  for (const char of text) {
    if (/[ilI1.,'!:;|]/u.test(char)) units += 0.25;
    else if (/[MW@%&]/u.test(char)) units += 0.88;
    else if (/\s/u.test(char)) units += 0.28;
    else if (/[^\u0000-\u024f]/u.test(char)) units += 1;
    else if (/[A-Z]/u.test(char)) units += 0.64;
    else units += 0.5;
  }
  return Math.round(units * fontSize);
}

export function normalizePreviewUrl(input: string): { host: string; path: string; valid: boolean } {
  if (!input.trim()) return { host: "example.com", path: "", valid: true };
  try {
    const value = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    const url = new URL(value);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      !url.hostname.includes(".") ||
      /\s/.test(input)
    )
      throw new Error();
    let decoded: string;
    try {
      decoded = decodeURIComponent(url.pathname);
    } catch {
      decoded = url.pathname;
    }
    return {
      host: url.hostname,
      path: decoded.split("/").filter(Boolean).join(" › "),
      valid: true,
    };
  } catch {
    return { host: "example.com", path: "", valid: false };
  }
}

export function escapeHtml(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
  );
}

export function metaMarkup(title: string, description: string): string {
  return `<title>${escapeHtml(title)}</title>\n<meta name="description" content="${escapeHtml(description)}">`;
}

export function titleIdeas(topic: string, brand: string): string[] {
  const subject = topic.trim().replace(/\s+/gu, " ");
  if (!subject) return [];
  const suffix = brand.trim() ? ` | ${brand.trim()}` : "";
  return [
    `${subject}: A Practical Guide${suffix}`,
    `How to Choose ${subject}${suffix}`,
    `${subject} for Beginners${suffix}`,
    `${subject}: What to Know Before You Start${suffix}`,
  ];
}

export function descriptionIdeas(topic: string, benefit: string): string[] {
  const subject = topic.trim().replace(/\s+/gu, " ");
  if (!subject) return [];
  const value = benefit.trim().replace(/[.!?]+$/u, "") || "make a more informed choice";
  const lowerBenefit = value.charAt(0).toLowerCase() + value.slice(1);
  return [
    `Explore ${subject.toLowerCase()} with practical advice to help you ${lowerBenefit}. Start with the essentials, compare your options, and find your next step.`,
    `Looking for a clearer guide to ${subject.toLowerCase()}? Learn what matters, avoid common mistakes, and ${lowerBenefit}.`,
    `Get to know ${subject.toLowerCase()}: useful tips, thoughtful comparisons, and a simple starting point to help you ${lowerBenefit}.`,
  ];
}
