import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.TEACHER_PASSWORD;

    if (!correctPassword || password !== correctPassword) {
      return NextResponse.json({ error: "パスワードが違います" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set("teacher_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "エラーが発生しました" }, { status: 500 });
  }
}
