"use client";

import { useState } from "react";
import { Check, Code2, Copy, Globe2, Monitor, PanelTop, RotateCcw, Smartphone } from "lucide-react";
import { characterCount, estimatePixels, metaMarkup, normalizePreviewUrl } from "@/lib/analysis";
import { CopyButton, HeuristicNote, PageHeading } from "./ui";

const initial = {
  url: "https://example.com/guides/better-coffee",
  site: "The Daily Brew",
  title: "Better Coffee Starts Here: A Practical Brewing Guide",
  description:
    "A better cup is closer than you think. Explore simple brewing tips, find your favorite coffee beans, and make your daily ritual a little more delicious.",
};

export function LengthMeter({ value, kind }: { value: string; kind: "title" | "description" }) {
  const count = characterCount(value);
  const max = kind === "title" ? 60 : 160;
  const min = kind === "title" ? 40 : 120;
  const over = count > max;
  return (
    <div
      className={`length-meter ${over ? "meter-over" : count >= min ? "meter-comfortable" : ""}`}
    >
      <div className="length-track">
        <span style={{ width: `${Math.min((count / max) * 100, 100)}%` }} />
      </div>
      <span>
        {count} <span className="muted">/ ~{max} characters</span>
      </span>
      {kind === "title" && <span className="estimated-width">≈ {estimatePixels(value)} px</span>}
    </div>
  );
}

export function SerpPreview() {
  const [fields, setFields] = useState(initial);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [showCode, setShowCode] = useState(false);
  const url = normalizePreviewUrl(fields.url);
  const update = (field: keyof typeof initial, value: string) =>
    setFields((current) => ({ ...current, [field]: value }));
  return (
    <>
      <PageHeading
        eyebrow="SEE IT BEFORE YOU PUBLISH"
        title="A small preview."
        accent="A better first impression."
        description="Shape your title and description in a search-style preview. Make the most of the few lines that introduce your page."
      >
        <div className="page-icon-art">
          <PanelTop size={46} strokeWidth={1.1} />
        </div>
      </PageHeading>
      <div className="tool-two-column serp-layout">
        <section className="panel snippet-form">
          <div className="panel-title">
            <div>
              <h2>The details that matter</h2>
              <p>Edit your snippet. Nothing is fetched or published.</p>
            </div>
            <button
              className="icon-button"
              aria-label="Reset snippet example"
              onClick={() => setFields(initial)}
            >
              <RotateCcw size={16} />
            </button>
          </div>
          <label className="field-label" htmlFor="snippet-url">
            Page URL
          </label>
          <input
            id="snippet-url"
            className={`form-input ${!url.valid ? "input-invalid" : ""}`}
            value={fields.url}
            maxLength={2000}
            onChange={(event) => update("url", event.target.value)}
            placeholder="https://example.com/your-page"
            aria-invalid={!url.valid}
            aria-describedby={!url.valid ? "url-error" : undefined}
          />
          {!url.valid && (
            <p id="url-error" className="field-error" role="alert">
              Enter a valid web address, such as https://example.com/page.
            </p>
          )}
          <label className="field-label spaced-label" htmlFor="snippet-site">
            Site name
          </label>
          <input
            id="snippet-site"
            className="form-input"
            value={fields.site}
            maxLength={80}
            onChange={(event) => update("site", event.target.value)}
            placeholder="Your site name"
          />
          <label className="field-label spaced-label" htmlFor="snippet-title">
            Page title
          </label>
          <input
            id="snippet-title"
            className="form-input"
            value={fields.title}
            maxLength={200}
            onChange={(event) => update("title", event.target.value)}
            placeholder="A clear title for your page"
          />
          <LengthMeter value={fields.title} kind="title" />
          <label className="field-label spaced-label" htmlFor="snippet-description">
            Meta description
          </label>
          <textarea
            id="snippet-description"
            className="form-input description-textarea"
            value={fields.description}
            maxLength={500}
            onChange={(event) => update("description", event.target.value)}
            placeholder="A useful, honest summary of what your page offers."
          />
          <LengthMeter value={fields.description} kind="description" />
          <p className="field-hint length-hint">
            Character ranges are writing guidelines, not ranking factors or guaranteed display
            limits. Width varies with the words you use.
          </p>
          <CopyButton text={metaMarkup(fields.title, fields.description)}>
            <Copy size={15} />
            Copy HTML tags
          </CopyButton>
        </section>
        <section className="preview-column">
          <div className="panel search-preview-panel">
            <div className="preview-panel-heading">
              <span className="eyebrow">YOUR SEARCH-STYLE PREVIEW</span>
              <div
                className="segmented-control device-toggle"
                role="group"
                aria-label="Preview device"
              >
                <button
                  aria-pressed={device === "desktop"}
                  aria-label="Desktop preview"
                  onClick={() => setDevice("desktop")}
                >
                  <Monitor size={15} />
                </button>
                <button
                  aria-pressed={device === "mobile"}
                  aria-label="Mobile preview"
                  onClick={() => setDevice("mobile")}
                >
                  <Smartphone size={15} />
                </button>
              </div>
            </div>
            <div className={`search-stage ${device === "mobile" ? "search-stage-mobile" : ""}`}>
              <div className="search-result">
                <div className="search-site-row">
                  <span className="search-favicon">
                    <Globe2 size={19} strokeWidth={1.4} />
                  </span>
                  <div>
                    <span className="search-site-name">{fields.site || "Your site name"}</span>
                    <span className="search-breadcrumb">
                      {url.host}
                      {url.path && (
                        <>
                          {" "}
                          <span>›</span> {url.path}
                        </>
                      )}
                    </span>
                  </div>
                  <span className="search-more" aria-hidden="true">
                    ⋮
                  </span>
                </div>
                <h2 className="search-result-title">
                  {fields.title || "Your page title will appear here"}
                </h2>
                <p className="search-result-description">
                  {fields.description ||
                    "A short, useful description gives people a reason to visit. Add yours to see it here."}
                </p>
              </div>
            </div>
            <div className="preview-caption">
              <span className="status-dot" />
              Illustrative preview · {device === "desktop" ? "desktop" : "mobile"} layout
            </div>
            <HeuristicNote>
              Search engines may rewrite titles and descriptions. This is not a live result or a
              pixel-perfect Google emulator.
            </HeuristicNote>
          </div>
          <div className="snippet-checklist">
            <h3>A little pre-publish check</h3>
            <p>
              <Check size={14} />
              Say what the page actually offers.
            </p>
            <p>
              <Check size={14} />
              Put the useful part of your title first.
            </p>
            <p>
              <Check size={14} />
              Give every page a distinct description.
            </p>
            <p>
              <Check size={14} />
              Preview, then test on a real device.
            </p>
          </div>
          <div className="panel code-panel">
            <button
              className="code-toggle"
              aria-expanded={showCode}
              aria-controls="snippet-html"
              onClick={() => setShowCode(!showCode)}
            >
              <Code2 size={16} />
              <span>Take the HTML with you</span>
              <span>{showCode ? "−" : "+"}</span>
            </button>
            <div id="snippet-html" hidden={!showCode}>
              <pre>{metaMarkup(fields.title, fields.description)}</pre>
              <CopyButton
                text={metaMarkup(fields.title, fields.description)}
                className="text-button"
              >
                <Copy size={13} />
                Copy tags
              </CopyButton>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
