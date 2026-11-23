"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { filterEntries, sortEntries } from "@/lib/stats";
import { MediaType, ReadingEntry, ReadingStatus, SortOption } from "@/lib/types";

interface LibraryTabProps {
  entries: ReadingEntry[];
  onDeleteEntry: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export default function LibraryTab({
  entries,
  onDeleteEntry,
  onToggleStatus,
}: LibraryTabProps) {
  const [mediaFilter, setMediaFilter] = useState<MediaType | "전체">("전체");
  const [statusFilter, setStatusFilter] = useState<ReadingStatus | "전체">("전체");
  const [sortBy, setSortBy] = useState<SortOption>("date-desc");

  const filtered = filterEntries(entries, mediaFilter, statusFilter);
  const displayed = sortEntries(filtered, sortBy);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--border-main)] bg-[var(--bg-surface)] p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {(["전체", "책", "웹툰"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMediaFilter(m)}
              className={`border px-2.5 py-1 text-xs font-bold transition ${
                mediaFilter === m
                  ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-text)]"
                  : "border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {m}
            </button>
          ))}
          <span className="mx-1 text-[var(--text-muted)]">/</span>
          {(["전체", "완독", "보는 중"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`border px-2.5 py-1 text-xs font-bold transition ${
                statusFilter === s
                  ? "border-[var(--text-main)] bg-[var(--text-main)] text-[var(--bg-page)]"
                  : "border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="border border-[var(--border-main)] bg-[var(--bg-input)] px-2.5 py-1 text-xs font-bold text-[var(--text-main)] outline-none"
        >
          <option value="date-desc">최신순</option>
          <option value="date-asc">오래된순</option>
          <option value="rating-desc">별점 높은순</option>
        </select>
      </div>

      {displayed.length === 0 ? (
        <div className="border border-dashed border-[var(--border-main)] bg-[var(--bg-surface)] py-14 text-center text-sm text-[var(--text-muted)]">
          해당 조건의 작품이 아카이브에 없습니다.
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayed.map((item, idx) => {
            const isBook = item.mediaType === "책";
            return (
              <article
                key={item.id}
                style={{ boxShadow: "3px 3px 0px var(--shadow-color)" }}
                className="border border-[var(--border-main)] bg-[var(--bg-surface)] p-5 transition hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-editorial text-xs italic text-[var(--text-muted)]">
                        #{String(idx + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold ${
                          isBook
                            ? "bg-[var(--accent)] text-[var(--accent-text)]"
                            : "border border-[var(--border-main)] bg-[var(--bg-input)] text-[var(--text-main)]"
                        }`}
                      >
                        {item.mediaType}
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleStatus(item.id)}
                        title="클릭하여 완독/보는 중 전환"
                        className={`border border-[var(--border-main)] px-2 py-0.5 text-[11px] font-bold transition ${
                          item.status === "완독"
                            ? "bg-[var(--text-main)] text-[var(--bg-page)]"
                            : "bg-[var(--bg-hover)] text-[var(--text-main)]"
                        }`}
                      >
                        {item.status}
                      </button>
                      <span className="text-xs font-bold text-[var(--accent)]">
                        {"★".repeat(item.rating)}
                        <span className="text-[var(--border-subtle)]">
                          {"★".repeat(5 - item.rating)}
                        </span>
                      </span>
                      <span className="font-editorial text-xs text-[var(--text-muted)]">
                        {item.date}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[var(--text-main)]">
                      {item.title}
                    </h3>
                    {item.review && (
                      <p className="border-l-2 border-[var(--accent)] pl-3 text-sm leading-relaxed text-[var(--text-muted)]">
                        “{item.review}”
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteEntry(item.id)}
                    aria-label="기록 삭제"
                    className="p-1.5 text-[var(--text-muted)] transition hover:text-[#DC2626]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}