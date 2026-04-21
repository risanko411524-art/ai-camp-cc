import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const { studentId } = await params;

  const { data: logs, error } = await supabaseAdmin
    .from("daily_logs")
    .select("*")
    .eq("student_id", studentId)
    .order("date", { ascending: false });

  if (error) {
    console.error("Fetch logs error:", error);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ logs: logs || [] });
}
