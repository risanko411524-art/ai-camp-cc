import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  if (password !== process.env.TEACHER_PASSWORD) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  try {
    const { stageDistribution, missingElementDistribution, totalStudents } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

    const prompt = `あなたはビジネス講座の運営コンサルタントです。以下の受講生データを分析し、講師の「りさ」に向けて具体的なアドバイスをしてください。

【受講生数】${totalStudents}名

【ビジネスステージ分布】
${Object.entries(stageDistribution).map(([stage, count]) => `・${stage}: ${count}名`).join("\n")}

【足りない要素の分布】
${Object.entries(missingElementDistribution).map(([element, count]) => `・${element}: ${count}名`).join("\n")}

以下の形式で分析結果を出力してください：
1. 全体の傾向（2〜3文）
2. 今すぐ提供すべきコンテンツ・情報（箇条書き3つ）
3. グループ全体への具体的アクション提案（箇条書き2つ）

簡潔に、実践的なアドバイスをお願いします。`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Claude API error: ${res.status}`);
    }

    const data = await res.json();
    const analysis = data.content[0].text.trim();

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { analysis: "分析データの取得に失敗しました。" },
      { status: 200 }
    );
  }
}
