import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const auth = cookieStore.get("teacher_auth");
    if (!auth || auth.value !== "authenticated") {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { id } = await params;

    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: "受講生が見つかりません" }, { status: 404 });
    }

    const { data: logs } = await supabaseAdmin
      .from("daily_logs")
      .select("*")
      .eq("student_id", id)
      .order("date", { ascending: false });

    return NextResponse.json({ student, logs: logs || [] });
  } catch {
    return NextResponse.json({ error: "エラーが発生しました" }, { status: 500 });
  }
}
