"use client";

import { useState } from "react";
import { ArrowUpRight, Copy, MessageSquare } from "lucide-react";
import { CopyButton } from "./ui";

export function ContactForm() {
  const [type, setType] = useState("Bug report");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [ready, setReady] = useState(false);
  const body = `Type: ${type}\n\n${details.trim()}\n\n---\nSent from the Online Tools contact draft.`;
  const url = `https://github.com/Malik-Soban-dev/toolsonline/issues/new?${new URLSearchParams({ title: `[${type}] ${subject.trim()}`, body }).toString()}`;
  return (
    <div className="contact-draft">
      <div className="contact-draft-heading">
        <MessageSquare size={20} />
        <h2>Make the first message easier</h2>
      </div>
      <p>
        Draft your feedback here, then review and submit it on GitHub. This form does not send email
        or open an issue automatically.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setReady(true);
        }}
      >
        <label className="field-label" htmlFor="contact-type">
          What’s on your mind?
        </label>
        <select
          id="contact-type"
          className="form-input"
          value={type}
          onChange={(event) => {
            setType(event.target.value);
            setReady(false);
          }}
        >
          <option>Bug report</option>
          <option>Feature idea</option>
          <option>General question</option>
          <option>Privacy question</option>
        </select>
        <label className="field-label spaced-label" htmlFor="contact-subject">
          A short subject
        </label>
        <input
          id="contact-subject"
          className="form-input"
          value={subject}
          required
          maxLength={100}
          onChange={(event) => {
            setSubject(event.target.value);
            setReady(false);
          }}
          placeholder="e.g. CSV header isn’t detected"
        />
        <label className="field-label spaced-label" htmlFor="contact-details">
          A little more context
        </label>
        <textarea
          id="contact-details"
          className="form-input contact-textarea"
          value={details}
          required
          maxLength={1200}
          onChange={(event) => {
            setDetails(event.target.value);
            setReady(false);
          }}
          placeholder="What happened? What did you expect? A small, non-sensitive example helps."
        />
        <p className="field-hint">
          GitHub issues are public. Do not include sensitive data, credentials, or confidential
          lists.
        </p>
        <button type="submit" className="button button-primary">
          Prepare a GitHub draft
          <ArrowUpRight size={15} />
        </button>
      </form>
      {ready && (
        <div className="contact-ready" role="status">
          <strong>Your draft is ready. Nothing has been sent.</strong>
          <p>
            The next link includes your subject and details in the URL. GitHub requires an account
            to submit.
          </p>
          <div className="button-group">
            <a className="button button-primary" href={url} target="_blank" rel="noreferrer">
              Review on GitHub
              <ArrowUpRight size={15} />
            </a>
            <CopyButton text={`${subject}\n\n${body}`}>
              <Copy size={14} />
              Copy instead
            </CopyButton>
          </div>
        </div>
      )}
    </div>
  );
}
