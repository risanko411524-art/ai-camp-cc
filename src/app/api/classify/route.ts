import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

function formatStudentNumber(num: number): string {
  return `TSU-${String(num).padStart(4, "0")}`;
}

async function sendStudentNumberEmail(
  email: string,
  name: string,
  studentNumberFormatted: string,
  groupName: string,
) {
  await resend.emails.send({
    from: "The Start Up <onboarding@resend.dev>",
    to: email,
    subject: `【The Start Up】受講生番号のお知らせ（${studentNumberFormatted}）`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #059669; font-size: 24px; margin: 0;">The Start Up</h1>
        </div>
        <div style="background: #f0fdf4; border-radius: 12px; padding: 24px; margin: 20px 0;">
          <p style="margin: 0 0 16px 0; font-size: 16px;">${name} さん、ご登録ありがとうございます！</p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">あなたの受講生番号</p>
          <p style="margin: 0 0 16px 0; font-size: 32px; font-weight: bold; color: #059669; text-align: center; letter-spacing: 2px;">
            ${studentNumberFormatted}
          </p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">配属グループ</p>
          <p style="margin: 0; font-size: 20px; font-weight: bold; text-align: center;">
            ${groupName}
          </p>
        </div>
        <p style="font-size: 13px; color: #888; text-align: center;">
          この番号は講座で使用しますので、大切に保管してください。
        </p>
      </div>
    `,
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const gender = formData.get("gender") as string;
    const location = formData.get("location") as string;
    const career = formData.get("career") as string;
    const concern = formData.get("concern") as string;
    const idealFuture = formData.get("idealFuture") as string;
    const availableHours = formData.get("availableHours") as string;
    const aiLevel = formData.get("aiLevel") as string;
    const photo = formData.get("photo") as File | null;

    if (!name || !concern || !idealFuture) {
      return NextResponse.json(
        { error: "すべての項目を入力してください" },
        { status: 400 }
      );
    }

    const group = await classifyWithClaude(concern, idealFuture);
    console.log(`Classified ${name} -> Group ${group} (${GROUPS[group].name})`);

    let photoUrl: string | null = null;

    if (photo && photo.size > 0) {
      const ext = photo.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const arrayBuffer = await photo.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from("photos")
        .upload(fileName, buffer, {
          contentType: photo.type,
        });

      if (uploadError) {
        console.error("Photo upload error:", uploadError);
      } else {
        const { data: urlData } = supabaseAdmin.storage
          .from("photos")
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }
    }

    const { data: insertedData, error: dbError } = await supabaseAdmin
      .from("submissions")
      .insert({
        name,
        email,
        gender,
        location,
        career,
        concern,
        ideal_future: idealFuture,
        available_hours: availableHours,
        ai_level: aiLevel,
        group_key: group,
        photo_url: photoUrl,
      })
      .select("student_number")
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
    }

    const studentNumber = insertedData?.student_number ?? 0;
    const studentNumberFormatted = formatStudentNumber(studentNumber);

    // メール送信（エラーが出ても処理は続行）
    try {
      await sendStudentNumberEmail(email, name, studentNumberFormatted, GROUPS[group].name);
      console.log(`Email sent to ${email} with student number ${studentNumberFormatted}`);
    } catch (emailError) {
      console.error("Email send error:", emailError);
    }

    return NextResponse.json({
      success: true,
      group,
      groupName: GROUPS[group].name,
      studentNumber: studentNumberFormatted,
    });
  } catch (error) {
    console.error("Classification error:", error);
    return NextResponse.json(
      { error: "処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
