import { MediaType, MonthlySummary, ReadingEntry, ReadingStatus, SortOption } from "./types";

export function filterEntries(
  entries: ReadingEntry[],
  mediaFilter: MediaType | "전체" = "전체",
  statusFilter: ReadingStatus | "전체" = "전체"
): ReadingEntry[] {
  return entries.filter((item) => {
    const matchMedia = mediaFilter === "전체" || item.mediaType === mediaFilter;
    const matchStatus = statusFilter === "전체" || item.status === statusFilter;
    return matchMedia && matchStatus;
  });
}

export function sortEntries(entries: ReadingEntry[], sortBy: SortOption = "date-desc"): ReadingEntry[] {
  return [...entries].sort((a, b) => {
    if (sortBy === "date-desc") {
      return b.date.localeCompare(a.date);
    }
    if (sortBy === "date-asc") {
      return a.date.localeCompare(b.date);
    }
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    return b.date.localeCompare(a.date);
  });
}

export function summarizeByMonth(entries: ReadingEntry[], targetMonth: string): MonthlySummary {
  const monthly = entries.filter((item) => item.date.startsWith(targetMonth));
  const totalCount = monthly.length;

  if (totalCount === 0) {
    return {
      month: targetMonth,
      totalCount: 0,
      completedCount: 0,
      averageRating: 0,
      bookCount: 0,
      webtoonCount: 0,
    };
  }

  const completedCount = monthly.filter((item) => item.status === "완독").length;
  const bookCount = monthly.filter((item) => item.mediaType === "책").length;
  const webtoonCount = monthly.filter((item) => item.mediaType === "웹툰").length;
  const sumRating = monthly.reduce((acc, item) => acc + item.rating, 0);
  const averageRating = Math.round((sumRating / totalCount) * 10) / 10;

  return {
    month: targetMonth,
    totalCount,
    completedCount,
    averageRating,
    bookCount,
    webtoonCount,
  };
}