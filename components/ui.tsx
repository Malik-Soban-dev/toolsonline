"use client";

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUpRight, CircleHelp, X } from "lucide-react";
import Link from "next/link";
import type { Intent } from "@/lib/keywords";
import { toCsv } from "@/lib/csv";
import { useWorkspace } from "./workspace-provider";

export function IntentBadge({ intent }: { intent: Intent }) {
  return (
    <span className={`intent-badge intent-${intent.toLowerCase()}`}>
      <span aria-hidden="true" />
      {intent}
    </span>
  );
}

export function PageHeading({
  eyebrow,
  title,
  accent,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <section className="page-heading">
      <div>
        <div className="eyebrow">
          <span className="eyebrow-line" />
          {eyebrow}
        </div>
        <h1>
          {title}
          {accent && (
            <>
              {" "}
              <em>{accent}</em>
            </>
          )}
        </h1>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}

export function HeuristicNote({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`heuristic-note ${compact ? "compact" : ""}`}>
      <CircleHelp size={15} aria-hidden="true" />
      <span>
        {children}{" "}
        <Link href="/methodology/">
          How it works
          <ArrowUpRight size={12} aria-hidden="true" />
        </Link>
      </span>
    </div>
  );
}

export function containFocus(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== "Tab") return;
  const elements = [
    ...event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
    ),
  ].filter((element) => element.getClientRects().length > 0);
  const first = elements[0];
  const last = elements[elements.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  description,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="dialog"
      onCancel={onClose}
      onKeyDown={containFocus}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <div className="dialog-inner">
        <div className="dialog-heading">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>
        {description && (
          <p className="muted" id={descriptionId}>
            {description}
          </p>
        )}
        {children}
      </div>
    </dialog>
  );
}

export function downloadFile(filename: string, data: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportKeywords(
  items: { keyword: string; intent: string; cluster: string; words: number }[],
  filename = "online-tools-keywords.csv",
) {
  downloadFile(
    filename,
    toCsv(
      ["Keyword", "Intent (heuristic)", "Topic (lexical)", "Word count"],
      items.map((item) => [item.keyword, item.intent, item.cluster, item.words]),
    ),
  );
}

export function CopyButton({
  text,
  children = "Copy",
  className = "button button-secondary",
}: {
  text: string;
  children?: ReactNode;
  className?: string;
}) {
  const { notify } = useWorkspace();
  return (
    <button
      type="button"
      className={className}
      disabled={!text}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          notify("Copied to clipboard.");
        } catch {
          notify("Clipboard is unavailable. Select and copy the text manually.", "info");
        }
      }}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
