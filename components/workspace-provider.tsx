"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, X } from "lucide-react";
import {
  cleanKeywords,
  DEFAULT_OPTIONS,
  SAMPLE_INPUT,
  type CleanOptions,
  type CleanResult,
  type Keyword,
} from "@/lib/keywords";
import { MAX_INPUT_CHARS, MAX_ROWS } from "@/lib/csv";

const STORAGE_KEY = "online-tools.workspace.v1";
type Toast = { message: string; kind: "success" | "info" };
type WorkspaceContextValue = {
  input: string;
  setInput: (value: string) => void;
  options: CleanOptions;
  setOptions: (value: CleanOptions) => void;
  result: CleanResult;
  setResult: (value: CleanResult) => void;
  isExample: boolean;
  setIsExample: (value: boolean) => void;
  saved: Keyword[];
  saveKeywords: (items: Keyword[]) => void;
  removeSaved: (keywords: string[]) => void;
  remember: boolean;
  toggleRemember: () => void;
  clearWorkspace: () => void;
  notify: (message: string, kind?: Toast["kind"]) => void;
};
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [input, setInput] = useState(SAMPLE_INPUT);
  const [options, setOptions] = useState<CleanOptions>(DEFAULT_OPTIONS);
  const [result, setResult] = useState<CleanResult>(() => cleanKeywords(SAMPLE_INPUT));
  const [isExample, setIsExample] = useState(true);
  const [saved, setSaved] = useState<Keyword[]>([]);
  const [remember, setRemember] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((message: string, kind: Toast["kind"] = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, kind });
    toastTimer.current = setTimeout(() => setToast(null), 5500);
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data: unknown = JSON.parse(stored);
          if (!data || typeof data !== "object" || !("version" in data) || data.version !== 1)
            throw new Error("Invalid saved version");
          const snapshot = data as Record<string, unknown>;
          if (
            typeof snapshot.input !== "string" ||
            snapshot.input.length > MAX_INPUT_CHARS ||
            !Array.isArray(snapshot.saved) ||
            snapshot.saved.length > MAX_ROWS
          )
            throw new Error("Invalid saved workspace");
          const restoredOptions = { ...DEFAULT_OPTIONS };
          if (snapshot.options && typeof snapshot.options === "object") {
            for (const key of Object.keys(DEFAULT_OPTIONS) as (keyof CleanOptions)[]) {
              const value = (snapshot.options as Record<string, unknown>)[key];
              if (typeof value === "boolean") restoredOptions[key] = value;
            }
          }
          const restoredSaved = snapshot.saved.filter((item): item is Keyword =>
            Boolean(
              item &&
                typeof item === "object" &&
                typeof item.keyword === "string" &&
                item.keyword.length < 10000,
            ),
          );
          setInput(snapshot.input);
          setOptions(restoredOptions);
          setResult(cleanKeywords(snapshot.input, restoredOptions));
          setSaved(
            cleanKeywords(
              restoredSaved.map((item) => item.keyword),
              { ...DEFAULT_OPTIONS, lowercase: false },
            ).keywords,
          );
          setIsExample(snapshot.isExample === true);
          setRemember(true);
        }
      } catch {
        // Never render or execute unvalidated local-storage content.
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch {
          /* Storage may be disabled. */
        }
        notify("Your saved workspace could not be restored. A fresh example is ready.", "info");
      }
      setHydrated(true);
    });
    return () => {
      active = false;
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [notify]);

  useEffect(() => {
    if (!hydrated || !remember) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, input, options, saved, isExample }),
      );
    } catch {
      queueMicrotask(() => {
        setRemember(false);
        notify(
          "Browser storage is unavailable or full. Your workspace still works for this session.",
          "info",
        );
      });
    }
  }, [input, options, saved, isExample, hydrated, remember, notify]);

  function toggleRemember() {
    if (remember) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        notify(
          "This browser blocked storage access. Use browser settings to clear site data.",
          "info",
        );
        return;
      }
      setRemember(false);
      notify("Local saving is off. Existing browser data has been removed.");
    } else {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ version: 1, input, options, saved, isExample }),
        );
        setRemember(true);
        notify("Workspace will be remembered on this browser only.");
      } catch {
        notify("Browser storage is unavailable. You can still export your work.", "info");
      }
    }
  }

  function saveKeywords(items: Keyword[]) {
    const existing = new Set(saved.map((item) => item.keyword.toLowerCase()));
    const additions = items.filter((item) => {
      const key = item.keyword.toLowerCase();
      if (existing.has(key)) return false;
      existing.add(key);
      return true;
    });
    if (saved.length + additions.length > MAX_ROWS) {
      notify(
        "Your collection is full. Export or remove some of the 5,000 saved keywords first.",
        "info",
      );
      return;
    }
    setSaved((current) => [...current, ...additions]);
    notify(
      additions.length
        ? `${additions.length} keyword${additions.length === 1 ? "" : "s"} added to your collection.`
        : "These keywords are already in your collection.",
      additions.length ? "success" : "info",
    );
  }

  function removeSaved(keywords: string[]) {
    const removing = new Set(keywords);
    setSaved((current) => current.filter((item) => !removing.has(item.keyword)));
    notify(
      `${keywords.length} keyword${keywords.length === 1 ? "" : "s"} removed from your collection.`,
    );
  }

  function clearWorkspace() {
    setInput("");
    setOptions(DEFAULT_OPTIONS);
    setResult(cleanKeywords(""));
    setSaved([]);
    setIsExample(false);
    let storageCleared = true;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      storageCleared = false;
    }
    setRemember(false);
    notify(
      storageCleared
        ? "Workspace cleared. Browser-saved data has been removed."
        : "Session cleared, but browser storage could not be removed. Clear site data in your browser settings.",
      storageCleared ? "success" : "info",
    );
  }

  // Context intentionally includes the current state as well as actions.
  const value = {
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
    removeSaved,
    remember,
    toggleRemember,
    clearWorkspace,
    notify,
  };
  return (
    <WorkspaceContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite" aria-atomic="true">
        {toast && (
          <div className={`toast toast-${toast.kind}`}>
            <span className="toast-icon">
              <Check size={16} />
            </span>
            <span>{toast.message}</span>
            <button
              className="icon-button"
              aria-label="Dismiss notification"
              onClick={() => setToast(null)}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return context;
}
