import { getMembers, getContents, getConcernDistribution, getContentGap, getPreTasks, getAchievements } from "@/lib/data";

export async function GET() {
  const members = getMembers();
  const contents = getContents();
  const concernDistribution = getConcernDistribution();
  const contentGap = getContentGap();
  const preTasks = getPreTasks();
  const achievements = getAchievements();

  const activeMembers = members.filter((m) => m.status === "在籍中");
  const achieverNames = new Set(achievements.map((a) => a.name));

  return Response.json({
    summary: {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      totalContents: contents.length,
      achieverCount: achievements.length,
    },
    concernDistribution,
    contentGap,
    members: activeMembers.map((m) => {
      const pt = preTasks.find((p) => p.name === m.name);
      return {
        name: m.name,
        joinDate: m.joinDate,
        job: m.job,
        mainConcern: pt?.mainConcern || "不明",
        hasAchievement: achieverNames.has(m.name),
      };
    }),
  });
}
