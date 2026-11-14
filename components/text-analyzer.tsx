"use client";

import { useMemo, useState } from "react";
import {
  AlignLeft,
  ArrowDownToLine,
  BarChart3,
  Clock3,
  FileText,
  RotateCcw,
  Type,
  X,
} from "lucide-react";
import { analyzeText, SAMPLE_TEXT } from "@/lib/analysis";
import { toCsv } from "@/lib/csv";
import { downloadFile, EmptyState, HeuristicNote, PageHeading } from "./ui";
import { useWorkspace } from "./workspace-provider";

export function TextAnalyzer() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [focus, setFocus] = useState("coffee beans");
  const [tab, setTab] = useState<"terms" | "phrases">("terms");
  const { notify } = useWorkspace();
  const analysis = useMemo(() => analyzeText(text, focus), [text, focus]);
  const frequencies = tab === "terms" ? analysis.frequencies : analysis.phrases;
  return (
    <>
      <PageHeading
        eyebrow="MAKE EVERY WORD WORK"
        title="Word frequency counter."
        accent="Read the patterns."
        description="Count words, find repeated terms and two-word phrases, and check a focus phrase. Local text analysis to help you edit—not an SEO score."
      >
        <div className="page-icon-art">
          <AlignLeft size={45} strokeWidth={1.1} />
        </div>
      </PageHeading>
      <div className="analysis-stats">
        <div className="stat-card">
          <span className="stat-label">
            <FileText size={14} />
            Words
          </span>
          <div className="stat-value">
            {analysis.words.toLocaleString()}
            <span className="stat-caption">{analysis.uniqueWords} unique words</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-label">
            <Type size={14} />
            Characters
          </span>
          <div className="stat-value">
            {analysis.characters.toLocaleString()}
            <span className="stat-caption">including spaces</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-label">
            <AlignLeft size={14} />
            Sentences
          </span>
          <div className="stat-value">
            {analysis.sentences}
            <span className="stat-caption">{analysis.paragraphs} paragraphs</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-label">
            <Clock3 size={14} />
            Reading time
          </span>
          <div className="stat-value">
            {analysis.readingMinutes}
            <span className="stat-caption">min · at 225 words/min</span>
          </div>
        </div>
      </div>
      <div className="tool-two-column text-layout">
        <section className="panel text-editor-panel">
          <div className="panel-title">
            <div>
              <h2>Your words, in focus</h2>
              <p>Paste plain text. Analysis updates as you write.</p>
            </div>
            <button
              className="text-button"
              onClick={() => {
                setText(SAMPLE_TEXT);
                setFocus("coffee beans");
              }}
            >
              <RotateCcw size={13} />
              Example
            </button>
          </div>
          <label className="sr-only" htmlFor="analyzer-text">
            Text to analyze
          </label>
          <textarea
            className="analysis-textarea"
            id="analyzer-text"
            value={text}
            maxLength={100000}
            placeholder="Paste your page copy or draft here…"
            onChange={(event) => setText(event.target.value)}
          />
          <div className="editor-bottom">
            <span>Plain text only · up to 100,000 characters</span>
            <button className="text-button" disabled={!text} onClick={() => setText("")}>
              <X size={13} />
              Clear text
            </button>
          </div>
          <div className="focus-phrase">
            <label className="field-label" htmlFor="focus-phrase">
              Focus phrase <span className="optional-label">optional</span>
            </label>
            <input
              className="form-input"
              id="focus-phrase"
              value={focus}
              maxLength={100}
              onChange={(event) => setFocus(event.target.value)}
              placeholder="e.g. coffee beans"
            />
            <div className="focus-results">
              <div>
                <strong>{analysis.focusOccurrences}</strong>
                <span>exact phrase matches</span>
              </div>
              <div>
                <strong>
                  {analysis.focusDensity.toFixed(1)}
                  <small>%</small>
                </strong>
                <span>occurrences ÷ word count</span>
              </div>
              <div>
                <strong>
                  {analysis.focusCoverage.toFixed(1)}
                  <small>%</small>
                </strong>
                <span>phrase token coverage*</span>
              </div>
            </div>
            <p className="field-hint">
              Case-insensitive, whole-token matching. *Coverage includes each word in your phrase;
              overlapping matches may count the same token twice.
            </p>
          </div>
        </section>
        <section className="panel frequency-panel">
          <div className="panel-title">
            <div>
              <h2>The words that show up</h2>
              <p>A frequency snapshot—not an SEO score.</p>
            </div>
            <BarChart3 size={18} className="muted" />
          </div>
          <div
            className="frequency-tabs segmented-control"
            role="group"
            aria-label="Frequency type"
          >
            <button aria-pressed={tab === "terms"} onClick={() => setTab("terms")}>
              Single terms
            </button>
            <button aria-pressed={tab === "phrases"} onClick={() => setTab("phrases")}>
              Two-word phrases
            </button>
          </div>
          {frequencies.length ? (
            <div className="frequency-table">
              <div className="frequency-table-head">
                <span>{tab === "terms" ? "Term" : "Phrase"}</span>
                <span>Count</span>
                <span>Frequency</span>
              </div>
              {frequencies.map(({ phrase, count, density }) => (
                <div className="frequency-row" key={phrase}>
                  <span>{phrase}</span>
                  <span>{count}</span>
                  <div>
                    <span className="frequency-track">
                      <span style={{ width: `${(count / (frequencies[0]?.count || 1)) * 100}%` }} />
                    </span>
                    <span>{density.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FileText size={24} />}
              title="Your words will find their place"
              description="Add some text to see recurring terms. Common English stop words are excluded."
            />
          )}
          <div className="frequency-export">
            <span>Top 15 · common English words excluded</span>
            <button
              className="text-button"
              disabled={!frequencies.length}
              onClick={() => {
                downloadFile(
                  "online-tools-text-frequency.csv",
                  toCsv(
                    ["Term or phrase", "Occurrences", "Occurrences per 100 words"],
                    frequencies.map((item) => [item.phrase, item.count, item.density.toFixed(2)]),
                  ),
                );
                notify("Frequency report exported.");
              }}
            >
              <ArrowDownToLine size={13} />
              Export
            </button>
          </div>
          <HeuristicNote compact>
            There is no ideal keyword density. Write for people; use frequency to notice patterns,
            not to chase a score.
          </HeuristicNote>
        </section>
      </div>
    </>
  );
}
