import { NextRequest, NextResponse } from "next/server";

const GROUPS = {
  A: {
    name: "やりたいこと探索グループ",
    description: "やりたいことが漠然としていて、まず方向性を見つけたい方向け",
    chatLink: "https://example.com/openchat/group-a",
  },
  B: {
    name: "強み発見グループ",
    description: "やりたいことはぼんやりあるが、自分の強みがわからない方向け",
    chatLink: "https://example.com/openchat/group-b",
  },
  C: {
    name: "はじめの一歩グループ",
    description: "やりたいことも強みもなんとなくわかるが、行動に移せない方向け",
    chatLink: "https://example.com/openchat/group-c",
  },
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
  // fallback: search for A, B, or C in the response
  if (answer.includes("A")) return "A";
  if (answer.includes("B")) return "B";
  if (answer.includes("C")) return "C";
  return "B"; // default fallback
}

async function sendEmailViaConvertKit(
  email: string,
  name: string,
  group: GroupKey
) {
  const apiSecret = process.env.CONVERTKIT_API_SECRET;
  if (!apiSecret) throw new Error("CONVERTKIT_API_SECRET is not set");

  const tagIds: Record<GroupKey, string> = {
    A: process.env.CONVERTKIT_TAG_A || "",
    B: process.env.CONVERTKIT_TAG_B || "",
    C: process.env.CONVERTKIT_TAG_C || "",
  };

  const tagId = tagIds[group];
  if (!tagId) {
    console.warn(`No ConvertKit tag ID for group ${group}, skipping email`);
    return;
  }

  // Tag the subscriber in ConvertKit - this triggers the automation/email sequence
  const res = await fetch(`https://api.convertkit.com/v3/tags/${tagId}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_secret: apiSecret,
      email,
      first_name: name,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`ConvertKit API error: ${res.status} ${errorBody}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, concern, idealFuture } = await request.json();

    if (!name || !email || !concern || !idealFuture) {
      return NextResponse.json(
        { error: "すべての項目を入力してください" },
        { status: 400 }
      );
    }

    // 1. Claude APIで分類
    const group = await classifyWithClaude(concern, idealFuture);
    console.log(`Classified ${email} -> Group ${group} (${GROUPS[group].name})`);

    // 2. ConvertKitでタグ付け → 自動メール送信
    await sendEmailViaConvertKit(email, name, group);
    console.log(`Tagged ${email} in ConvertKit with group ${group}`);

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
