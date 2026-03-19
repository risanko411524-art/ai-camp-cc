import { NextRequest, NextResponse } from "next/server";

const GROUPS = {
  A: { name: "やりたいこと探索グループ" },
  B: { name: "強み発見グループ" },
  C: { name: "はじめの一歩グループ" },
} as const;

type GroupKey = keyof typeof GROUPS;

async function classifyWithClaude(concern: string, idealFuture: string): Promise<GroupKey> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 10,
      messages: [
        {
          role: "user",
          content: `あなたはビジネス初心者の受講生を3つのグループに分類するアシスタントです。

以下の3グループのうち、最も適切なグループを1つだけ選んでください。
回答はA、B、Cのいずれか1文字のみで答えてください。

【グループA: やりたいこと探索グループ】
対象: やりたいことがまだ見つかっていない、何から始めればいいかわからない人
特徴: 漠然とした不安、方向性が定まっていない、選択肢が多すぎて決められない

【グループB: 強み発見グループ】
対象: やりたいことはぼんやりあるが、自分の強み・スキルがわからない人
特徴: 自分に自信がない、何が得意かわからない、差別化できるものがないと思っている

【グループC: はじめの一歩グループ】
対象: やりたいことも強みもなんとなくわかるが、行動に移せない人
特徴: 完璧主義、失敗が怖い、具体的な進め方がわからない

---
【受講生のお悩み】
${concern}

【3ヶ月後の理想の未来】
${idealFuture}

回答（A, B, Cのいずれか1文字）:`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Claude API error: ${res.status} ${errorBody}`);
  }

  const data = await res.json();
  const answer = data.content[0].text.trim().toUpperCase();

  if (answer === "A" || answer === "B" || answer === "C") {
    return answer;
  }
  if (answer.includes("A")) return "A";
  if (answer.includes("B")) return "B";
  if (answer.includes("C")) return "C";
  return "B";
}

export async function POST(request: NextRequest) {
  try {
    const { name, concern, idealFuture } = await request.json();

    if (!name || !concern || !idealFuture) {
      return NextResponse.json(
        { error: "すべての項目を入力してください" },
        { status: 400 }
      );
    }

    const group = await classifyWithClaude(concern, idealFuture);
    console.log(`Classified ${name} -> Group ${group} (${GROUPS[group].name})`);

    return NextResponse.json({
      success: true,
      group,
      groupName: GROUPS[group].name,
    });
  } catch (error) {
    console.error("Classification error:", error);
    return NextResponse.json(
      { error: "処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
