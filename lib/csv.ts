export const MAX_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_ROWS = 5000;
export const MAX_COLUMNS = 100;
export const MAX_INPUT_CHARS = 500_000;

export type ParsedCsv = { rows: string[][]; delimiter: string };

/** RFC 4180-style parser; supports BOM, quoted line breaks, escaped quotes, tabs and semicolons. */
export function parseCsv(input: string, delimiter?: string): ParsedCsv {
  if (input.length > MAX_INPUT_CHARS)
    throw new Error("This file is too large. Use up to 500,000 characters.");
  const text = input.replace(/^\uFEFF/, "");
  const separator = delimiter ?? detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let afterQuote = false;

  function finishRow() {
    row.push(field);
    if (row.length > MAX_COLUMNS) throw new Error("Use a CSV with no more than 100 columns.");
    if (row.some((value) => value.trim())) rows.push(row);
    if (rows.length > MAX_ROWS + 1)
      throw new Error("Use a file with no more than 5,000 keyword rows.");
    row = [];
    field = "";
    afterQuote = false;
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
          afterQuote = true;
        }
      } else field += char;
    } else if (char === '"' && !field.trim() && !afterQuote) {
      field = "";
      quoted = true;
    } else if (char === separator) {
      row.push(field);
      if (row.length >= MAX_COLUMNS) throw new Error("Use a CSV with no more than 100 columns.");
      field = "";
      afterQuote = false;
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      finishRow();
    } else {
      if (afterQuote && !/\s/.test(char))
        throw new Error(
          "A quoted field has unexpected text after its closing quote. Check the CSV formatting.",
        );
      if (!afterQuote) field += char;
    }
  }
  if (quoted) throw new Error("A quoted field is not closed. Check the CSV and try again.");
  if (field || row.length) finishRow();
  if (!rows.length) throw new Error("This file is empty. Add at least one keyword and try again.");
  return { rows, delimiter: separator };
}

export function detectDelimiter(text: string): string {
  const counts: Record<string, number> = { ",": 0, "\t": 0, ";": 0 };
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') i++;
      else quoted = !quoted;
    }
    if (!quoted && (char === "\n" || char === "\r")) break;
    if (!quoted && char in counts) counts[char]++;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

/** Neutralize spreadsheet formulas. Exported content is untrusted user input, not executable cells. */
export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  if (/^[\s\u0000-\u001f]*[=+@-]/u.test(text) || /^[\t\r]/u.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(headers: string[], rows: unknown[][]): string {
  return "\uFEFF" + [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function keywordColumn(rows: string[][]): { column: number; hasHeader: boolean } {
  const index =
    rows[0]?.findIndex((cell) =>
      /^(keywords?|search[ _-]?terms?|queries|query|phrase)$/i.test(cell.trim()),
    ) ?? -1;
  return { column: Math.max(0, index), hasHeader: index >= 0 };
}

export function extractColumn(rows: string[][], column: number, hasHeader: boolean): string[] {
  const values = rows
    .slice(hasHeader ? 1 : 0)
    .map((row) => row[column] ?? "")
    .filter((value) => value.trim());
  if (values.length > MAX_ROWS) throw new Error("Use no more than 5,000 keywords at a time.");
  return values;
}
