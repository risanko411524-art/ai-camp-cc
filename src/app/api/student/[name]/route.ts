import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const { data: student, error } = await supabaseAdmin
    .from("students")
    .select("*")
    .eq("name", decodedName)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !student) {
    return NextResponse.json(
      { error: "受講生が見つかりませんでした。先にアンケートを提出してください。" },
      { status: 404 }
    );
  }

  return NextResponse.json({ student });
}
