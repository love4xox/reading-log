import { describe, expect, it } from "vitest";
import { filterEntries, sortEntries, summarizeByMonth } from "./stats";
import { ReadingEntry } from "./types";

const sampleEntries: ReadingEntry[] = [
  {
    id: "1",
    title: "나미야 잡화점의 기적",
    mediaType: "책",
    status: "완독",
    rating: 5,
    date: "2026-11-05",
    review: "따뜻한 연결고리가 여운이 남는다.",
  },
  {
    id: "2",
    title: "화산귀환",
    mediaType: "웹툰",
    status: "보는 중",
    rating: 4,
    date: "2026-11-12",
    review: "전개가 시원시원해서 멈출 수가 없다.",
  },
  {
    id: "3",
    title: "물고기는 존재하지 않는다",
    mediaType: "책",
    status: "완독",
    rating: 5,
    date: "2026-11-20",
    review: "질서에 대한 집착을 다시 생각하게 됨.",
  },
  {
    id: "4",
    title: "전지적 독자 시점",
    mediaType: "웹툰",
    status: "완독",
    rating: 3,
    date: "2026-10-18",
    review: "세계관 설정이 탄탄하다.",
  },
];

describe("reading-log 규칙 로직 테스트", () => {
  it("매체와 완독 상태로 정확히 필터링한다", () => {
    const completedBooks = filterEntries(sampleEntries, "책", "완독");
    expect(completedBooks).toHaveLength(2);
    expect(completedBooks.map((e) => e.id)).toEqual(["1", "3"]);

    const allWebtoons = filterEntries(sampleEntries, "웹툰", "전체");
    expect(allWebtoons).toHaveLength(2);
  });

  it("최신순, 오래된순, 별점 높은순으로 정확히 정렬한다", () => {
    const latest = sortEntries(sampleEntries, "date-desc");
    expect(latest[0].id).toBe("3");

    const oldest = sortEntries(sampleEntries, "date-asc");
    expect(oldest[0].id).toBe("4");

    const topRated = sortEntries(sampleEntries, "rating-desc");
    expect(topRated.map((e) => e.id)).toEqual(["3", "1", "2", "4"]);
  });

  it("특정 월(YYYY-MM)의 총 편수, 완독 편수, 평균 별점을 정확히 집계한다", () => {
    const novSummary = summarizeByMonth(sampleEntries, "2026-11");
    expect(novSummary).toEqual({
      month: "2026-11",
      totalCount: 3,
      completedCount: 2,
      averageRating: 4.7,
      bookCount: 2,
      webtoonCount: 1,
    });
  });

  it("기록이 없는 달은 0으로 안전하게 반환한다", () => {
    const emptySummary = summarizeByMonth(sampleEntries, "2026-01");
    expect(emptySummary.totalCount).toBe(0);
    expect(emptySummary.averageRating).toBe(0);
  });
});