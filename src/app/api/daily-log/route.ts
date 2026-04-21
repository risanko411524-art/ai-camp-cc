import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { student_id, ai_message, ...logData } = body;

    if (!student_id) {
      return NextResponse.json({ error: "student_id は必須です" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabaseAdmin
      .from("daily_logs")
      .upsert(
        {
          student_id,
          date: today,
          group_consulting: logData.group_consulting || false,
          core_live: logData.core_live || false,
          seminar: logData.seminar || false,
          content_viewing: logData.content_viewing || false,
          sns_reel: logData.sns_reel || false,
          sns_threads: logData.sns_threads || false,
          sns_stories: logData.sns_stories || false,
          sns_live: logData.sns_live || false,
          sales_offer: logData.sales_offer || false,
          description: logData.description || "",
          ai_message: ai_message || "",
        },
        { onConflict: "student_id,date" }
      )
      .select()
      .single();

    if (error) {
      console.error("Daily log error:", error);
      return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ success: true, log: data });
  } catch (error) {
    console.error("Daily log error:", error);
    return NextResponse.json({ error: "処理中にエラーが発生しました" }, { status: 500 });
  }
}
