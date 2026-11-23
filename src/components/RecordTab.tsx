"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { MediaType, ReadingEntry, ReadingStatus } from "@/lib/types";

interface RecordTabProps {
  onAddEntry: (entry: ReadingEntry) => void;
  recentEntries: ReadingEntry[];
}

export default function RecordTab({ onAddEntry, recentEntries }: RecordTabProps) {
  const [title, setTitle] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>("책");
  const [status, setStatus] = useState<ReadingStatus>("완독");
  const [rating, setRating] = useState<number>(5);
  const [date, setDate] = useState<string>("");
  const [review, setReview] = useState("");
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    setDate(new Date().toISOString().slice(0, 10));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEntry: ReadingEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      mediaType,
      status,
      rating,
      date: date || new Date().toISOString().slice(0, 10),
      review: review.trim(),
    };

    onAddEntry(newEntry);
    setTitle("");
    setReview("");
    setRating(5);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2200);
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        style={{ boxShadow: "4px 4px 0px var(--shadow-color)" }}
        className="border border-[var(--border-main)] bg-[var(--bg-surface)] p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-xs italic text-[var(--accent)]">
              Entry Form
            </span>
            <span className="text-sm font-bold text-[var(--text-main)]">
              새 작품 기록하기
            </span>
          </div>
          {savedNotice && (
            <span className="bg-[var(--accent)] px-2.5 py-0.5 text-xs font-bold text-[var(--accent-text)]">
              ARCHIVED ✓
            </span>
          )}
        </div>

        {/* 작품명 */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[var(--text-main)]">
            작품 제목 *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 불편한 편의점, 화산귀환"
            className="w-full border border-[var(--border-main)] bg-[var(--bg-input)] px-3.5 py-2.5 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--accent)]"
          />
        </div>

        {/* 매체 / 상태 / 날짜 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-main)]">
              갈래
            </label>
            <div className="grid grid-cols-2 border border-[var(--border-main)] bg-[var(--bg-input)]">
              {(["책", "웹툰"] as MediaType[]).map((type, idx) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMediaType(type)}
                  className={`py-2 text-xs font-bold transition ${
                    idx === 0 ? "border-r border-[var(--border-main)]" : ""
                  } ${
                    mediaType === type
                      ? "bg-[var(--accent)] text-[var(--accent-text)]"
                      : "text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-main)]">
              감상 상태
            </label>
            <div className="grid grid-cols-2 border border-[var(--border-main)] bg-[var(--bg-input)]">
              {(["완독", "보는 중"] as ReadingStatus[]).map((st, idx) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-2 text-xs font-bold transition ${
                    idx === 0 ? "border-r border-[var(--border-main)]" : ""
                  } ${
                    status === st
                      ? "bg-[var(--text-main)] text-[var(--bg-page)]"
                      : "text-[var(--text-main)] hover:bg-[var(--bg-hover)]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[var(--text-main)]">
              기록일
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-1.5 text-xs font-medium text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        {/* 별점 */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[var(--text-main)]">
            만족도 평점 ({rating}.0 / 5.0)
          </label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-0.5 transition hover:scale-110"
                aria-label={`${star}점`}
              >
                <Star
                  className="h-6 w-6"
                  style={{
                    fill: star <= rating ? "var(--accent)" : "transparent",
                    color: star <= rating ? "var(--accent)" : "var(--border-subtle)",
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* 한 줄 감상 */}
        <div>
          <label className="mb-1.5 block text-xs font-bold text-[var(--text-main)]">
            밑줄 친 문장 / 한 줄 서평
          </label>
          <textarea
            rows={2}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="작품을 덮으며 남기고 싶은 문장이나 짧은 단상을 기록하세요."
            className="w-full resize-none border border-[var(--border-main)] bg-[var(--bg-input)] px-3.5 py-2.5 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--accent)]"
          />
        </div>

        <button
          type="submit"
          className="w-full border border-[var(--border-main)] bg-[var(--text-main)] py-3 text-sm font-bold tracking-wider text-[var(--bg-page)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-text)]"
        >
          아카이브에 기록 추가 →
        </button>
      </form>

      {/* 최근 아카이브 인덱스 */}
      <div className="border border-[var(--border-main)] bg-[var(--bg-surface)] p-5">
        <div className="mb-3 flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
          <span className="text-xs font-bold text-[var(--text-main)]">
            최근 수록된 작품 ({recentEntries.length}편)
          </span>
          <span className="font-editorial text-xs italic text-[var(--text-muted)]">
            Recent Index
          </span>
        </div>
        {recentEntries.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">
            아직 수록된 기록이 없습니다. 위 폼에서 첫 작품을 남겨보세요.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {recentEntries.slice(0, 3).map((item, idx) => (
              <li
                key={item.id}
                className="flex items-center justify-between py-2.5 text-xs"
              >
                <div className="truncate pr-3">
                  <span className="font-editorial mr-2 italic text-[var(--accent)]">
                    0{idx + 1}.
                  </span>
                  <span className="mr-2 border border-[var(--border-main)] px-1.5 py-0.5 text-[10px] font-bold">
                    {item.mediaType}
                  </span>
                  <span className="font-bold text-[var(--text-main)]">{item.title}</span>
                  {item.review && (
                    <span className="ml-2 text-[var(--text-muted)]">— {item.review}</span>
                  )}
                </div>
                <span className="font-editorial shrink-0 font-bold text-[var(--accent)]">
                  ★ {item.rating}.0
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}