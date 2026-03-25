import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const auth = cookieStore.get("teacher_auth");
    if (!auth || auth.value !== "authenticated") {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // Get all students with their latest log date and log count
    const { data: students, error } = await supabaseAdmin
      .from("students")
      .select("id, name, email, business_stage, missing_element, current_challenge, ideal_future, monthly_goals, main_task, other_info, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
    }

    // Get daily logs for each student
    const { data: allLogs } = await supabaseAdmin
      .from("daily_logs")
      .select("student_id, date")
      .order("date", { ascending: false });

    const logsByStudent: Record<string, { lastDate: string; count: number }> = {};
    if (allLogs) {
      for (const log of allLogs) {
        if (!logsByStudent[log.student_id]) {
          logsByStudent[log.student_id] = { lastDate: log.date, count: 0 };
        }
        logsByStudent[log.student_id].count++;
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const enrichedStudents = (students || []).map((s) => {
      const logInfo = logsByStudent[s.id];
      const lastLogDate = logInfo?.lastDate;
      let daysSinceLastLog = -1;
      if (lastLogDate) {
        const last = new Date(lastLogDate);
        last.setHours(0, 0, 0, 0);
        daysSinceLastLog = Math.floor(
          (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      return {
        ...s,
        last_log_date: lastLogDate || null,
        log_count: logInfo?.count || 0,
        days_since_last_log: daysSinceLastLog,
        needs_alert: daysSinceLastLog >= 3 || daysSinceLastLog === -1,
      };
    });

    return NextResponse.json({ students: enrichedStudents });
  } catch {
    return NextResponse.json({ error: "エラーが発生しました" }, { status: 500 });
  }
}
