import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("teacher_auth");
  if (!cookie || cookie.value !== "authenticated") {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ members: data });
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return NextResponse.json({ error: "データの取得に失敗しました" }, { status: 500 });
  }
}
