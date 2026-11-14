"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  Copy,
  FileUp,
  Group,
  LoaderCircle,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import {
  buildClusters,
  cleanKeywords,
  DEFAULT_CLUSTER_OPTIONS,
  keywordSignature,
  type CleanResult,
  type Cluster,
  type ClusterOptions,
  type Keyword,
} from "@/lib/keywords";
import {
  extractColumn,
  keywordColumn,
  MAX_FILE_BYTES,
  MAX_INPUT_CHARS,
  parseCsv,
  toCsv,
  type ParsedCsv,
} from "@/lib/csv";
import { useWorkspace } from "./workspace-provider";
import {
  CopyButton,
  Dialog,
  downloadFile,
  EmptyState,
  HeuristicNote,
  IntentBadge,
  PageHeading,
} from "./ui";

const VISIBLE_MEMBERS = 6;
const CLEANING_OPTIONS = { lowercase: true, deduplicate: true, stripPunctuation: false };

// A list that shows several groups, one leftover phrase, and a word too common to anchor a group.
const SAMPLE_CLUSTER_INPUT = `best coffee beans
coffee beans for espresso
how to store coffee beans
organic coffee beans
coffee grinder reviews
best coffee grinder
manual coffee grinder
how to clean a coffee grinder
cold brew ratio
cold brew coffee recipe
cold brew maker
best cold brew maker
pour over coffee kit
best pour over coffee maker
espresso machine cleaning
`;

function sharedWording(cluster: Cluster): string {
  return [cluster.label.toLowerCase(), ...cluster.sharedTerms].join(", ");
}

function exportRows(clusters: Cluster[], ungrouped: Keyword[], filename: string) {
  const rows: unknown[][] = [];
  for (const cluster of clusters)
    for (const item of cluster.keywords)
      rows.push([item.keyword, cluster.label, sharedWording(cluster), item.intent, item.words]);
  for (const item of ungrouped)
    rows.push([item.keyword, "Needs review", "", item.intent, item.words]);
  downloadFile(
    filename,
    toCsv(
      [
        "Keyword",
        "Cluster (lexical)",
        "Shared wording (heuristic)",
        "Intent (heuristic)",
        "Word count",
      ],
      rows,
    ),
  );
}

export function KeywordClusters() {
  const {
    input,
    result: studioResult,
    options,
    setInput,
    setResult: setStudioResult,
    setIsExample,
    saved,
    saveKeywords,
    notify,
  } = useWorkspace();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(SAMPLE_CLUSTER_INPUT);
  const [source, setSource] = useState<"example" | "studio" | "own">("example");
  const [result, setResult] = useState<CleanResult>(() => cleanKeywords(SAMPLE_CLUSTER_INPUT));
  const [clusterOptions, setClusterOptions] = useState<ClusterOptions>(DEFAULT_CLUSTER_OPTIONS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [upload, setUpload] = useState<(ParsedCsv & { filename: string }) | null>(null);
  const [column, setColumn] = useState(0);
  const [hasHeader, setHasHeader] = useState(true);

  const grouped = useMemo(
    () => buildClusters(result.keywords, clusterOptions),
    [result, clusterOptions],
  );
  const pending = result.sourceKey !== keywordSignature(text, CLEANING_OPTIONS);
  const savedSet = new Set(saved.map((item) => item.keyword.toLowerCase()));
  const lines = text.split(/\r?\n|\r/u).filter((line) => line.trim()).length;
  const filteredClusters = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return grouped.clusters;
    return grouped.clusters
      .map((cluster) => ({
        ...cluster,
        keywords: cluster.keywords.filter(
          (item) =>
            item.keyword.toLowerCase().includes(needle) ||
            cluster.label.toLowerCase().includes(needle),
        ),
      }))
      .filter((cluster) => cluster.keywords.length > 0);
  }, [grouped, query]);
  const filteredUngrouped = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return grouped.ungrouped;
    return grouped.ungrouped.filter((item) => item.keyword.toLowerCase().includes(needle));
  }, [grouped, query]);
  const visibleCount = filteredClusters.reduce(
    (total, cluster) => total + cluster.keywords.length,
    0,
  );

  function groupKeywords(value = text) {
    setError("");
    setBusy(true);
    // Yield a paint before the local computation, without a fabricated network delay.
    requestAnimationFrame(() => {
      try {
        const next = cleanKeywords(value, CLEANING_OPTIONS);
        if (!next.keywords.length) {
          setError("Add at least one keyword with letters or numbers, then try again.");
          return;
        }
        setResult(next);
        setText(value);
        setExpanded(new Set());
        setQuery("");
        notify(
          `${next.keywords.length} phrase${next.keywords.length === 1 ? "" : "s"} grouped into ${buildClusters(next.keywords, clusterOptions).clusters.length} shared-word cluster${buildClusters(next.keywords, clusterOptions).clusters.length === 1 ? "" : "s"}.`,
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
      const contents = await file.text();
      if (/\.txt$/i.test(file.name)) {
        setText(contents);
        setSource("own");
        groupKeywords(contents);
        return;
      }
      const parsed = parseCsv(contents, /\.tsv$/i.test(file.name) ? "\t" : undefined);
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

  function toggleExpanded(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openInStudio(items: Keyword[], label: string) {
    try {
      const nextInput = items.map((item) => item.keyword).join("\n");
      setInput(nextInput);
      setStudioResult(cleanKeywords(nextInput, options));
      setIsExample(false);
      router.push("/");
      notify(
        `Studio list replaced with ${items.length} phrase${items.length === 1 ? "" : "s"} from “${label}”.`,
      );
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "Could not open this group in the studio.",
        "info",
      );
    }
  }

  return (
    <>
      <PageHeading
        eyebrow="GROUP WHAT BELONGS TOGETHER"
        title="Keyword clustering."
        accent="by shared wording."
        description="Group a keyword list into clusters by the words and two-word phrases your phrases share. See the wording behind each group, and keep a review list for what doesn’t fit."
      >
        <div className="page-icon-art">
          <Group size={46} strokeWidth={1} />
          <span className="art-spark art-spark-one">+</span>
          <span className="art-spark art-spark-two">+</span>
        </div>
      </PageHeading>
      <div className="tool-two-column clusters-layout">
        <section className="panel cluster-input-panel" aria-labelledby="cluster-input-heading">
          <div className="panel-title">
            <div>
              <h2 id="cluster-input-heading">Your keyword list</h2>
              <p>One phrase per line. Duplicates are removed, then shared wording is grouped.</p>
            </div>
            <span className="step-number">01</span>
          </div>
          <div className="input-toolbar">
            <span className={`input-source ${source === "example" ? "is-example" : ""}`}>
              <span className="status-dot" />
              {source === "example"
                ? "Example list · coffee"
                : source === "studio"
                  ? "From your keyword studio"
                  : "Your keyword list"}
            </span>
            <button
              className="text-button"
              onClick={() => {
                setText(SAMPLE_CLUSTER_INPUT);
                setSource("example");
                setResult(cleanKeywords(SAMPLE_CLUSTER_INPUT, CLEANING_OPTIONS));
                setError("");
                setExpanded(new Set());
                setQuery("");
                notify("Coffee example loaded.");
              }}
            >
              <RotateCcw size={12} />
              Use example
            </button>
            {studioResult.keywords.length > 0 && (
              <button
                className="text-button"
                onClick={() => {
                  const studioList =
                    input.trim() || studioResult.keywords.map((item) => item.keyword).join("\n");
                  setText(studioList);
                  setSource("studio");
                  setResult(cleanKeywords(studioList, CLEANING_OPTIONS));
                  setError("");
                  setExpanded(new Set());
                  setQuery("");
                  notify("Your studio list is ready to group.");
                }}
              >
                <ArrowRight size={12} />
                Use studio list
              </button>
            )}
          </div>
          <label className="sr-only" htmlFor="cluster-input">
            Keyword list to cluster, one keyword per line
          </label>
          <textarea
            id="cluster-input"
            className="keyword-textarea"
            spellCheck={false}
            value={text}
            maxLength={MAX_INPUT_CHARS}
            onChange={(event) => {
              setText(event.target.value);
              setSource("own");
              setError("");
            }}
            placeholder={
              "Paste your keywords here…\n\nbest coffee beans\ncoffee grinder reviews\ncold brew ratio"
            }
            aria-describedby="cluster-input-limits"
          />
          <div className="input-count">
            <span>{lines.toLocaleString()} lines</span>
            <button
              className="text-button"
              disabled={!text}
              onClick={() => {
                setText("");
                setSource("own");
                setResult(cleanKeywords("", CLEANING_OPTIONS));
                setError("");
                setExpanded(new Set());
                setQuery("");
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
            aria-label="Choose a keyword file to cluster"
          />
          <button className="upload-button" onClick={() => fileInput.current?.click()}>
            <FileUp size={16} />
            <span>Import a CSV or text file</span>
            <Plus size={14} />
          </button>
          <div className="cluster-settings">
            <label className="field-label" htmlFor="cluster-rule">
              Shared wording rule
            </label>
            <label className="select-wrap">
              <select
                id="cluster-rule"
                value={clusterOptions.minSharedWords}
                onChange={(event) =>
                  setClusterOptions({
                    ...clusterOptions,
                    minSharedWords: Number(event.target.value) as ClusterOptions["minSharedWords"],
                  })
                }
              >
                <option value={1}>Any shared word</option>
                <option value={2}>A shared two-word phrase</option>
              </select>
              <ChevronDown size={12} />
            </label>
            <label className="field-label" htmlFor="cluster-min-size">
              Smallest group
            </label>
            <label className="select-wrap">
              <select
                id="cluster-min-size"
                value={clusterOptions.minSize}
                onChange={(event) =>
                  setClusterOptions({ ...clusterOptions, minSize: Number(event.target.value) })
                }
              >
                <option value={2}>2 keywords</option>
                <option value={3}>3 keywords</option>
                <option value={4}>4 keywords</option>
              </select>
              <ChevronDown size={12} />
            </label>
            <p className="field-hint">
              A word appearing in almost every phrase is too common to anchor a group. Phrases join
              their most specific matching group, so each one appears once.
            </p>
          </div>
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <button
            className="button button-primary organize-button"
            onClick={() => groupKeywords()}
            disabled={busy || !text.trim()}
          >
            {busy ? <LoaderCircle size={17} className="spin" /> : <Group size={17} />}
            {busy ? "Grouping locally…" : "Group keywords"}
            <ArrowRight size={17} />
          </button>
          <p className="input-limits" id="cluster-input-limits">
            Up to 5,000 keywords. Grouping runs on this device, not on a server.
          </p>
        </section>

        <section className="panel cluster-results" aria-labelledby="cluster-results-heading">
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-label">
                <Group size={14} />
                Clusters
              </span>
              <div className="stat-value">
                {grouped.clusters.length.toLocaleString()}
                <span className="stat-caption">from shared wording</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-label">
                <Check size={14} />
                Phrases grouped
              </span>
              <div className="stat-value">
                {grouped.groupedCount.toLocaleString()}
                <span className="stat-caption">of {grouped.keywordCount.toLocaleString()}</span>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-label">
                <Search size={14} />
                Needs review
              </span>
              <div className="stat-value">
                {grouped.ungrouped.length.toLocaleString()}
                <span className="stat-caption">no shared wording</span>
              </div>
            </div>
          </div>
          <div className="results-heading">
            <div>
              <h2 id="cluster-results-heading">
                Groups from shared wording
                <span className="number-chip">{grouped.clusters.length}</span>
              </h2>
              <p>
                {pending
                  ? "Your list changed. Group it again to refresh these results."
                  : `${grouped.groupedCount} of ${grouped.keywordCount} phrases grouped · largest group ${grouped.largestGroup}.`}
              </p>
            </div>
            <button
              className="button button-secondary button-small"
              disabled={!grouped.keywordCount}
              onClick={() => {
                exportRows(
                  grouped.clusters,
                  grouped.ungrouped,
                  "online-tools-keyword-clusters.csv",
                );
                notify("Clusters exported. Cluster names are lexical, not market data.");
              }}
            >
              <ArrowDownToLine size={14} />
              <span>Export CSV</span>
            </button>
          </div>
          <div className="cluster-filter-row">
            <div className="search-input">
              <Search size={14} />
              <input
                type="search"
                placeholder="Find a keyword or group…"
                aria-label="Filter clustered keywords"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <span className="heuristic-tag">
              <span />
              HEURISTIC
            </span>
          </div>
          {!grouped.keywordCount ? (
            <EmptyState
              icon={<Group size={24} />}
              title="A list waiting to be grouped"
              description="Add a few keywords on the left, then group them by the wording they share."
            >
              <button
                className="button button-secondary button-small"
                onClick={() => {
                  setText(SAMPLE_CLUSTER_INPUT);
                  setSource("example");
                  setResult(cleanKeywords(SAMPLE_CLUSTER_INPUT, CLEANING_OPTIONS));
                }}
              >
                Use the coffee example
              </button>
            </EmptyState>
          ) : !visibleCount && !filteredUngrouped.length ? (
            <EmptyState
              icon={<Search size={24} />}
              title="No matches this time"
              description="Try a different word, or clear the filter to see every group."
            >
              <button className="button button-secondary button-small" onClick={() => setQuery("")}>
                Clear filter
              </button>
            </EmptyState>
          ) : (
            <div className="cluster-result-list">
              {filteredClusters.map((cluster, index) => {
                const open = expanded.has(cluster.id);
                const members = open
                  ? cluster.keywords
                  : cluster.keywords.slice(0, VISIBLE_MEMBERS);
                return (
                  <article className="cluster-result-card" key={cluster.id}>
                    <div className="cluster-result-heading">
                      <span className={`cluster-dot cluster-dot-${index % 4}`} />
                      <h3>{cluster.label}</h3>
                      <span className="cluster-size">
                        {cluster.keywords.length} keyword{cluster.keywords.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <p className="cluster-shared">
                      <span className="eyebrow">SHARED WORDING</span>
                      {sharedWording(cluster)}
                    </p>
                    {cluster.intentMix.length > 0 && (
                      <div className="cluster-intents">
                        {cluster.intentMix.map(({ intent, count }) => (
                          <span className="cluster-intent" key={intent}>
                            <IntentBadge intent={intent} />
                            {count}
                          </span>
                        ))}
                      </div>
                    )}
                    <ul className="cluster-members">
                      {members.map((item) => (
                        <li key={item.id}>{item.keyword}</li>
                      ))}
                    </ul>
                    {cluster.keywords.length > VISIBLE_MEMBERS && (
                      <button
                        className="text-button cluster-more"
                        aria-expanded={open}
                        onClick={() => toggleExpanded(cluster.id)}
                      >
                        {open ? "Show fewer" : `Show all ${cluster.keywords.length} keywords`}
                        <ChevronDown size={12} className={open ? "rotate-180" : ""} />
                      </button>
                    )}
                    <div className="cluster-card-actions">
                      <CopyButton
                        text={cluster.keywords.map((item) => item.keyword).join("\n")}
                        className="text-button"
                      >
                        <Copy size={13} />
                        Copy group
                      </CopyButton>
                      <button
                        className="text-button"
                        onClick={() => {
                          saveKeywords(cluster.keywords);
                        }}
                      >
                        <Bookmark size={13} />
                        Save group
                      </button>
                      <button
                        className="text-button"
                        onClick={() =>
                          exportRows([cluster], [], "online-tools-keyword-clusters.csv")
                        }
                      >
                        <ArrowDownToLine size={13} />
                        Export group
                      </button>
                      <button
                        className="text-button"
                        onClick={() => openInStudio(cluster.keywords, cluster.label)}
                      >
                        <ArrowRight size={13} />
                        Open in studio
                      </button>
                    </div>
                  </article>
                );
              })}
              {filteredUngrouped.length > 0 && (
                <article className="cluster-result-card cluster-review-card">
                  <div className="cluster-result-heading">
                    <span className="cluster-dot cluster-dot-3" />
                    <h3>Needs review</h3>
                    <span className="cluster-size">
                      {filteredUngrouped.length} keyword
                      {filteredUngrouped.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="cluster-shared">
                    <span className="eyebrow">WHY HERE</span>
                    No wording shared with at least {clusterOptions.minSize} other phrases in this
                    list.
                  </p>
                  <ul className="cluster-members">
                    {filteredUngrouped.map((item) => (
                      <li key={item.id}>{item.keyword}</li>
                    ))}
                  </ul>
                  <div className="cluster-card-actions">
                    <CopyButton
                      text={filteredUngrouped.map((item) => item.keyword).join("\n")}
                      className="text-button"
                    >
                      <Copy size={13} />
                      Copy list
                    </CopyButton>
                    <button className="text-button" onClick={() => saveKeywords(filteredUngrouped)}>
                      <Bookmark size={13} />
                      Save list
                    </button>
                  </div>
                </article>
              )}
              {savedSet.size > 0 && (
                <p className="cluster-saved-note">
                  <Check size={13} />
                  Saved keywords live in your browser-only <Link href="/saved/">collection</Link>.
                </p>
              )}
            </div>
          )}
          <HeuristicNote>
            These clusters come from shared wording in your own list. No search volume, SERP
            overlap, autocomplete, or semantic AI is involved.
          </HeuristicNote>
        </section>
      </div>
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
            <label className="field-label" htmlFor="cluster-import-column">
              Keyword column
            </label>
            <select
              className="form-input"
              id="cluster-import-column"
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
                    const next = keywords
                      .map((value) => value.replace(/\s+/gu, " ").trim())
                      .join("\n");
                    setText(next);
                    setSource("own");
                    setUpload(null);
                    groupKeywords(next);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Import failed.");
                    setUpload(null);
                  }
                }}
              >
                Import & group
                <ArrowRight size={15} />
              </button>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
}
