import { getMembers, getMemberAnalysis, getRealSeminarSurveys, getGroupConSurveys, getSessionSurveys } from "@/lib/data";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/member/[name]">
) {
  const { name } = await ctx.params;
  const decodedName = decodeURIComponent(name);

  const members = getMembers();
  const member = members.find((m) => m.name === decodedName);

  if (!member) {
    return Response.json({ error: "受講生が見つかりません" }, { status: 404 });
  }

  const analysis = getMemberAnalysis(decodedName);
  const seminarSurveys = getRealSeminarSurveys();
  const memberSeminars = seminarSurveys.filter((s) => s.name === decodedName);
  const latestSeminar = memberSeminars[memberSeminars.length - 1] || null;

  // Group consulting history
  const gcSurveys = getGroupConSurveys();
  const memberGc = gcSurveys.filter((g) => g.name === decodedName);

  // Session history
  const sessionSurveys = getSessionSurveys();
  const memberSessions = sessionSurveys.filter((s) => s.name === decodedName);

  // Compute score trends if multiple seminars
  let seminarTrend: "up" | "down" | "stable" | null = null;
  if (memberSeminars.length >= 2) {
    const recent = memberSeminars[memberSeminars.length - 1];
    const prev = memberSeminars[memberSeminars.length - 2];
    const recentAvg = (recent.focus + recent.acceleration + recent.enjoyment + recent.actionPlan) / 4;
    const prevAvg = (prev.focus + prev.acceleration + prev.enjoyment + prev.actionPlan) / 4;
    seminarTrend = recentAvg > prevAvg + 0.5 ? "up" : recentAvg < prevAvg - 0.5 ? "down" : "stable";
  }

  return Response.json({
    member: {
      name: member.name,
      joinDate: member.joinDate,
      job: member.job,
      status: member.status,
    },
    preTask: analysis.preTask,
    concerns: analysis.concerns,
    topCategories: analysis.topCategories,
    recommended: analysis.recommended,
    actions: analysis.actions,
    seminar: latestSeminar ? {
      method: latestSeminar.method,
      focus: latestSeminar.focus,
      acceleration: latestSeminar.acceleration,
      enjoyment: latestSeminar.enjoyment,
      actionPlan: latestSeminar.actionPlan,
      feedback: latestSeminar.feedback,
    } : null,
    seminarHistory: memberSeminars.map((s) => ({
      date: s.date,
      method: s.method,
      focus: s.focus,
      acceleration: s.acceleration,
      enjoyment: s.enjoyment,
      actionPlan: s.actionPlan,
      feedback: s.feedback,
    })),
    seminarStats: {
      attendance: memberSeminars.length,
      methods: memberSeminars.map((s) => s.method),
      latestMethod: latestSeminar?.method || null,
      trend: seminarTrend,
    },
    gcHistory: memberGc.map((g) => ({
      date: g.gcDate || g.date,
      consultation: g.consultation,
      insight: g.insight,
      nextAction: g.nextAction,
      satisfaction: g.satisfaction,
    })),
    gcCount: analysis.gcCount,
    sessionHistory: memberSessions.map((s) => ({
      date: s.sessionDate || s.date,
      instructor: s.instructor,
      consultation: s.consultation,
      resolution: s.resolution,
      satisfaction: s.satisfaction,
      feedback: s.feedback,
    })),
    sessionCount: analysis.sessionCount,
    hasAchievement: analysis.hasAchievement,
    achievement: analysis.achievement,
  });
}
