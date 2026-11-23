export type MediaType = "책" | "웹툰";
export type ReadingStatus = "완독" | "보는 중";
export type SortOption = "date-desc" | "date-asc" | "rating-desc";

export interface ReadingEntry {
  id: string;
  title: string;
  mediaType: MediaType;
  status: ReadingStatus;
  rating: number; // 1 ~ 5
  date: string;   // YYYY-MM-DD
  review: string;
}

export interface MonthlySummary {
  month: string;       // YYYY-MM
  totalCount: number;
  completedCount: number;
  averageRating: number;
  bookCount: number;
  webtoonCount: number;
}