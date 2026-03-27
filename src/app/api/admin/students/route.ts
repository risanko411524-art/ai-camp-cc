import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  // 簡易パスワード認証
  const password = request.headers.get("x-admin-password");
  if (password !== process.env.TEACHER_PASSWORD) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  // 全受講生 + 最新の日次ログ日付を取得
  const { data: students, error } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }

  // 各受講生の最新ログ日を取得
  const studentsWithLastLog = await Promise.all(
    (students || []).map(async (student) => {
      const { data: logs } = await supabase
        .from("daily_logs")
        .select("date")
        .eq("student_id", student.id)
        .order("date", { ascending: false })
        .limit(1);

      const lastLogDate = logs && logs.length > 0 ? logs[0].date : null;
      const daysSinceLastLog = lastLogDate
        ? Math.floor(
            (new Date().getTime() - new Date(lastLogDate).getTime()) / (1000 * 60 * 60 * 24)
          )
        : null;

      return {
        ...student,
        last_log_date: lastLogDate,
        days_since_last_log: daysSinceLastLog,
        needs_alert: daysSinceLastLog === null || daysSinceLastLog >= 3,
      };
    })
  );

  return NextResponse.json({ students: studentsWithLastLog });
}
