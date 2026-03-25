import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const GROUPS: Record<string, { name: string; description: string }> = {
  A: {
    name: "やりたいこと探索グループ",
    description: "やりたいことがまだ見つかっていない仲間と一緒に、自分だけの方向性を見つけていきましょう！",
  },
  B: {
    name: "強み発見グループ",
    description: "自分の強みがわからない仲間と一緒に、あなただけの武器を見つけていきましょう！",
  },
  C: {
    name: "はじめの一歩グループ",
    description: "一歩を踏み出せない仲間と一緒に、行動できる自分に変わっていきましょう！",
  },
};

async function fetchChatLinks(): Promise<Record<string, string>> {
  const csvUrl = process.env.GOOGLE_SHEET_CSV_URL;
  if (!csvUrl) return {};

  try {
    const res = await fetch(csvUrl, { next: { revalidate: 60 } });
    const text = await res.text();
    const lines = text.trim().split("\n");
    const links: Record<string, string> = {};

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");
      if (cols.length >= 3) {
        const groupKey = cols[0].trim();
        const link = cols[2].trim();
        if (groupKey && link) links[groupKey] = link;
      }
    }
    return links;
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  const studentNumber = request.cookies.get("student_session")?.value;

  if (!studentNumber) {
    return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
  }

  const { data: student, error } = await supabaseAdmin
    .from("submissions")
    .select("name, email, gender, location, career, concern, ideal_future, available_hours, ai_level, group_key, photo_url, student_number, created_at")
    .eq("student_number", parseInt(studentNumber, 10))
    .single();

  if (error || !student) {
    return NextResponse.json({ error: "プロフィールが見つかりません" }, { status: 404 });
  }

  const groupInfo = GROUPS[student.group_key] || null;
  const chatLinks = await fetchChatLinks();
  const chatLink = chatLinks[student.group_key] || null;

  return NextResponse.json({
    profile: {
      ...student,
      studentId: `TSU-${String(student.student_number).padStart(4, "0")}`,
    },
    group: groupInfo,
    chatLink,
  });
}
