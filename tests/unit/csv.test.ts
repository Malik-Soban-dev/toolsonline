import { describe, expect, it } from "vitest";
import {
  csvCell,
  detectDelimiter,
  extractColumn,
  keywordColumn,
  MAX_INPUT_CHARS,
  parseCsv,
  toCsv,
} from "../../lib/csv";

describe("CSV parsing", () => {
  it("handles headers, CRLF, and a UTF-8 BOM", () => {
    expect(parseCsv("\uFEFFKeyword,Note\r\ncoffee,example\r\ntea,other").rows).toEqual([
      ["Keyword", "Note"],
      ["coffee", "example"],
      ["tea", "other"],
    ]);
  });
  it("handles quoted commas, doubled quotes, and multiline cells", () => {
    expect(
      parseCsv('Keyword,Note\n"coffee, beans","say ""hello"""\n"cold\nbrew",yes').rows,
    ).toEqual([
      ["Keyword", "Note"],
      ["coffee, beans", 'say "hello"'],
      ["cold\nbrew", "yes"],
    ]);
  });
  it("detects tabs and semicolons, but not separators inside quotes", () => {
    expect(detectDelimiter("keyword\tnote\ncoffee\tbeans")).toBe("\t");
    expect(detectDelimiter("keyword;note\ncoffee;beans")).toBe(";");
    expect(detectDelimiter('"hello, this, is, quoted";note')).toBe(";");
  });
  it("rejects pathological column counts", () =>
    expect(() => parseCsv(Array(101).fill("column").join(","))).toThrow("100 columns"));
  it("keeps zero and skips empty rows", () => {
    expect(parseCsv("keyword\n\n0\n \ncoffee\n").rows).toEqual([["keyword"], ["0"], ["coffee"]]);
  });
  it("accepts whitespace after a closed quote", () =>
    expect(parseCsv('"coffee" ,tea').rows[0]).toEqual(["coffee", "tea"]));
  it("rejects malformed quote endings", () =>
    expect(() => parseCsv('"coffee"oops,tea')).toThrow("unexpected text"));
  it("rejects unterminated quotes", () =>
    expect(() => parseCsv('keyword\n"unclosed')).toThrow("not closed"));
  it("rejects empty input", () => expect(() => parseCsv("\n \n")).toThrow("empty"));
  it("rejects oversized input", () =>
    expect(() => parseCsv("a".repeat(MAX_INPUT_CHARS + 1))).toThrow("too large"));
  it("rejects more than 5,000 rows plus one possible header", () =>
    expect(() =>
      parseCsv(Array.from({ length: 5002 }, (_, i) => `keyword${i}`).join("\n")),
    ).toThrow("5,000"));
  it("maps recognized headers without guessing metrics", () => {
    const rows = [
      ["Volume", "Search term", "CPC"],
      ["22", "coffee", "1"],
    ];
    expect(keywordColumn(rows)).toEqual({ column: 1, hasHeader: true });
    expect(extractColumn(rows, 1, true)).toEqual(["coffee"]);
  });
  it("defaults to no header for unrecognized first rows", () =>
    expect(keywordColumn([["coffee", "42"]])).toEqual({ column: 0, hasHeader: false }));
  it("skips empty and missing cells in a chosen column", () =>
    expect(
      extractColumn([["header", "Keyword"], ["x", "coffee"], ["x"], ["x", " "]], 1, true),
    ).toEqual(["coffee"]));
  it("enforces keyword row limits independently from headers", () =>
    expect(() =>
      extractColumn(
        Array.from({ length: 5001 }, () => ["coffee"]),
        0,
        false,
      ),
    ).toThrow("5,000"));
});

describe("CSV export safety", () => {
  it.each(["=SUM(A1:A2)", "+cmd", "-cmd", "@calc", "  =1+1", "\t=1+1", "\rtext"])(
    "neutralizes spreadsheet expression %j",
    (value) => expect(csvCell(value)).toContain(`'${value}`),
  );
  it("escapes commas, quotes, and line breaks", () =>
    expect(csvCell('coffee, "beans"\nline')).toBe('"coffee, ""beans""\nline"'));
  it("emits a BOM and stable CRLF rows", () =>
    expect(toCsv(["Keyword"], [["coffee"]])).toBe('\uFEFF"Keyword"\r\n"coffee"'));
  it("does not alter safe keyword text", () =>
    expect(csvCell("coffee beans")).toBe('"coffee beans"'));
});
