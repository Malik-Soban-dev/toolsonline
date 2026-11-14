"use client";

import { useState } from "react";
import { ArrowDownToLine, ArrowRight, Check, Copy, Lightbulb, Sparkles, Type } from "lucide-react";
import { characterCount, descriptionIdeas, metaMarkup, titleIdeas } from "@/lib/analysis";
import { CopyButton, downloadFile, HeuristicNote, PageHeading } from "./ui";
import { LengthMeter } from "./serp-preview";

export function MetaHelper() {
  const [topic, setTopic] = useState("Better Coffee");
  const [brand, setBrand] = useState("The Daily Brew");
  const [benefit, setBenefit] = useState("brew a cup you look forward to");
  const [titles, setTitles] = useState(() => titleIdeas("Better Coffee", "The Daily Brew"));
  const [descriptions, setDescriptions] = useState(() =>
    descriptionIdeas("Better Coffee", "brew a cup you look forward to"),
  );
  const [title, setTitle] = useState("Better Coffee: A Practical Guide | The Daily Brew");
  const [description, setDescription] = useState(
    () => descriptionIdeas("Better Coffee", "brew a cup you look forward to")[0],
  );
  const [error, setError] = useState("");
  return (
    <>
      <PageHeading
        eyebrow="GIVE YOUR PAGE A CLEAR INTRODUCTION"
        title="Title & meta helper."
        accent="Skip the blank page."
        description="Draft page titles and meta descriptions with fixed sentence templates. Pick a starting point, edit your own copy, and take the HTML with you."
      >
        <div className="page-icon-art">
          <Type size={47} strokeWidth={1.1} />
        </div>
      </PageHeading>
      <div className="meta-top-grid">
        <section className="panel meta-brief">
          <div className="panel-title">
            <div>
              <h2>A tiny creative brief</h2>
              <p>The details that make your page different.</p>
            </div>
            <span className="step-number">01</span>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!topic.trim()) {
                setError("Add a page topic first.");
                return;
              }
              setError("");
              setTitles(titleIdeas(topic, brand));
              setDescriptions(descriptionIdeas(topic, benefit));
            }}
          >
            <label className="field-label" htmlFor="meta-topic">
              Page topic
            </label>
            <input
              id="meta-topic"
              className="form-input"
              value={topic}
              maxLength={100}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. Indoor Plant Care"
              required
            />
            <label className="field-label spaced-label" htmlFor="meta-brand">
              Brand name <span className="optional-label">optional</span>
            </label>
            <input
              id="meta-brand"
              className="form-input"
              value={brand}
              maxLength={50}
              onChange={(event) => setBrand(event.target.value)}
              placeholder="e.g. The Green Corner"
            />
            <label className="field-label spaced-label" htmlFor="meta-benefit">
              Help your reader… <span className="optional-label">optional</span>
            </label>
            <input
              id="meta-benefit"
              className="form-input"
              value={benefit}
              maxLength={140}
              onChange={(event) => setBenefit(event.target.value)}
              placeholder="e.g. keep their first plant thriving"
            />
            <p className="field-hint">
              Finish the sentence with a benefit. Keep it specific and truthful.
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button button-primary full-width" type="submit">
              <Sparkles size={16} />
              Draft a few options
              <ArrowRight size={15} />
            </button>
          </form>
          <div className="brief-note">
            <Lightbulb size={16} />
            <span>
              Simple templates, not generative AI. Edit every draft for accuracy and a natural
              voice.
            </span>
          </div>
        </section>
        <section className="panel meta-drafts">
          <div className="panel-title">
            <div>
              <h2>A few ways in</h2>
              <p>Choose a draft below to put it on your editing desk.</p>
            </div>
            <span className="heuristic-tag">
              <span />
              TEMPLATE-BASED
            </span>
          </div>
          <h3 className="draft-section-label">TITLE STARTING POINTS</h3>
          <div className="title-ideas">
            {titles.map((idea) => (
              <button
                key={idea}
                className={`draft-option ${title === idea ? "draft-selected" : ""}`}
                onClick={() => setTitle(idea)}
              >
                <span>{idea}</span>
                <span className="draft-option-meta">
                  {characterCount(idea)} chars
                  {title === idea ? <Check size={13} /> : <ArrowRight size={13} />}
                </span>
              </button>
            ))}
          </div>
          <h3 className="draft-section-label">DESCRIPTION STARTING POINTS</h3>
          <div className="description-ideas">
            {descriptions.map((idea) => (
              <button
                key={idea}
                className={`draft-option ${description === idea ? "draft-selected" : ""}`}
                onClick={() => setDescription(idea)}
              >
                <span>{idea}</span>
                <span className="draft-option-meta">
                  {characterCount(idea)} chars
                  {description === idea ? <Check size={13} /> : <ArrowRight size={13} />}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
      <section className="panel editing-desk">
        <div className="panel-title">
          <div>
            <h2>Your editing desk</h2>
            <p>A useful draft becomes a good snippet when it sounds like you.</p>
          </div>
          <span className="step-number">02</span>
        </div>
        <div className="editing-desk-grid">
          <div>
            <label className="field-label" htmlFor="final-title">
              Your page title
            </label>
            <input
              id="final-title"
              className="form-input"
              value={title}
              maxLength={200}
              onChange={(event) => setTitle(event.target.value)}
            />
            <LengthMeter kind="title" value={title} />
            <label className="field-label spaced-label" htmlFor="final-description">
              Your meta description
            </label>
            <textarea
              id="final-description"
              className="form-input description-textarea"
              value={description}
              maxLength={500}
              onChange={(event) => setDescription(event.target.value)}
            />
            <LengthMeter kind="description" value={description} />
          </div>
          <div className="final-code">
            <span className="eyebrow">READY FOR YOUR &lt;HEAD&gt;</span>
            <pre>{metaMarkup(title, description)}</pre>
            <div className="code-actions">
              <CopyButton text={metaMarkup(title, description)}>
                <Copy size={14} />
                Copy HTML
              </CopyButton>
              <button
                className="button button-secondary"
                onClick={() =>
                  downloadFile(
                    "online-tools-meta-tags.html",
                    metaMarkup(title, description),
                    "text/html;charset=utf-8",
                  )
                }
              >
                <ArrowDownToLine size={14} />
                Download
              </button>
            </div>
          </div>
        </div>
        <HeuristicNote>
          Length ranges are editorial guides, not SEO scores. Search engines may display a different
          snippet.
        </HeuristicNote>
      </section>
    </>
  );
}
