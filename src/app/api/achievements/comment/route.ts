import { addComment } from "@/lib/achievements";

export async function POST(req: Request) {
  const body = await req.json();
  const { achievementId, name, text } = body;

  if (!achievementId || !name || !text) {
    return Response.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const achievement = addComment(achievementId, name, text);
  if (!achievement) {
    return Response.json({ error: "成果報告が見つかりません" }, { status: 404 });
  }

  return Response.json({ achievement });
}
