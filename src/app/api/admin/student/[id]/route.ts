import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const password = request.headers.get("x-admin-password");
  if (password !== process.env.TEACHER_PASSWORD) {
    return NextResponse.json({ error: "認証に失敗しました" }, { status: 401 });
  }

  const { id } = await params;

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (studentError || !student) {
    return NextResponse.json({ error: "受講生が見つかりません" }, { status: 404 });
  }

  const { data: logs, error: logsError } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("student_id", id)
    .order("date", { ascending: false });

  if (logsError) {
    return NextResponse.json({ error: "ログの取得に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ student, logs: logs || [] });
}
