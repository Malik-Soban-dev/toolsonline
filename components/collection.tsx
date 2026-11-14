"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownToLine, ArrowRight, Bookmark, Search, Trash2 } from "lucide-react";
import { useWorkspace } from "./workspace-provider";
import { Dialog, EmptyState, exportKeywords, IntentBadge, PageHeading } from "./ui";

export function Collection() {
  const { saved, removeSaved, remember, toggleRemember, notify } = useWorkspace();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState(false);
  const [page, setPage] = useState(1);
  const filtered = useMemo(
    () => saved.filter((item) => item.keyword.toLowerCase().includes(search.toLowerCase())),
    [saved, search],
  );
  const activeItems = saved.filter((item) => selected.has(item.keyword));
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * 20, currentPage * 20);
  return (
    <>
      <PageHeading
        eyebrow="KEEP THE GOOD ONES CLOSE"
        title="Your keyword collection."
        accent="Keep the possibilities."
        description="Save keywords as you explore, then take the useful ones into your next brief. No account or cloud storage involved."
      >
        <div className="page-icon-art">
          <Bookmark size={43} strokeWidth={1.1} />
        </div>
      </PageHeading>
      <div className="collection-status">
        <span className="status-dot" />
        <span>
          {remember
            ? "Your studio and collection are remembered on this browser."
            : "Your collection lasts for this session. Export it before you go, or remember it on this browser."}
        </span>
        <button className="text-button" onClick={toggleRemember}>
          {remember ? "Turn off saving" : "Remember on this browser"}
        </button>
      </div>
      <section className="panel collection-panel">
        <div className="results-heading">
          <div>
            <h2>
              The keepers<span className="number-chip">{saved.length}</span>
            </h2>
            <p>Intent and topics are heuristic labels from your workspace.</p>
          </div>
          <div className="button-group">
            <button
              className="button button-secondary button-small"
              disabled={!activeItems.length}
              onClick={() => setConfirm(true)}
            >
              <Trash2 size={14} />
              Remove selected
            </button>
            <button
              className="button button-primary button-small"
              disabled={!activeItems.length && !filtered.length}
              onClick={() => {
                exportKeywords(
                  activeItems.length ? activeItems : filtered,
                  "online-tools-collection.csv",
                );
                notify("Collection exported.");
              }}
            >
              <ArrowDownToLine size={14} />
              Export {activeItems.length ? `(${activeItems.length})` : "CSV"}
            </button>
          </div>
        </div>
        {saved.length > 0 && (
          <div className="collection-search search-input">
            <Search size={15} />
            <input
              type="search"
              value={search}
              aria-label="Search saved keywords"
              placeholder="Find something in your collection…"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
        )}
        {!saved.length ? (
          <EmptyState
            icon={<Bookmark size={28} strokeWidth={1.4} />}
            title="Good ideas belong somewhere"
            description="Tap the bookmark beside a keyword in the studio or ideas tool. It will be waiting for you here."
          >
            <Link href="/" className="button button-primary">
              Explore the keyword studio
              <ArrowRight size={15} />
            </Link>
          </EmptyState>
        ) : !filtered.length ? (
          <EmptyState
            icon={<Search size={25} />}
            title="No keepers match that search"
            description="Try a shorter phrase or clear the search to see your full collection."
          >
            <button className="button button-secondary" onClick={() => setSearch("")}>
              Clear search
            </button>
          </EmptyState>
        ) : (
          <>
            <div className="table-scroll">
              <table className="keyword-table collection-table">
                <caption className="sr-only">Your saved keyword collection</caption>
                <thead>
                  <tr>
                    <th className="checkbox-cell">
                      <input
                        type="checkbox"
                        aria-label="Select all saved keywords on this page"
                        checked={
                          visible.length > 0 && visible.every((item) => selected.has(item.keyword))
                        }
                        onChange={(event) => {
                          const next = new Set(selected);
                          for (const item of visible) {
                            if (event.target.checked) next.add(item.keyword);
                            else next.delete(item.keyword);
                          }
                          setSelected(next);
                        }}
                      />
                    </th>
                    <th>Keyword</th>
                    <th>Intent</th>
                    <th>Topic</th>
                    <th className="word-cell">Words</th>
                    <th>
                      <span className="sr-only">Remove</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => (
                    <tr key={item.keyword}>
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          aria-label={`Select saved ${item.keyword}`}
                          checked={selected.has(item.keyword)}
                          onChange={() => {
                            const next = new Set(selected);
                            if (next.has(item.keyword)) next.delete(item.keyword);
                            else next.add(item.keyword);
                            setSelected(next);
                          }}
                        />
                      </td>
                      <td className="keyword-cell">{item.keyword}</td>
                      <td>
                        <IntentBadge intent={item.intent} />
                      </td>
                      <td>
                        <span className="topic-text">{item.cluster}</span>
                      </td>
                      <td className="word-cell">{item.words}</td>
                      <td>
                        <button
                          className="icon-button"
                          aria-label={`Remove ${item.keyword}`}
                          onClick={() => {
                            const next = new Set(selected);
                            next.delete(item.keyword);
                            setSelected(next);
                            removeSaved([item.keyword]);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>
                {filtered.length} keywords · {activeItems.length} selected
              </span>
              <div>
                <button
                  className="text-button"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  Previous
                </button>
                <span>
                  {currentPage} / {pages}
                </span>
                <button
                  className="text-button"
                  disabled={currentPage === pages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title={`Remove ${activeItems.length} keywords?`}
        description="This removes them from your collection, but does not change the studio input or an exported file."
      >
        <div className="dialog-actions">
          <button className="button button-secondary" onClick={() => setConfirm(false)}>
            Keep them
          </button>
          <button
            className="button button-danger"
            onClick={() => {
              removeSaved(activeItems.map((item) => item.keyword));
              setSelected(new Set());
              setConfirm(false);
            }}
          >
            Remove selected
          </button>
        </div>
      </Dialog>
    </>
  );
}
