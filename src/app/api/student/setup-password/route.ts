import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { studentId, password } = await request.json();

    if (!studentId || !password) {
      return NextResponse.json({ error: "すべての項目を入力してください" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "パスワードは6文字以上で入力してください" }, { status: 400 });
    }

    const match = studentId.match(/^TSU-(\d+)$/i);
    if (!match) {
      return NextResponse.json({ error: "受講生IDの形式が正しくありません" }, { status: 400 });
    }
    const studentNumber = parseInt(match[1], 10);

    const { data: student, error } = await supabaseAdmin
      .from("submissions")
      .select("id, student_number, password_hash")
      .eq("student_number", studentNumber)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: "受講生IDが見つかりません" }, { status: 404 });
    }

    if (student.password_hash) {
      return NextResponse.json({ error: "パスワードは既に設定されています" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 10);

    const { error: updateError } = await supabaseAdmin
      .from("submissions")
      .update({ password_hash: hash })
      .eq("student_number", studentNumber);

    if (updateError) {
      return NextResponse.json({ error: "パスワードの設定に失敗しました" }, { status: 500 });
    }

    // 自動ログイン
    const res = NextResponse.json({ success: true });
    res.cookies.set("student_session", String(studentNumber), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("Setup password error:", err);
    return NextResponse.json({ error: "エラーが発生しました" }, { status: 500 });
  }
}
