import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { studentId, password } = await request.json();

    if (!studentId) {
      return NextResponse.json({ error: "受講生IDを入力してください" }, { status: 400 });
    }

    // TSU-0001 → 1
    const match = studentId.match(/^TSU-(\d+)$/i);
    if (!match) {
      return NextResponse.json({ error: "受講生IDの形式が正しくありません" }, { status: 400 });
    }
    const studentNumber = parseInt(match[1], 10);

    const { data: student, error } = await supabaseAdmin
      .from("submissions")
      .select("id, student_number, password_hash, name")
      .eq("student_number", studentNumber)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: "受講生IDが見つかりません" }, { status: 404 });
    }

    // パスワード未設定 → 初回設定へ
    if (!student.password_hash) {
      return NextResponse.json({ needsPassword: true, studentId });
    }

    // パスワード照合
    if (!password) {
      return NextResponse.json({ error: "パスワードを入力してください" }, { status: 400 });
    }

    const valid = await bcrypt.compare(password, student.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "パスワードが違います" }, { status: 401 });
    }

    // Cookie設定
    const res = NextResponse.json({ success: true });
    res.cookies.set("student_session", String(student.student_number), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30日
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Student login error:", err);
    return NextResponse.json({ error: "エラーが発生しました" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("student_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
