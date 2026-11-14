"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Bookmark,
  ChevronRight,
  CircleHelp,
  FileText,
  Flower2,
  Leaf,
  Menu,
  PanelTop,
  Search,
  ShieldCheck,
  Sparkles,
  Type,
  X,
} from "lucide-react";
import { useWorkspace } from "./workspace-provider";
import { containFocus, Dialog, exportKeywords } from "./ui";

const tools = [
  { href: "/", label: "Keyword studio", icon: Search, badge: "START HERE" },
  { href: "/keyword-ideas/", label: "Keyword ideas", icon: Sparkles },
  { href: "/text-analyzer/", label: "Text analyzer", icon: FileText },
  { href: "/serp-preview/", label: "SERP preview", icon: PanelTop },
  { href: "/meta-helper/", label: "Title & meta helper", icon: Type },
];
const routeNames: Record<string, string> = {
  "/": "Keyword studio",
  "/keyword-ideas": "Keyword ideas",
  "/text-analyzer": "Text analyzer",
  "/serp-preview": "SERP preview",
  "/meta-helper": "Title & meta helper",
  "/saved": "My collection",
  "/about": "About Online Tools",
  "/privacy": "Privacy",
  "/terms": "Terms of use",
  "/contact": "Contact",
  "/methodology": "How it works",
};

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      className={`brand ${compact ? "brand-compact" : ""}`}
      href="/"
      aria-label="Online Tools home"
    >
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span>
        online<span className="brand-light">tools</span>
        <span className="brand-period">.</span>
      </span>
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const { saved, remember, toggleRemember, clearWorkspace } = useWorkspace();
  useEffect(() => {
    if (!mobileOpen) return;
    const overflow = document.body.style.overflow;
    const menu = menuRef.current;
    document.body.style.overflow = "hidden";
    sidebarRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      menu?.focus();
    };
  }, [mobileOpen]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 851px)");
    const closeOnDesktop = () => {
      if (media.matches) setMobileOpen(false);
    };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          tabIndex={-1}
          aria-hidden="true"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen ? true : undefined}
        onKeyDown={mobileOpen ? containFocus : undefined}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setMobileOpen(false);
        }}
        aria-label="Main navigation"
      >
        <div className="sidebar-brand-row">
          <Brand />
          <button
            className="icon-button mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace-label">
          <span className="workspace-dot" />
          YOUR LITTLE SEO WORKSPACE
        </div>
        <nav>
          <div className="nav-section-label">
            THE TOOLKIT <span>05</span>
          </div>
          <div className="nav-tools">
            {tools.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`nav-item ${normalizedPath === href.replace(/\/$/, "") || (href === "/" && normalizedPath === "/") ? "active" : ""}`}
                aria-current={
                  normalizedPath === (href.replace(/\/$/, "") || "/") ? "page" : undefined
                }
              >
                <Icon size={18} strokeWidth={1.7} />
                <span>{label}</span>
                {href === "/" && <span className="nav-active-dot" />}
              </Link>
            ))}
          </div>
          <div className="nav-divider" />
          <div className="nav-section-label">YOUR SPACE</div>
          <Link
            href="/saved/"
            className={`nav-item ${normalizedPath === "/saved" ? "active" : ""}`}
            aria-current={normalizedPath === "/saved" ? "page" : undefined}
          >
            <Bookmark size={18} strokeWidth={1.7} />
            <span>My collection</span>
            <span className="count-badge">{saved.length}</span>
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="local-card">
            <div className="local-card-top">
              <span className="leaf-icon">
                <Leaf size={19} strokeWidth={1.5} />
              </span>
              <span>
                Small tools.
                <br />
                <strong>Good work.</strong>
              </span>
            </div>
            <p>
              No accounts. No API keys.
              <br />
              Just you and your next idea.
            </p>
            <Link href="/about/">
              A little about us <ArrowUpRight size={14} />
            </Link>
          </div>
          <Link href="/methodology/" className="sidebar-help">
            <CircleHelp size={17} /> A field guide to the tools <ArrowUpRight size={14} />
          </Link>
          <div className="sidebar-footer">
            <span className="status-dot" /> Made for a clearer web.
          </div>
        </div>
      </aside>
      <div className="main-shell" inert={mobileOpen}>
        <header className="topbar">
          <div className="topbar-left">
            <button
              ref={menuRef}
              className="icon-button mobile-menu"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <nav aria-label="Breadcrumb" className="breadcrumb-nav">
              <Link href="/" className="breadcrumb-home">
                Workspace
              </Link>
              <ChevronRight size={13} className="breadcrumb-chevron" aria-hidden="true" />
              <span aria-current="page">{routeNames[normalizedPath] ?? "Page not found"}</span>
            </nav>
          </div>
          <div className="topbar-right">
            <span className="local-status">
              <span className="status-dot" /> Runs in your browser
            </span>
            <span className="topbar-separator" />
            <Link href="/methodology/" className="topbar-guide" aria-label="Quick guide">
              <CircleHelp size={17} />
              <span>Quick guide</span>
            </Link>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {children}
        </main>
        <footer className="main-footer">
          <div>
            <span className="footer-flower">
              <Flower2 size={17} strokeWidth={1.3} />
            </span>{" "}
            A little less busywork. A little more possibility.
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/about/">About</Link>
            <Link href="/privacy/">Privacy</Link>
            <Link href="/terms/">Terms</Link>
            <Link href="/contact/">Contact</Link>
          </nav>
        </footer>
        <div className="storage-bar">
          <ShieldCheck size={13} />
          <span>
            {remember
              ? "Saved on this browser."
              : "Session only. Your keywords stay on this device."}
          </span>
          <button onClick={toggleRemember}>
            {remember ? "Turn off local saving" : "Remember my workspace"}
          </button>
          <button className="storage-clear" onClick={() => setShowClear(true)}>
            Clear data
          </button>
        </div>
      </div>
      <Dialog
        open={showClear}
        onClose={() => setShowClear(false)}
        title="Start with a clean slate?"
        description="This clears your keyword studio, collection, and remembered data on this browser. Export anything you want to keep first."
      >
        <div className="dialog-actions">
          <button className="button button-secondary" onClick={() => setShowClear(false)}>
            Keep working
          </button>
          {saved.length > 0 && (
            <button
              className="button button-secondary"
              onClick={() => exportKeywords(saved, "online-tools-collection.csv")}
            >
              <ArrowDownToLine size={15} />
              Export collection
            </button>
          )}
          <button
            className="button button-danger"
            onClick={() => {
              clearWorkspace();
              setShowClear(false);
            }}
          >
            Clear workspace
          </button>
        </div>
      </Dialog>
    </div>
  );
}
