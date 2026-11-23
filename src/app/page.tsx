"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import AmbientPlayer from "@/components/AmbientPlayer";
import LibraryTab from "@/components/LibraryTab";
import RecordTab from "@/components/RecordTab";
import ReportTab from "@/components/ReportTab";
import { ReadingEntry } from "@/lib/types";

const STORAGE_KEY = "reading_log_entries_v1";
const THEME_KEY = "reading_log_theme_v1";

type TabType = "record" | "library" | "report";

export default function HomePage() {
  const [entries, setEntries] = useState<ReadingEntry[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("record");
  const [hydrated, setHydrated] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setEntries(JSON.parse(saved));

      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === "dark") {
        setIsDark(true);
        document.documentElement.classList.add("dark");
      }
    } catch (e) {
      console.error("Failed to load initial state:", e);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error("Failed to save entries:", e);
    }
  }, [entries, hydrated]);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem(THEME_KEY, "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem(THEME_KEY, "light");
      }
      return next;
    });
  };

  const handleAddEntry = (newEntry: ReadingEntry) => {
    setEntries((prev) => [newEntry, ...prev]);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setEntries((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "완독" ? "보는 중" : "완독" }
          : item
      )
    );
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-12">
      {/* 상단 유틸리티 바: 사운드 & 라이트/다크 토글 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <AmbientPlayer />

        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-1.5 border border-[var(--border-main)] bg-[var(--bg-surface)] px-3 py-1 text-[11px] font-bold text-[var(--text-main)] transition hover:bg-[var(--bg-hover)]"
          aria-label="테마 전환"
        >
          {isDark ? (
            <>
              <Sun className="h-3.5 w-3.5 text-[#D4A359]" />
              <span>LIGHT</span>
            </>
          ) : (
            <>
              <Moon className="h-3.5 w-3.5 text-[var(--accent)]" />
              <span>DARK</span>
            </>
          )}
        </button>
      </div>

      {/* 에디토리얼 매거진 & 북 커버 헤더 */}
      <header className="relative mb-8 border-b-2 border-[var(--border-main)] pb-6">
        <div className="mb-3 flex items-center justify-between text-[11px] tracking-widest text-[var(--text-muted)] uppercase">
          <span className="font-editorial italic">Vol. 2026 — Personal Archive</span>
          <span className="font-editorial">No. {String(entries.length).padStart(2, "0")}</span>
        </div>

        <div className="relative">
          <p className="font-editorial text-xs italic tracking-wide text-[var(--text-muted)] sm:text-sm">
            The Invisible Rules of Taste &amp; Stories
          </p>
          <h1 className="font-editorial mt-1 text-4xl font-bold leading-none tracking-tight text-[var(--accent)] sm:text-6xl">
            READING
            <span className="block text-[var(--text-main)]">IN CHECK</span>
          </h1>

          {/* 우측 펜화 책 오브제 */}
          <svg
            viewBox="0 0 120 90"
            className="pointer-events-none absolute right-0 bottom-0 hidden h-20 w-28 text-[var(--text-main)] sm:block"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M18 68 C35 60, 50 62, 60 70 C70 62, 85 60, 102 68 L102 24 C85 16, 70 18, 60 26 C50 18, 35 16, 18 24 Z"
              fill="var(--bg-surface)"
            />
            <line x1="60" y1="26" x2="60" y2="70" />
            <path d="M26 32 Q42 28 52 34" strokeWidth="1" />
            <path d="M26 41 Q42 37 52 43" strokeWidth="1" />
            <path d="M26 50 Q42 46 52 52" strokeWidth="1" />
            <path d="M68 34 Q78 28 94 32" strokeWidth="1" />
            <path d="M68 43 Q78 37 94 41" strokeWidth="1" />
            <path d="M76 20 L76 54 L80 49 L84 54 L84 19" fill="var(--accent)" />
          </svg>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <span>서재의 한 줄 — 책과 웹툰의 문장을 수집하는 개인 기록지</span>
          <span className="font-editorial italic text-[var(--accent)]">
            “Everything changes when you read.”
          </span>
        </div>
      </header>

      {/* 목차(Index) 스타일 3개 탭 내비게이션 */}
      <nav className="mb-8 grid grid-cols-3 border border-[var(--border-main)] bg-[var(--bg-surface)]">
        <button
          type="button"
          onClick={() => setActiveTab("record")}
          className={`border-r border-[var(--border-main)] py-3 text-xs font-bold tracking-tight transition sm:text-sm ${
            activeTab === "record"
              ? "bg-[var(--text-main)] text-[var(--bg-page)]"
              : "text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
          }`}
        >
          <span className="font-editorial mr-1.5 italic opacity-75">01.</span>
          감상 기록
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("library")}
          className={`border-r border-[var(--border-main)] py-3 text-xs font-bold tracking-tight transition sm:text-sm ${
            activeTab === "library"
              ? "bg-[var(--text-main)] text-[var(--bg-page)]"
              : "text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
          }`}
        >
          <span className="font-editorial mr-1.5 italic opacity-75">02.</span>
          서재 목록 ({entries.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("report")}
          className={`py-3 text-xs font-bold tracking-tight transition sm:text-sm ${
            activeTab === "report"
              ? "bg-[var(--accent)] text-[var(--accent-text)]"
              : "text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
          }`}
        >
          <span className="font-editorial mr-1.5 italic opacity-80">03.</span>
          AI 서평 분석
        </button>
      </nav>

      {/* 탭 본문 */}
      {activeTab === "record" && (
        <RecordTab onAddEntry={handleAddEntry} recentEntries={entries} />
      )}
      {activeTab === "library" && (
        <LibraryTab
          entries={entries}
          onDeleteEntry={handleDeleteEntry}
          onToggleStatus={handleToggleStatus}
        />
      )}
      {activeTab === "report" && <ReportTab entries={entries} />}
    </main>
  );
}