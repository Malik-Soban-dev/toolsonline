"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowRight,
  Bookmark,
  Check,
  Lightbulb,
  Plus,
  Sparkles,
} from "lucide-react";
import { cleanKeywords, generateSuggestions, type Suggestion } from "@/lib/keywords";
import { useWorkspace } from "./workspace-provider";
import { exportKeywords, HeuristicNote, IntentBadge, PageHeading } from "./ui";

export function KeywordIdeas() {
  const { input, setInput, options, setResult, setIsExample, saveKeywords, saved, notify } =
    useWorkspace();
  const router = useRouter();
  const [seed, setSeed] = useState("coffee beans");
  const [activeSeed, setActiveSeed] = useState("coffee beans");
  const [suggestions, setSuggestions] = useState<Suggestion[]>(() =>
    generateSuggestions("coffee beans"),
  );
  const [category, setCategory] = useState("All ideas");
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const visible = useMemo(
    () => suggestions.filter((item) => category === "All ideas" || item.category === category),
    [suggestions, category],
  );
  const actionItems = suggestions.filter((item) => selection.has(item.keyword));
  const itemsForAction = actionItems.length ? actionItems : visible;
  const savedSet = new Set(saved.map((item) => item.keyword.toLowerCase()));
  function generate() {
    setError("");
    try {
      const next = generateSuggestions(seed);
      if (!next.length) {
        setError("Add a topic first. Two or three words is a good start.");
        return;
      }
      setSuggestions(next);
      setActiveSeed(seed.trim());
      setSelection(new Set());
      setCategory("All ideas");
      notify("24 template-based starting points, ready to review.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please check your topic.");
    }
  }
  function asKeywords(items: Suggestion[]) {
    return cleanKeywords(
      items.map((item) => item.keyword),
      { ...options, lowercase: false },
    ).keywords;
  }
  return (
    <>
      <PageHeading
        eyebrow="FIND YOUR NEXT ANGLE"
        title="One topic."
        accent="A few new possibilities."
        description="Explore questions, comparisons, and longer phrases. A springboard for your thinking—not a prediction of demand."
      >
        <div className="page-icon-art">
          <Lightbulb size={46} strokeWidth={1} />
          <span className="art-spark art-spark-one">+</span>
          <span className="art-spark art-spark-two">+</span>
        </div>
      </PageHeading>
      <div className="tool-two-column ideas-layout">
        <section className="panel seed-panel">
          <div className="panel-title">
            <div>
              <h2>A small starting point</h2>
              <p>What would you like to explore?</p>
            </div>
            <span className="step-number">01</span>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              generate();
            }}
          >
            <label className="field-label" htmlFor="seed-topic">
              Your topic or seed keyword
            </label>
            <input
              className="form-input seed-input"
              id="seed-topic"
              value={seed}
              maxLength={100}
              onChange={(event) => setSeed(event.target.value)}
              placeholder="e.g. indoor plants"
            />
            <p className="field-hint">
              A focused noun phrase works best. Templates are in English.
            </p>
            <button type="submit" className="button button-primary full-width">
              <Sparkles size={16} />
              Explore ideas
              <ArrowRight size={16} />
            </button>
          </form>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="seed-examples">
            <span className="eyebrow">NEED A STARTING POINT?</span>
            {["indoor plants", "freelance writing", "running shoes"].map((example) => (
              <button key={example} onClick={() => setSeed(example)}>
                {example}
                <Plus size={12} />
              </button>
            ))}
          </div>
          <div className="mini-note">
            <LeafIcon />
            <h3>A prompt, not a promise.</h3>
            <p>
              These phrases combine your topic with fixed templates. Some will be awkward; that’s
              your cue to edit, not publish blindly.
            </p>
          </div>
        </section>
        <section className="panel ideas-results">
          <div className="results-heading">
            <div>
              <h2>
                Room for a new idea<span className="number-chip">{suggestions.length}</span>
              </h2>
              <p>
                Starting points for <strong>{activeSeed}</strong>
                {seed.trim() !== activeSeed && (
                  <span className="pending-label"> · Topic changed—run again</span>
                )}
              </p>
            </div>
            <button
              className="button button-secondary button-small"
              onClick={() => {
                exportKeywords(asKeywords(itemsForAction), "online-tools-ideas.csv");
                notify("Ideas exported. These are unvalidated template suggestions.");
              }}
            >
              <ArrowDownToLine size={14} />
              Export
            </button>
          </div>
          <div className="category-tabs" role="group" aria-label="Idea category">
            {["All ideas", "Questions", "Comparisons", "Long-tail"].map((item) => (
              <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>
                {item}
                <span>{item === "All ideas" ? 24 : 8}</span>
              </button>
            ))}
          </div>
          <div className="ideas-action-bar">
            <label className="check-label">
              <input
                type="checkbox"
                checked={visible.length > 0 && visible.every((item) => selection.has(item.keyword))}
                onChange={(event) => {
                  const next = new Set(selection);
                  for (const item of visible) {
                    if (event.target.checked) next.add(item.keyword);
                    else next.delete(item.keyword);
                  }
                  setSelection(next);
                }}
              />
              {selection.size ? `${selection.size} selected` : "Select visible ideas"}
            </label>
            <button
              className="text-button"
              onClick={() => saveKeywords(asKeywords(itemsForAction))}
            >
              <Bookmark size={13} />
              Save {selection.size ? "selected" : "visible"}
            </button>
          </div>
          <div className="suggestion-list">
            {visible.map((item) => (
              <div
                className={`suggestion-row ${selection.has(item.keyword) ? "selected" : ""}`}
                key={item.keyword}
              >
                <input
                  type="checkbox"
                  aria-label={`Select ${item.keyword}`}
                  checked={selection.has(item.keyword)}
                  onChange={() => {
                    const next = new Set(selection);
                    if (next.has(item.keyword)) next.delete(item.keyword);
                    else next.add(item.keyword);
                    setSelection(next);
                  }}
                />
                <div>
                  <span>{item.keyword}</span>
                  <span className="suggestion-category">{item.category}</span>
                </div>
                <IntentBadge intent={item.intent} />
                <button
                  className={`save-keyword ${savedSet.has(item.keyword) ? "saved" : ""}`}
                  aria-label={`Save ${item.keyword}`}
                  disabled={savedSet.has(item.keyword)}
                  onClick={() => saveKeywords(asKeywords([item]))}
                >
                  <Bookmark size={15} fill={savedSet.has(item.keyword) ? "currentColor" : "none"} />
                </button>
              </div>
            ))}
          </div>
          <div className="ideas-footer">
            <span>
              <Check size={13} />
              No search-volume claims. Ever.
            </span>
            <button
              className="button button-primary button-small"
              onClick={() => {
                try {
                  const nextInput = [input.trim(), ...itemsForAction.map((item) => item.keyword)]
                    .filter(Boolean)
                    .join("\n");
                  const next = cleanKeywords(nextInput, options);
                  setInput(nextInput);
                  setResult(next);
                  setIsExample(false);
                  router.push("/");
                  notify(
                    `${itemsForAction.length} ideas added to your studio. Duplicate removal follows your cleaning preferences.`,
                  );
                } catch (err) {
                  notify(err instanceof Error ? err.message : "Could not add ideas.", "info");
                }
              }}
            >
              Add {itemsForAction.length} to studio
              <ArrowRight size={14} />
            </button>
          </div>
          <HeuristicNote>
            Template suggestions are not autocomplete data. English modifier rules infer intent.
          </HeuristicNote>
        </section>
      </div>
    </>
  );
}
function LeafIcon() {
  return (
    <span className="mini-note-icon">
      <Lightbulb size={20} strokeWidth={1.5} />
    </span>
  );
}
