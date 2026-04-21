import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { activities, description, studentName } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

    const activityList = Object.entries(activities as Record<string, boolean>)
      .filter(([, val]) => val)
      .map(([key]) => {
        const labels: Record<string, string> = {
          group_consulting: "グルコン参加",
          core_live: "コアライブ参加",
          seminar: "セミナー参加",
          content_viewing: "コンテンツ視聴",
          sns_reel: "リール投稿",
          sns_threads: "スレッズ投稿",
          sns_stories: "ストーリーズ投稿",
          sns_live: "ライブ配信",
          sales_offer: "セールス・オファー",
        };
        return labels[key] || key;
      });

    const prompt = `あなたは「りさ」というビジネス講師のキャラクターです。バナナの着ぐるみを着た、明るくて温かいキャラクターです。

受講生「${studentName}」さんが今日の活動を報告してくれました。

【今日やったこと】
${activityList.length > 0 ? activityList.join("、") : "（まだチェックなし）"}

【詳細メモ】
${description || "（なし）"}

以下の条件でりさからの応援メッセージを1つ作ってください：
- 2〜3文で短く
- 具体的に行動を褒める
- 絵文字を1〜2個使う
- 親しみやすく、温かいトーン
- 次のアクションを軽く促す`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Claude API error: ${res.status}`);
    }

    const data = await res.json();
    const message = data.content[0].text.trim();

    return NextResponse.json({ message });
  } catch (error) {
    console.error("AI message error:", error);
    return NextResponse.json(
      { message: "今日も頑張ったね！明日も一歩ずつ進んでいこう 🍌" },
      { status: 200 }
    );
  }
}
