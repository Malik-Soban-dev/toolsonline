"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpDown,
  Bookmark,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileUp,
  FolderTree,
  Layers3,
  Leaf,
  ListFilter,
  LoaderCircle,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import {
  cleanKeywords,
  clusterSummary,
  DEFAULT_OPTIONS,
  keywordSignature,
  SAMPLE_INPUT,
  type Intent,
  type Keyword,
} from "@/lib/keywords";
import {
  extractColumn,
  keywordColumn,
  MAX_FILE_BYTES,
  MAX_INPUT_CHARS,
  parseCsv,
  type ParsedCsv,
} from "@/lib/csv";
import { useWorkspace } from "./workspace-provider";
import { Dialog, EmptyState, exportKeywords, HeuristicNote, IntentBadge } from "./ui";

const PAGE_SIZE = 8;
const intents: Intent[] = ["Informational", "Commercial", "Transactional", "Unclassified"];

function StudioIllustration() {
  return (
    <div className="studio-art" aria-hidden="true">
      <span className="art-caption">
        <span className="status-dot" /> CLEARER THINKING, BY DESIGN
      </span>
      <svg viewBox="0 0 290 148" fill="none">
        <circle cx="146" cy="79" r="59" stroke="#dce6d5" strokeDasharray="3 6" />
        <circle cx="146" cy="79" r="38" fill="#edf3e8" />
        <path
          d="M68 45C107 45 106 79 146 79M69 119C108 119 109 79 146 79M146 79C184 79 184 38 222 38M146 79C184 79 184 118 222 118"
          stroke="#8da47c"
          strokeWidth="1.3"
        />
        <rect x="19" y="30" width="88" height="30" rx="7" fill="#fff" stroke="#e1e7dc" />
        <path d="M31 41h25m-25 6h40" stroke="#b0b7aa" strokeWidth="2" strokeLinecap="round" />
        <rect x="20" y="104" width="87" height="30" rx="7" fill="#fff" stroke="#e1e7dc" />
        <path d="M31 115h42m-42 6h27" stroke="#b0b7aa" strokeWidth="2" strokeLinecap="round" />
        <rect x="199" y="22" width="72" height="31" rx="7" fill="#e4eddb" stroke="#cdddc1" />
        <rect x="210" y="32" width="10" height="10" rx="2" fill="#789967" />
        <path d="M227 35h28m-28 5h18" stroke="#789967" strokeWidth="2" strokeLinecap="round" />
        <rect x="199" y="103" width="72" height="31" rx="7" fill="#e4eddb" stroke="#cdddc1" />
        <rect x="210" y="114" width="10" height="10" rx="2" fill="#789967" />
        <path d="M227 117h28m-28 5h18" stroke="#789967" strokeWidth="2" strokeLinecap="round" />
        <circle cx="146" cy="79" r="21" fill="#2e523e" />
        <path
          d="m137 79 6 6 12-12"
          stroke="#def0cd"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="155" cy="16" r="3" fill="#c9d8bd" />
        <path d="M120 131v8m-4-4h8" stroke="#8fa47f" strokeWidth="1.3" />
      </svg>
    </div>
  );
}

export function KeywordStudio() {
  const {
    input,
    setInput,
    options,
    setOptions,
    result,
    setResult,
    isExample,
    setIsExample,
    saved,
    saveKeywords,
    notify,
  } = useWorkspace();
  const fileInput = useRef<HTMLInputElement>(null);
  const [upload, setUpload] = useState<(ParsedCsv & { filename: string }) | null>(null);
  const [column, setColumn] = useState(0);
  const [hasHeader, setHasHeader] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [intentFilter, setIntentFilter] = useState("All intents");
  const [clusterFilter, setClusterFilter] = useState("All topics");
  const [view, setView] = useState<"list" | "clusters">("list");
  const [sort, setSort] = useState<"original" | "az" | "za" | "words">("original");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showOptions, setShowOptions] = useState(false);
  const groups = useMemo(() => clusterSummary(result.keywords), [result]);
  const dirty = result.sourceKey !== keywordSignature(input, options);
  const filtered = useMemo(() => {
    let items = result.keywords.filter(
      (item) =>
        item.keyword.toLowerCase().includes(query.toLowerCase()) &&
        (intentFilter === "All intents" || item.intent === intentFilter) &&
        (clusterFilter === "All topics" || item.cluster === clusterFilter),
    );
    if (sort === "az") items = [...items].sort((a, b) => a.keyword.localeCompare(b.keyword));
    if (sort === "za") items = [...items].sort((a, b) => b.keyword.localeCompare(a.keyword));
    if (sort === "words") items = [...items].sort((a, b) => b.words - a.words);
    return items;
  }, [result, query, intentFilter, clusterFilter, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selectedItems = result.keywords.filter((item) => selected.has(item.id));
  const savedSet = new Set(saved.map((item) => item.keyword.toLowerCase()));
  const allVisibleSelected = visible.length > 0 && visible.every((item) => selected.has(item.id));
  const inputLines = input.split(/\r?\n|\r/u).filter((line) => line.trim()).length;

  function resetResults() {
    setSelected(new Set());
    setPage(1);
    setQuery("");
    setIntentFilter("All intents");
    setClusterFilter("All topics");
  }
  function processInput(value = input, example = isExample) {
    setError("");
    setBusy(true);
    // Yield a paint before the local computation, without a fabricated network delay.
    requestAnimationFrame(() => {
      try {
        const next = cleanKeywords(value, options);
        if (!next.keywords.length) {
          setError("Add at least one keyword with letters or numbers, then try again.");
          return;
        }
        setInput(value);
        setResult(next);
        setIsExample(example);
        resetResults();
        notify(
          `${next.keywords.length} keyword${next.keywords.length === 1 ? "" : "s"} organized. ${next.duplicatesRemoved} duplicate${next.duplicatesRemoved === 1 ? "" : "s"} removed.`,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Check your list and try again.",
        );
      } finally {
        setBusy(false);
      }
    });
  }

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    if (file.size > MAX_FILE_BYTES) {
      setError("That file is too large. Choose a CSV or text file under 2 MB.");
      return;
    }
    if (!/\.(csv|tsv|txt)$/i.test(file.name)) {
      setError("Choose a .csv, .tsv, or .txt file.");
      return;
    }
    try {
      const text = await file.text();
      if (/\.txt$/i.test(file.name)) {
        processInput(text, false);
        return;
      }
      const parsed = parseCsv(text, /\.tsv$/i.test(file.name) ? "\t" : undefined);
      const suggested = keywordColumn(parsed.rows);
      setColumn(suggested.column);
      setHasHeader(suggested.hasHeader);
      setUpload({ ...parsed, filename: file.name });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The file could not be read. Try another file.",
      );
    }
  }

  function toggleOne(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleVisible() {
    setSelected((current) => {
      const next = new Set(current);
      for (const item of visible) {
        if (allVisibleSelected) next.delete(item.id);
        else next.add(item.id);
      }
      return next;
    });
  }
  function exportList(items: Keyword[]) {
    if (!items.length) return;
    exportKeywords(items);
    notify(`${items.length} keywords exported. Intent and topic columns are labeled as heuristic.`);
  }
  const shownGroups = clusterSummary(filtered);

  return (
    <>
      <section className="studio-heading">
        <div className="studio-heading-copy">
          <div className="eyebrow">
            <span className="eyebrow-line" />A CALMER WAY TO DO SEO
          </div>
          <h1>
            A little less noise.
            <br />A lot more <em>direction.</em>
          </h1>
          <p>
            Turn a messy keyword list into your next clear move.
            <br className="desktop-break" /> Clean it up, find the connections, and take it from
            here.
          </p>
        </div>
        <StudioIllustration />
      </section>
      <div className="studio-title-row">
        <div>
          <span className="section-icon">
            <Search size={17} />
          </span>
          <h2>Keyword studio</h2>
          <span className="small-badge">FREE TO USE</span>
        </div>
        <span className="subtle-label">
          <ShieldLocal /> Private by default
        </span>
      </div>
      <div className="studio-grid">
        <section className="panel input-panel" aria-labelledby="input-heading">
          <div className="panel-title">
            <div>
              <h3 id="input-heading">Start with your keywords</h3>
              <p>One per line. We’ll handle the housekeeping.</p>
            </div>
            <span className="step-number">01</span>
          </div>
          <div className="input-toolbar">
            <span className={`input-source ${isExample ? "is-example" : ""}`}>
              <span className="status-dot" />
              {isExample ? "Example list · coffee" : "Your keyword list"}
            </span>
            <button
              className="text-button"
              onClick={() => {
                setInput(SAMPLE_INPUT);
                setOptions(DEFAULT_OPTIONS);
                setResult(cleanKeywords(SAMPLE_INPUT));
                setIsExample(true);
                setError("");
                resetResults();
                notify("Coffee example loaded.");
              }}
            >
              <RotateCcw size={12} />
              Use example
            </button>
          </div>
          <label className="sr-only" htmlFor="keyword-input">
            Keyword list, one keyword per line
          </label>
          <textarea
            id="keyword-input"
            className="keyword-textarea"
            spellCheck={false}
            value={input}
            maxLength={MAX_INPUT_CHARS}
            onChange={(event) => {
              setInput(event.target.value);
              setIsExample(false);
              setError("");
            }}
            placeholder={
              "Paste your keywords here…\n\nbest coffee beans\nhow to make cold brew\ncoffee grinder reviews"
            }
            aria-describedby="input-limits"
          />
          <div className="input-count">
            <span>{inputLines.toLocaleString()} lines</span>
            <button
              className="text-button"
              disabled={!input}
              onClick={() => {
                setInput("");
                setResult(cleanKeywords("", options));
                setIsExample(false);
                setError("");
                resetResults();
              }}
            >
              <X size={12} />
              Clear
            </button>
          </div>
          <input
            ref={fileInput}
            type="file"
            className="sr-only"
            accept=".csv,.tsv,.txt"
            onChange={importFile}
            tabIndex={-1}
            aria-label="Choose a keyword file"
          />
          <button className="upload-button" onClick={() => fileInput.current?.click()}>
            <FileUp size={16} />
            <span>Import a CSV or text file</span>
            <Plus size={14} />
          </button>
          <div className="cleaning-options">
            <button
              className="options-toggle"
              aria-expanded={showOptions}
              aria-controls="extra-options"
              onClick={() => setShowOptions(!showOptions)}
            >
              <span>
                <SlidersHorizontal size={14} />
                Cleaning preferences
              </span>
              <ChevronDown size={14} className={showOptions ? "rotate-180" : ""} />
            </button>
            <label className="check-label">
              <input
                type="checkbox"
                checked={options.deduplicate}
                onChange={(event) => setOptions({ ...options, deduplicate: event.target.checked })}
              />
              <span>Remove duplicates</span>
              <span className="recommended-dot" title="Recommended" />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={options.lowercase}
                onChange={(event) => setOptions({ ...options, lowercase: event.target.checked })}
              />
              <span>Convert to lowercase</span>
            </label>
            <div id="extra-options" hidden={!showOptions}>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={options.stripPunctuation}
                  onChange={(event) =>
                    setOptions({ ...options, stripPunctuation: event.target.checked })
                  }
                />
                <span>Replace punctuation with spaces</span>
              </label>
              <p className="option-note">
                Whitespace is always trimmed. Duplicate matching ignores case. Punctuation is
                preserved by default.
              </p>
            </div>
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <button
            className="button button-primary organize-button"
            onClick={() => processInput()}
            disabled={busy || !input.trim()}
          >
            {busy ? <LoaderCircle size={17} className="spin" /> : <WandSparkles size={17} />}
            {busy ? "Organizing locally…" : "Clean & organize"}
            <ArrowRight size={17} />
          </button>
          <p className="input-limits" id="input-limits">
            Up to 5,000 keywords. No uploads to a server.
          </p>
        </section>
        <section className="results-column" aria-labelledby="result-heading">
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-label">
                <Layers3 size={14} />
                Keywords ready
              </span>
              <div className="stat-value">
                {result.keywords.length.toLocaleString()}
                <span className="stat-caption">ready to explore</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-label">
                <CheckCheck size={14} />
                Duplicates removed
              </span>
              <div className="stat-value">
                {result.duplicatesRemoved.toLocaleString()}
                <span className="stat-caption">a cleaner starting point</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-label">
                <FolderTree size={14} />
                Topic groups
              </span>
              <div className="stat-value">
                {groups.length.toLocaleString()}
                <span className="stat-caption">lexically connected</span>
              </div>
            </div>
          </div>
          <div className="panel results-panel">
            <div className="results-heading">
              <div>
                <h3 id="result-heading">
                  A little more organized
                  <span className="number-chip">{result.keywords.length}</span>
                </h3>
                <p>
                  {dirty
                    ? "Your input changed. Run again to refresh these results."
                    : "Your keywords, with a little useful context."}
                </p>
              </div>
              <button
                className="button button-secondary button-small export-button"
                disabled={!filtered.length}
                onClick={() => exportList(selectedItems.length ? selectedItems : filtered)}
              >
                <ArrowDownToLine size={14} />
                <span>Export CSV</span>
              </button>
            </div>
            <div className="results-tabs">
              <div className="segmented-control" role="group" aria-label="Results view">
                <button aria-pressed={view === "list"} onClick={() => setView("list")}>
                  <ListFilter size={14} />
                  Keyword list
                </button>
                <button aria-pressed={view === "clusters"} onClick={() => setView("clusters")}>
                  <FolderTree size={14} />
                  Topic groups<span>{groups.length}</span>
                </button>
              </div>
              <span className="heuristic-tag">
                <span />
                HEURISTIC
              </span>
            </div>
            <div className="result-filters">
              <div className="search-input">
                <Search size={14} />
                <input
                  type="search"
                  placeholder="Find a keyword…"
                  aria-label="Filter keywords"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <label className="select-wrap">
                <span className="sr-only">Filter by intent</span>
                <select
                  value={intentFilter}
                  onChange={(event) => {
                    setIntentFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option>All intents</option>
                  {intents.map((intent) => (
                    <option key={intent}>{intent}</option>
                  ))}
                </select>
                <ChevronDown size={12} />
              </label>
              <label className="select-wrap sort-select">
                <ArrowUpDown size={13} />
                <span className="sr-only">Sort keywords</span>
                <select
                  value={sort}
                  onChange={(event) => {
                    setSort(event.target.value as typeof sort);
                    setPage(1);
                  }}
                >
                  <option value="original">Original</option>
                  <option value="az">A → Z</option>
                  <option value="za">Z → A</option>
                  <option value="words">Most words</option>
                </select>
              </label>
            </div>
            {clusterFilter !== "All topics" && (
              <div className="active-filter">
                Topic: {clusterFilter}
                <button
                  className="icon-button"
                  aria-label="Remove topic filter"
                  onClick={() => setClusterFilter("All topics")}
                >
                  <X size={12} />
                </button>
              </div>
            )}
            {selectedItems.length > 0 && (
              <div className="selection-bar">
                <span>{selectedItems.length} selected</span>
                <button onClick={() => saveKeywords(selectedItems)}>
                  <Bookmark size={13} />
                  Save
                </button>
                <button onClick={() => exportList(selectedItems)}>
                  <ArrowDownToLine size={13} />
                  Export
                </button>
                <button className="selection-clear" onClick={() => setSelected(new Set())}>
                  Deselect
                </button>
              </div>
            )}
            {!filtered.length ? (
              <EmptyState
                icon={<Search size={24} />}
                title={result.keywords.length ? "No matches this time" : "A fresh starting point"}
                description={
                  result.keywords.length
                    ? "Try a different word or clear your filters to see the full picture."
                    : "Add a few keywords on the left, then clean and organize your list."
                }
              >
                {result.keywords.length > 0 && (
                  <button
                    className="button button-secondary button-small"
                    onClick={() => {
                      setQuery("");
                      setIntentFilter("All intents");
                      setClusterFilter("All topics");
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </EmptyState>
            ) : view === "list" ? (
              <>
                <div className="table-scroll">
                  <table className="keyword-table">
                    <caption className="sr-only">
                      Organized keywords. Intent is inferred from English modifiers and is not
                      verified search behavior.
                    </caption>
                    <thead>
                      <tr>
                        <th className="checkbox-cell">
                          <input
                            type="checkbox"
                            aria-label="Select all keywords on this page"
                            checked={allVisibleSelected}
                            onChange={toggleVisible}
                          />
                        </th>
                        <th>
                          Keyword
                          <button
                            className="table-sort"
                            aria-label="Sort keyword alphabetically"
                            onClick={() => setSort(sort === "az" ? "za" : "az")}
                          >
                            <ArrowDown size={11} />
                          </button>
                        </th>
                        <th>
                          Intent{" "}
                          <span title="Rule-based estimate, not verified search intent">
                            <CircleHelp size={11} />
                          </span>
                        </th>
                        <th className="word-cell">Words</th>
                        <th className="save-cell">
                          <span className="sr-only">Save keyword</span>
                          <Bookmark size={12} aria-hidden="true" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((item) => (
                        <tr key={item.id} className={selected.has(item.id) ? "row-selected" : ""}>
                          <td className="checkbox-cell">
                            <input
                              type="checkbox"
                              aria-label={`Select ${item.keyword}`}
                              checked={selected.has(item.id)}
                              onChange={() => toggleOne(item.id)}
                            />
                          </td>
                          <td className="keyword-cell">{item.keyword}</td>
                          <td>
                            <IntentBadge intent={item.intent} />
                          </td>
                          <td className="word-cell">{item.words}</td>
                          <td className="save-cell">
                            <button
                              className={`save-keyword ${savedSet.has(item.keyword.toLowerCase()) ? "saved" : ""}`}
                              aria-label={
                                savedSet.has(item.keyword.toLowerCase())
                                  ? `${item.keyword} is saved`
                                  : `Save ${item.keyword}`
                              }
                              disabled={savedSet.has(item.keyword.toLowerCase())}
                              onClick={() => saveKeywords([item])}
                            >
                              <Bookmark
                                size={15}
                                fill={
                                  savedSet.has(item.keyword.toLowerCase()) ? "currentColor" : "none"
                                }
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="pagination">
                  <span>
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
                    keywords
                  </span>
                  <div>
                    <button
                      className="icon-button"
                      aria-label="Previous keyword page"
                      disabled={currentPage === 1}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <span>
                      {currentPage}
                      <span className="muted"> / {pages}</span>
                    </span>
                    <button
                      className="icon-button"
                      aria-label="Next keyword page"
                      disabled={currentPage >= pages}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="clusters-grid">
                {shownGroups.map((group, index) => (
                  <div className="cluster-card" key={group.name}>
                    <div className="cluster-card-heading">
                      <span className={`cluster-dot cluster-dot-${index % 4}`} />
                      <h4>{group.name}</h4>
                      <span>{group.items.length}</span>
                    </div>
                    <ul>
                      {group.items.slice(0, 4).map((item) => (
                        <li key={item.id}>{item.keyword}</li>
                      ))}
                    </ul>
                    <div className="cluster-actions">
                      <button
                        onClick={() => {
                          setClusterFilter(group.name);
                          setView("list");
                          setPage(1);
                        }}
                      >
                        Explore group
                        <ArrowRight size={12} />
                      </button>
                      <button
                        className="icon-button"
                        onClick={() => saveKeywords(group.items)}
                        aria-label={`Save ${group.name} group`}
                      >
                        <Bookmark size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <HeuristicNote compact>
              Topics use shared words. Intent uses English modifiers—not live search data.
            </HeuristicNote>
          </div>
          <div className="next-step-note">
            <span className="next-step-icon">
              <Sparkles size={17} />
            </span>
            <div>
              <strong>A good list is just the beginning.</strong>
              <span>Try a fresh angle with rule-based keyword ideas.</span>
            </div>
            <Link href="/keyword-ideas/" aria-label="Explore keyword ideas">
              <ArrowRight size={19} />
            </Link>
          </div>
        </section>
      </div>
      <section className="honest-tools-strip">
        <div>
          <span className="strip-icon">
            <Leaf size={19} strokeWidth={1.5} />
          </span>
          <div>
            <h3>Useful tools. Honest limits.</h3>
            <p>No made-up search volumes. No mystery scores. Just a clearer place to start.</p>
          </div>
        </div>
        <Link href="/methodology/">
          Meet the methodology <ArrowRight size={14} />
        </Link>
      </section>
      <Dialog
        open={Boolean(upload)}
        onClose={() => setUpload(null)}
        title="Bring your keywords in"
        description="Choose the keyword column. Other columns, including any supplied metrics, are ignored. Your file stays on this device."
      >
        {upload && (
          <>
            <div className="import-file-label">
              <FileUp size={17} />
              <span>{upload.filename}</span>
              <span>{upload.rows.length} rows</span>
            </div>
            <label className="field-label" htmlFor="import-column">
              Keyword column
            </label>
            <select
              className="form-input"
              id="import-column"
              value={column}
              onChange={(event) => setColumn(Number(event.target.value))}
            >
              {Array.from(
                { length: upload.rows.reduce((maximum, row) => Math.max(maximum, row.length), 0) },
                (_, index) => (
                  <option key={index} value={index}>
                    Column {index + 1}
                    {hasHeader ? ` · ${upload.rows[0][index] || "Untitled"}` : ""}
                  </option>
                ),
              )}
            </select>
            <label className="check-label import-header-check">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(event) => setHasHeader(event.target.checked)}
              />
              First row contains column names
            </label>
            <div className="import-preview">
              <span className="eyebrow">A QUICK PREVIEW</span>
              {upload.rows.slice(hasHeader ? 1 : 0, hasHeader ? 5 : 4).map((row, index) => (
                <div key={index}>{row[column]?.trim() || <em>Empty cell — skipped</em>}</div>
              ))}
            </div>
            <div className="dialog-actions">
              <button className="button button-secondary" onClick={() => setUpload(null)}>
                Cancel
              </button>
              <button
                className="button button-primary"
                onClick={() => {
                  try {
                    const keywords = extractColumn(upload.rows, column, hasHeader);
                    if (!keywords.length) {
                      notify("That column has no keywords. Choose a different column.", "info");
                      return;
                    }
                    processInput(
                      keywords.map((value) => value.replace(/\s+/gu, " ").trim()).join("\n"),
                      false,
                    );
                    setUpload(null);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Import failed.");
                    setUpload(null);
                  }
                }}
              >
                Import & organize
                <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}

function ShieldLocal() {
  return (
    <span className="privacy-dot" aria-hidden="true">
      <Check size={9} strokeWidth={2.5} />
    </span>
  );
}
