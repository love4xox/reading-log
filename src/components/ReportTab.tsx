"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { summarizeByMonth } from "@/lib/stats";
import { ReadingEntry } from "@/lib/types";

interface ReportTabProps {
  entries: ReadingEntry[];
}

export default function ReportTab({ entries }: ReportTabProps) {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [reportText, setReportText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setSelectedMonth(new Date().toISOString().slice(0, 7));
  }, []);

  const summary = summarizeByMonth(entries, selectedMonth);

  const handleGenerateReport = async () => {
    if (!selectedMonth) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries, month: selectedMonth }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "리포트 생성에 실패했습니다.");
      } else {
        setReportText(data.report);
      }
    } catch {
      setErrorMsg("서버와 통신하는 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        style={{ boxShadow: "4px 4px 0px var(--accent)" }}
        className="border border-[var(--border-main)] bg-[var(--bg-surface)] p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3.5">
          <div>
            <span className="font-editorial block text-xs italic text-[var(--accent)]">
              Monthly Editorial Review
            </span>
            <span className="text-base font-bold text-[var(--text-main)]">
              이달의 독서 패턴 결산
            </span>
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              setReportText("");
              setErrorMsg("");
            }}
            className="border border-[var(--border-main)] bg-[var(--bg-input)] px-3 py-1.5 text-xs font-bold text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="grid grid-cols-3 border border-[var(--border-main)] bg-[var(--bg-input)] text-center">
          <div className="border-r border-[var(--border-main)] p-4">
            <div className="font-editorial text-xs italic text-[var(--text-muted)]">
              Total
            </div>
            <div className="mt-1 text-xl font-bold text-[var(--text-main)]">
              {summary.totalCount}편
            </div>
            <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
              책 {summary.bookCount} · 웹툰 {summary.webtoonCount}
            </div>
          </div>

          <div className="border-r border-[var(--border-main)] p-4">
            <div className="font-editorial text-xs italic text-[var(--text-muted)]">
              Completed
            </div>
            <div className="mt-1 text-xl font-bold text-[var(--accent)]">
              {summary.completedCount}편
            </div>
            <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
              완독 달성
            </div>
          </div>

          <div className="p-4">
            <div className="font-editorial text-xs italic text-[var(--text-muted)]">
              Rating
            </div>
            <div className="mt-1 text-xl font-bold text-[var(--text-main)]">
              ★ {summary.averageRating}
            </div>
            <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
              평균 별점
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerateReport}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 border border-[var(--border-main)] bg-[var(--accent)] py-3.5 text-sm font-bold tracking-wide text-[var(--accent-text)] transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>이달의 서평 칼럼을 집필하는 중...</span>
            </>
          ) : (
            <span>AI 월말 서평 리포트 발행하기 →</span>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="border border-[#DC2626] bg-[#FEF2F2] p-4 text-xs font-medium text-[#991B1B]">
          {errorMsg}
        </div>
      )}

      {reportText && (
        <article
          style={{ boxShadow: "5px 5px 0px var(--shadow-color)" }}
          className="border-2 border-[var(--border-main)] bg-[var(--bg-surface)] p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-3">
            <span className="bg-[var(--text-main)] px-2.5 py-1 text-xs font-bold text-[var(--bg-page)]">
              {selectedMonth} CURATION ISSUE
            </span>
            <span className="font-editorial text-xs italic text-[var(--accent)]">
              By AI Literary Editor
            </span>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-main)]">
            {reportText}
          </div>
        </article>
      )}
    </div>
  );
}