import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      business_stage,
      missing_element,
      current_challenge,
      ideal_future,
      monthly_goals,
      main_task,
      other_info,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "名前、メール、パスワードは必須です" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from("students")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabaseAdmin
      .from("students")
      .insert({
        name,
        email,
        password_hash,
        business_stage,
        missing_element,
        current_challenge,
        ideal_future,
        monthly_goals,
        main_task,
        other_info,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Registration error:", error);
      return NextResponse.json(
        { error: "登録に失敗しました" },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ success: true, studentId: data.id });
    response.cookies.set("student_auth", data.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 }
    );
  }
}
