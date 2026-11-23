import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { summarizeByMonth } from "@/lib/stats";
import { ReadingEntry } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const entries: ReadingEntry[] = Array.isArray(body.entries) ? body.entries : [];
    const targetMonth: string = typeof body.month === "string" ? body.month : "";

    if (!targetMonth) {
      return NextResponse.json(
        { error: "조회할 월(YYYY-MM)을 지정해 주세요." },
        { status: 400 }
      );
    }

    // 1. 순수 규칙 함수로 통계와 해당 월 기록 필터링
    const summary = summarizeByMonth(entries, targetMonth);
    const monthlyEntries = entries.filter((item) => item.date.startsWith(targetMonth));

    // 기록이 0건인 달은 AI 호출 없이 바로 안내 응답 반환
    if (summary.totalCount === 0) {
      return NextResponse.json({
        summary,
        report: `${targetMonth}에는 아직 기록된 책이나 웹툰이 없어요. 첫 한 줄 감상을 남기면 월말 취향 리포트를 작성해 드릴게요!`,
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "서버에 GEMINI_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인해 주세요." },
        { status: 500 }
      );
    }

    // 2. Gemini API 호출 (판단·취향 요약 담당)
    const ai = new GoogleGenAI({ apiKey });

    const formattedList = monthlyEntries
      .map(
        (item, idx) =>
          `${idx + 1}. [${item.mediaType}/${item.status}] 《${item.title}》 (★${item.rating}/5, ${item.date}) - "${item.review || "한 줄 감상 없음"}"`
      )
      .join("\n");

    const prompt = `당신은 따뜻하고 다정한 개인 서재 큐레이터입니다.
사용자의 ${targetMonth} 독서 및 웹툰 감상 기록을 바탕으로 노션 문서에 기록하기 좋은 월말 취향 리포트를 작성해 주세요.

[통계 요약]
- 총 감상 편수: ${summary.totalCount}편 (책 ${summary.bookCount}편, 웹툰 ${summary.webtoonCount}편)
- 완독 편수: ${summary.completedCount}편
- 평균 별점: ${summary.averageRating}점 / 5점

[감상 목록]
${formattedList}

[작성 형식]
아래 3가지 항목으로 깔끔하고 따뜻하게 정리해 주세요 (과장된 수식어 없이 담백하고 다정한 어조 유지):
1. 🏷️ 이달의 취향 키워드 3가지 (해시태그 형태와 짧은 이유)
2. ✨ 이달의 하이라이트 작품 코멘트 (별점과 한 줄 감상을 근거로 2~3문장)
3. 🌱 다음 달을 위한 작은 감상 제안 (1~2문장)`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({
      summary,
      report: response.text ?? "리포트 내용을 생성하지 못했습니다.",
    });
  } catch (error) {
    console.error("Report API Error:", error);
    return NextResponse.json(
      { error: "리포트 생성 중 오류가 발생했습니다. API 키와 네트워크 상태를 확인해 주세요." },
      { status: 500 }
    );
  }
}