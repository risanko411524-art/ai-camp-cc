import { getAllAchievements, addAchievement } from "@/lib/achievements";

export async function GET() {
  const achievements = getAllAchievements();
  return Response.json({ achievements });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, job, revenueBefore, revenueAfter, strategy, message } = body;

  if (!name || !strategy || !message) {
    return Response.json({ error: "必須項目が入力されていません" }, { status: 400 });
  }

  const achievement = addAchievement({
    name,
    job: job || "",
    revenueBefore: Number(revenueBefore) || 0,
    revenueAfter: Number(revenueAfter) || 0,
    strategy,
    message,
  });

  return Response.json({ achievement });
}
