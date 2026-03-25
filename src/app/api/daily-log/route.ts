import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getStudentId } from "@/lib/auth";

async function generateRisaMessage(
  studentName: string,
  activities: Record<string, boolean>,
  description: string,
  streak: number,
  challenge: string,
  idealFuture: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return "今日もお疲れさま！一歩一歩、前に進んでいるよ！🍌";

  const checkedItems = Object.entries(activities)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join("、");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `あなたは「りさ」というビジネス講師キャラクターです。
バナナが大好きで、明るく元気で、受講生を温かく励ますのが得意です。
口調はカジュアルで親しみやすく、時々バナナに関する例えを使います。

以下の受講生の今日の活動に対して、50〜100文字程度の励ましメッセージを書いてください。

受講生名: ${studentName}
連続入力日数: ${streak}日
今日やったこと: ${checkedItems || "なし"}
詳細: ${description || "なし"}
受講生の課題: ${challenge || "なし"}
受講生の目標: ${idealFuture || "なし"}

ポイント:
- 具体的にやったことを褒める
- 連続日数が長ければ特に称える
- 次のステップへの軽いアドバイス
- バナナの絵文字🍌を1-2個使う`,
        },
      ],
    }),
  });

  if (!res.ok) {
    return "今日もお疲れさま！一歩一歩、前に進んでいるよ！🍌";
  }

  const data = await res.json();
  return data.content[0].text.trim();
}

export async function POST(request: NextRequest) {
  try {
    const studentId = await getStudentId();
    if (!studentId) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const body = await request.json();
    const {
      grucon,
      core_live,
      seminar,
      content_watch,
      sns_reel,
      sns_threads,
      sns_stories,
      sns_live,
      sales_offer,
      description,
    } = body;

    // Get student info for personalized message
    const { data: student } = await supabaseAdmin
      .from("students")
      .select("name, current_challenge, ideal_future")
      .eq("id", studentId)
      .single();

    // Calculate streak
    const { data: recentLogs } = await supabaseAdmin
      .from("daily_logs")
      .select("date")
      .eq("student_id", studentId)
      .order("date", { ascending: false })
      .limit(60);

    let streak = 1;
    if (recentLogs && recentLogs.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (let i = 0; i < recentLogs.length; i++) {
        const logDate = new Date(recentLogs[i].date);
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - (i + 1));
        if (logDate.toISOString().split("T")[0] === expectedDate.toISOString().split("T")[0]) {
          streak++;
        } else {
          break;
        }
      }
    }

    // Generate AI message
    const activities = {
      グルコン: grucon,
      コアライブ: core_live,
      セミナー: seminar,
      コンテンツ視聴: content_watch,
      リール: sns_reel,
      スレッズ: sns_threads,
      ストーリーズ: sns_stories,
      ライブ: sns_live,
      "セールス・オファー": sales_offer,
    };

    const aiMessage = await generateRisaMessage(
      student?.name || "",
      activities,
      description || "",
      streak,
      student?.current_challenge || "",
      student?.ideal_future || ""
    );

    const today = new Date().toISOString().split("T")[0];

    // Upsert daily log (one per day per student)
    const { data, error } = await supabaseAdmin
      .from("daily_logs")
      .upsert(
        {
          student_id: studentId,
          date: today,
          grucon: grucon || false,
          core_live: core_live || false,
          seminar: seminar || false,
          content_watch: content_watch || false,
          sns_reel: sns_reel || false,
          sns_threads: sns_threads || false,
          sns_stories: sns_stories || false,
          sns_live: sns_live || false,
          sales_offer: sales_offer || false,
          description: description || "",
          ai_message: aiMessage,
        },
        { onConflict: "student_id,date" }
      )
      .select()
      .single();

    if (error) {
      console.error("Daily log error:", error);
      return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, log: data, aiMessage, streak });
  } catch (error) {
    console.error("Daily log error:", error);
    return NextResponse.json({ error: "エラーが発生しました" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const studentId = await getStudentId();
    if (!studentId) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    // Get student profile
    const { data: student } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    // Get all logs
    const { data: logs } = await supabaseAdmin
      .from("daily_logs")
      .select("*")
      .eq("student_id", studentId)
      .order("date", { ascending: false });

    return NextResponse.json({ student, logs: logs || [] });
  } catch {
    return NextResponse.json({ error: "エラーが発生しました" }, { status: 500 });
  }
}
