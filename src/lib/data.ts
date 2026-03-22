import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "test_data");

function readExcel(filename: string): Record<string, string>[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
}

// --- Types ---

export type Member = {
  name: string;
  joinDate: string;
  job: string;
  status: string;
  email: string;
  lineName: string;
};

export type PreTask = {
  date: string;
  name: string;
  job: string;
  experience: number;
  currentRevenue: number;
  targetRevenue: number;
  mainConcern: string;
  triedBefore: string;
  joinReason: string;
  weeklyHours: number;
};

export type Content = {
  id: string;
  title: string;
  category: string;
  format: string;
  duration: number;
  url: string;
  publishDate: string;
};

export type SeminarSurvey = {
  date: string;
  seminarDate: string;
  theme: string;
  name: string;
  satisfaction: number;
  understanding: number;
  wantToPractice: string;
  freeText: string;
};

export type GroupConSurvey = {
  date: string;
  gcDate: string;
  name: string;
  satisfaction: number;
  consultation: string;
  insight: string;
  nextAction: string;
};

export type SessionSurvey = {
  date: string;
  sessionDate: string;
  name: string;
  instructor: string;
  satisfaction: number;
  consultation: string;
  resolution: number;
  feedback: string;
};

export type Achievement = {
  date: string;
  name: string;
  revenueBefore: number;
  revenueAfter: number;
  strategy: string;
  duration: string;
  bestContent: string;
  bestSupport: string;
  advice: string;
};

export type Withdrawal = {
  applicationDate: string;
  name: string;
  joinDate: string;
  reason: string;
  detail: string;
  exitInterview: string;
  exitDate: string;
};

export type RealSeminarSurvey = {
  date: string;
  name: string;
  email: string;
  enrollmentPeriod: string;
  course: string;
  method: string;
  focus: number;
  acceleration: number;
  enjoyment: number;
  actionPlan: number;
  feedback: string;
};

export type ActionRecommendation = {
  type: "action";
  priority: number;
  title: string;
  reason: string;
  category: string;
};

// --- CSV reader ---

function readCSV(filename: string): string[][] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, "utf-8");
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (inQuotes) {
      if (ch === '"' && content[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(current);
        current = "";
      } else if (ch === "\n") {
        row.push(current);
        current = "";
        rows.push(row);
        row = [];
      } else if (ch !== "\r") {
        current += ch;
      }
    }
  }
  if (current || row.length > 0) {
    row.push(current);
    rows.push(row);
  }
  return rows;
}

function parseScore(val: string): number {
  if (!val) return 0;
  const m = val.match(/^(\d+)/);
  return m ? parseInt(m[1]) : 0;
}

// --- Data loaders ---

export function getRealSeminarSurveys(): RealSeminarSurvey[] {
  const rows = readCSV("seminar_real.csv");
  // Skip header (row 0 is multiline header) and template row (row 1)
  // Data starts at row 2 (index 2)
  return rows.slice(2).filter((r) => r.length >= 13 && r[4]).map((r) => ({
    date: r[1] || "",
    name: r[4] || "",
    email: r[5] || "",
    enrollmentPeriod: r[6] || "",
    course: r[7] || "",
    method: r[8] || "",
    focus: parseScore(r[9]),
    acceleration: parseScore(r[10]),
    enjoyment: parseScore(r[11]),
    actionPlan: parseScore(r[12]),
    feedback: r[13] || "",
  }));
}

export function getMembers(): Member[] {
  return readExcel("受講生の名簿.xlsx").map((r) => ({
    name: r["名前"] || "",
    joinDate: r["入会日"] || "",
    job: r["職種"] || "",
    status: r["ステータス"] || "",
    email: r["メールアドレス"] || "",
    lineName: r["LINE名"] || "",
  }));
}

export function getPreTasks(): PreTask[] {
  return readExcel("入会前の事前課題の回答データ.xlsx").map((r) => ({
    date: r["回答日"] || "",
    name: r["名前"] || "",
    job: r["現在の職種"] || "",
    experience: Number(r["経験年数"]) || 0,
    currentRevenue: Number(r["月商（万円）"]) || 0,
    targetRevenue: Number(r["目標月商（万円）"]) || 0,
    mainConcern: r["一番の悩み"] || "",
    triedBefore: r["過去に試したこと"] || "",
    joinReason: r["入会のきっかけ"] || "",
    weeklyHours: Number(r["週に使える時間（時間）"]) || 0,
  }));
}

export function getContents(): Content[] {
  return readExcel("既存コンテンツの一覧.xlsx").map((r) => ({
    id: r["コンテンツID"] || "",
    title: r["タイトル"] || "",
    category: r["カテゴリ"] || "",
    format: r["形式"] || "",
    duration: Number(r["時間（分）"]) || 0,
    url: r["URL"] || "",
    publishDate: r["公開日"] || "",
  }));
}

export function getSeminarSurveys(): SeminarSurvey[] {
  return readExcel("セミナー満足度アンケートの回答データ.xlsx").map((r) => ({
    date: r["回答日"] || "",
    seminarDate: r["セミナー日"] || "",
    theme: r["セミナーテーマ"] || "",
    name: r["名前"] || "",
    satisfaction: Number(r["満足度（1-5）"]) || 0,
    understanding: Number(r["理解度（1-5）"]) || 0,
    wantToPractice: r["実践したいこと"] || "",
    freeText: r["自由記述"] || "",
  }));
}

export function getGroupConSurveys(): GroupConSurvey[] {
  return readExcel("グルコン参加後アンケートの回答データ.xlsx").map((r) => ({
    date: r["回答日"] || "",
    gcDate: r["グルコン日"] || "",
    name: r["名前"] || "",
    satisfaction: Number(r["満足度（1-5）"]) || 0,
    consultation: r["相談した内容"] || "",
    insight: r["得られた気づき"] || "",
    nextAction: r["次にやること"] || "",
  }));
}

export function getSessionSurveys(): SessionSurvey[] {
  return readExcel("個別セッション満足度アンケートの回答データ.xlsx").map((r) => ({
    date: r["回答日"] || "",
    sessionDate: r["セッション日"] || "",
    name: r["名前"] || "",
    instructor: r["担当者"] || "",
    satisfaction: Number(r["満足度（1-5）"]) || 0,
    consultation: r["相談内容"] || "",
    resolution: Number(r["解決度（1-5）"]) || 0,
    feedback: r["感想"] || "",
  }));
}

export function getAchievements(): Achievement[] {
  return readExcel("実績アンケートの回答データ.xlsx").map((r) => ({
    date: r["回答日"] || "",
    name: r["名前"] || "",
    revenueBefore: Number(r["入会前の月商（万円）"]) || 0,
    revenueAfter: Number(r["現在の月商（万円）"]) || 0,
    strategy: r["成果が出た施策"] || "",
    duration: r["成果が出るまでの期間"] || "",
    bestContent: r["一番役に立ったコンテンツ"] || "",
    bestSupport: r["一番役に立ったサポート"] || "",
    advice: r["後輩へのアドバイス"] || "",
  }));
}

export function getWithdrawals(): Withdrawal[] {
  return readExcel("退会申請リストの回答データ.xlsx").map((r) => ({
    applicationDate: r["申請日"] || "",
    name: r["名前"] || "",
    joinDate: r["入会日"] || "",
    reason: r["退会理由"] || "",
    detail: r["詳細"] || "",
    exitInterview: r["引き止め面談実施"] || "",
    exitDate: r["最終退会日"] || "",
  }));
}

// --- Analysis functions ---

export function getConcernDistribution() {
  const preTasks = getPreTasks();
  const gcSurveys = getGroupConSurveys();
  const sessionSurveys = getSessionSurveys();

  // Combine concerns from all sources
  const concerns: Record<string, number> = {};

  // From pre-task
  for (const pt of preTasks) {
    if (pt.mainConcern) {
      concerns[pt.mainConcern] = (concerns[pt.mainConcern] || 0) + 1;
    }
  }

  // From group consultation topics
  for (const gc of gcSurveys) {
    if (gc.consultation) {
      concerns[gc.consultation] = (concerns[gc.consultation] || 0) + 1;
    }
  }

  // From session topics
  for (const ss of sessionSurveys) {
    if (ss.consultation) {
      concerns[ss.consultation] = (concerns[ss.consultation] || 0) + 1;
    }
  }

  const total = Object.values(concerns).reduce((a, b) => a + b, 0);
  return Object.entries(concerns)
    .map(([concern, count]) => ({
      concern,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function getContentGap() {
  const concerns = getConcernDistribution();
  const contents = getContents();

  // Map concerns to content categories
  const concernToCategory: Record<string, string> = {
    "集客ができない": "集客",
    "成約率が低い": "成約",
    "リピートが取れない": "リピート",
    "単価を上げられない": "単価アップ",
    "時間管理ができない": "マインド",
    "発信が続かない": "集客",
    "差別化ができない": "ブランディング",
    "集客がうまくいかない": "集客",
    "成約率を上げたい": "成約",
    "発信のネタがない": "集客",
    "LINEの使い方がわからない": "集客",
    "単価設定に悩んでいる": "単価アップ",
    "時間が足りない": "マインド",
    "モチベーションが下がっている": "マインド",
    "何から手をつけていいかわからない": "マインド",
    "集客方法について": "集客",
    "セールスの流れについて": "成約",
    "LINE構築について": "集客",
    "コンセプト作りについて": "ブランディング",
    "モチベーションについて": "マインド",
    "時間管理について": "マインド",
    "価格設定について": "単価アップ",
    "SNS発信について": "集客",
    "紹介の仕方について": "集客",
  };

  // Count content per category
  const contentPerCategory: Record<string, number> = {};
  for (const c of contents) {
    contentPerCategory[c.category] = (contentPerCategory[c.category] || 0) + 1;
  }

  // Aggregate concern counts by category
  const demandByCategory: Record<string, number> = {};
  for (const c of concerns) {
    const cat = concernToCategory[c.concern] || "その他";
    demandByCategory[cat] = (demandByCategory[cat] || 0) + c.count;
  }

  const totalDemand = Object.values(demandByCategory).reduce((a, b) => a + b, 0);
  const categories = new Set([
    ...Object.keys(demandByCategory),
    ...Object.keys(contentPerCategory),
  ]);

  return Array.from(categories)
    .map((cat) => ({
      category: cat,
      demandCount: demandByCategory[cat] || 0,
      demandPercent: Math.round(((demandByCategory[cat] || 0) / totalDemand) * 100),
      contentCount: contentPerCategory[cat] || 0,
      gap: (demandByCategory[cat] || 0) > 0 && (contentPerCategory[cat] || 0) === 0
        ? "なし"
        : (contentPerCategory[cat] || 0) < 3 && (demandByCategory[cat] || 0) > 0
          ? "不足"
          : "充実",
    }))
    .sort((a, b) => b.demandCount - a.demandCount);
}

export function getMemberAnalysis(memberName: string) {
  const preTasks = getPreTasks();
  const contents = getContents();
  const gcSurveys = getGroupConSurveys();
  const sessionSurveys = getSessionSurveys();
  const achievements = getAchievements();

  const preTask = preTasks.find((p) => p.name === memberName);
  const memberGcSurveys = gcSurveys.filter((g) => g.name === memberName);
  const memberSessionSurveys = sessionSurveys.filter((s) => s.name === memberName);
  const achievement = achievements.find((a) => a.name === memberName);

  // Collect all concerns from this member
  const memberConcerns: string[] = [];
  if (preTask?.mainConcern) memberConcerns.push(preTask.mainConcern);
  for (const gc of memberGcSurveys) {
    if (gc.consultation) memberConcerns.push(gc.consultation);
  }
  for (const ss of memberSessionSurveys) {
    if (ss.consultation) memberConcerns.push(ss.consultation);
  }

  // Map concerns to categories
  const concernToCategory: Record<string, string> = {
    "集客ができない": "集客",
    "成約率が低い": "成約",
    "リピートが取れない": "リピート",
    "単価を上げられない": "単価アップ",
    "時間管理ができない": "マインド",
    "発信が続かない": "集客",
    "差別化ができない": "ブランディング",
    "集客がうまくいかない": "集客",
    "成約率を上げたい": "成約",
    "発信のネタがない": "集客",
    "LINEの使い方がわからない": "集客",
    "単価設定に悩んでいる": "単価アップ",
    "時間が足りない": "マインド",
    "リピートが取れない": "リピート",
    "モチベーションが下がっている": "マインド",
    "何から手をつけていいかわからない": "マインド",
    "集客方法について": "集客",
    "セールスの流れについて": "成約",
    "LINE構築について": "集客",
    "コンセプト作りについて": "ブランディング",
    "モチベーションについて": "マインド",
    "時間管理について": "マインド",
    "価格設定について": "単価アップ",
    "SNS発信について": "集客",
    "紹介の仕方について": "集客",
  };

  // Count category frequency for this member
  const categoryCount: Record<string, number> = {};
  for (const c of memberConcerns) {
    const cat = concernToCategory[c] || "その他";
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  }

  // Sort categories by frequency
  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  // Recommend contents based on top categories
  const recommended = contents.filter((c) => topCategories.includes(c.category));

  // Generate action recommendations
  const actions = getActionRecommendations(memberName);

  return {
    preTask,
    concerns: memberConcerns,
    topCategories,
    recommended,
    actions,
    gcCount: memberGcSurveys.length,
    sessionCount: memberSessionSurveys.length,
    hasAchievement: !!achievement,
    achievement,
  };
}

export function getActionRecommendations(memberName: string): ActionRecommendation[] {
  const actions: ActionRecommendation[] = [];
  const seminarSurveys = getRealSeminarSurveys();
  const gcSurveys = getGroupConSurveys();
  const sessionSurveys = getSessionSurveys();
  const achievements = getAchievements();

  const memberSeminars = seminarSurveys.filter((s) => s.name === memberName);
  const memberGc = gcSurveys.filter((g) => g.name === memberName);
  const memberSessions = sessionSurveys.filter((s) => s.name === memberName);
  const memberAchievement = achievements.find((a) => a.name === memberName);

  const latestSeminar = memberSeminars[memberSeminars.length - 1];

  // Compute average scores across all seminars for trend analysis
  const seminarAvgs = memberSeminars.length > 0 ? {
    focus: memberSeminars.reduce((sum, s) => sum + s.focus, 0) / memberSeminars.length,
    acceleration: memberSeminars.reduce((sum, s) => sum + s.acceleration, 0) / memberSeminars.length,
    enjoyment: memberSeminars.reduce((sum, s) => sum + s.enjoyment, 0) / memberSeminars.length,
    actionPlan: memberSeminars.reduce((sum, s) => sum + s.actionPlan, 0) / memberSeminars.length,
  } : null;

  // --- Rule 1: Zoom/録画参加者 → リアル参加をおすすめ ---
  if (latestSeminar && (latestSeminar.method === "zoom" || latestSeminar.method === "録画視聴")) {
    // Calculate real-participant average vs this member's average for compelling reason
    const realParticipants = seminarSurveys.filter((s) =>
      s.method !== "zoom" && s.method !== "録画視聴"
    );
    const realAvg = realParticipants.length > 0
      ? realParticipants.reduce((sum, s) => sum + s.enjoyment, 0) / realParticipants.length
      : 0;
    const onlineAvg = seminarSurveys
      .filter((s) => s.method === "zoom" || s.method === "録画視聴")
      .reduce((sum, s, _, arr) => sum + s.enjoyment / arr.length, 0);
    const diff = Math.round((realAvg - onlineAvg) * 10) / 10;

    actions.push({
      type: "action",
      priority: 1,
      title: "次回セミナーはリアル会場で参加しよう！",
      reason: diff > 0
        ? `リアル参加者は満足度が平均+${diff}ポイント高く、仲間との交流でモチベーションもアップします`
        : "リアル参加者は仲間との交流でモチベーションがアップします",
      category: "セミナー",
    });
  }

  // --- Rule 2: セミナー未参加 → セミナー参加をおすすめ ---
  if (memberSeminars.length === 0) {
    const allAvg = seminarSurveys.length > 0
      ? seminarSurveys.reduce((sum, s) => sum + s.enjoyment, 0) / seminarSurveys.length
      : 0;
    const highPct = seminarSurveys.length > 0
      ? Math.round(seminarSurveys.filter((s) => s.enjoyment >= 8).length / seminarSurveys.length * 100)
      : 90;
    actions.push({
      type: "action",
      priority: 1,
      title: "月1セミナーに参加してみよう！",
      reason: `セミナー参加者の${highPct}%が「楽しめた」（8点以上）と回答しています`,
      category: "セミナー",
    });
  }

  // --- Rule 3: アクションプランが低い → 個別セッションをおすすめ ---
  if (latestSeminar && latestSeminar.actionPlan <= 6) {
    actions.push({
      type: "action",
      priority: 2,
      title: "個別セッションでアクションプランを一緒に作ろう",
      reason: "セミナーでプランに落とし込みづらかった方は、1対1で整理すると明確になります",
      category: "セッション",
    });
  }

  // --- Rule 4: ビジネス加速度が低い → グルコン参加をおすすめ ---
  if (latestSeminar && latestSeminar.acceleration <= 6) {
    actions.push({
      type: "action",
      priority: 2,
      title: "グルコンで具体的な悩みを相談しよう",
      reason: "ビジネスの加速に悩んでいる時は、グルコンで他の受講生の事例を聞くのが効果的です",
      category: "グルコン",
    });
  }

  // --- Rule 5: 集中度が低い → 録画視聴 or 環境改善 ---
  if (latestSeminar && latestSeminar.focus <= 6) {
    if (latestSeminar.method === "zoom") {
      actions.push({
        type: "action",
        priority: 2,
        title: "会場参加 or サテライト参加を試してみよう",
        reason: "zoom参加だと集中しにくい場合、会場やサテライト会場なら集中できる環境が整っています",
        category: "セミナー",
      });
    } else {
      actions.push({
        type: "action",
        priority: 3,
        title: "セミナーの録画を復習しよう",
        reason: "集中しづらかった部分も、録画で見直すことで学びを深められます",
        category: "セミナー",
      });
    }
  }

  // --- Rule 6: スコアが下降傾向 → 個別フォローアップ ---
  if (memberSeminars.length >= 2) {
    const recent = memberSeminars[memberSeminars.length - 1];
    const prev = memberSeminars[memberSeminars.length - 2];
    const recentAvg = (recent.focus + recent.acceleration + recent.enjoyment + recent.actionPlan) / 4;
    const prevAvg = (prev.focus + prev.acceleration + prev.enjoyment + prev.actionPlan) / 4;
    if (recentAvg < prevAvg - 1.5) {
      actions.push({
        type: "action",
        priority: 1,
        title: "個別セッションで今の状況を整理しよう",
        reason: "前回より満足度が下がっています。今の悩みを整理して次のステップを明確にしましょう",
        category: "セッション",
      });
    }
  }

  // --- Rule 7: グルコン参加が少ない → グルコン参加をおすすめ ---
  if (memberGc.length < 3) {
    actions.push({
      type: "action",
      priority: 3,
      title: "グルコンにもっと参加してみよう！",
      reason: "成果が出ている受講生はグルコン月2回以上参加している傾向があります",
      category: "グルコン",
    });
  }

  // --- Rule 8: セッション未利用 → セッション案内 ---
  if (memberSessions.length === 0) {
    actions.push({
      type: "action",
      priority: 3,
      title: "個別セッションを活用しよう",
      reason: "あなたに合ったアドバイスがもらえます。まずは1回試してみましょう",
      category: "セッション",
    });
  }

  // --- Rule 9: 全スコア高い → アウトプット・成果報告を促す ---
  if (latestSeminar) {
    const avg = (latestSeminar.focus + latestSeminar.acceleration + latestSeminar.enjoyment + latestSeminar.actionPlan) / 4;
    if (avg >= 9 && !memberAchievement) {
      actions.push({
        type: "action",
        priority: 4,
        title: "あなたの成果や学びをシェアしてみよう！",
        reason: "セミナーでの学びが高い今、発信やアウトプットをすることで更に定着します",
        category: "アウトプット",
      });
    }
  }

  // --- Rule 10: 複数回参加で楽しめていない → 参加方法の変更提案 ---
  if (seminarAvgs && memberSeminars.length >= 2 && seminarAvgs.enjoyment < 7) {
    const methods = new Set(memberSeminars.map((s) => s.method));
    if (!methods.has("会場(東京)") && !methods.has("会場(大阪)") && !methods.has("各地サテライト")) {
      actions.push({
        type: "action",
        priority: 2,
        title: "リアル会場やサテライトでの参加を体験してみよう",
        reason: "オンラインが合わないかも？会場参加で雰囲気が変わり、楽しさがアップする方が多いです",
        category: "セミナー",
      });
    }
  }

  // --- Rule 11: 成果報告済み → 次のステージ ---
  if (memberAchievement) {
    actions.push({
      type: "action",
      priority: 4,
      title: "次の目標を設定しよう！",
      reason: `月商${memberAchievement.revenueAfter}万円を達成した今、次のステージに向けて目標を更新しましょう`,
      category: "セッション",
    });
  }

  // Deduplicate by category — keep highest priority per category
  const seen = new Map<string, ActionRecommendation>();
  for (const action of actions.sort((a, b) => a.priority - b.priority)) {
    const key = `${action.category}:${action.title}`;
    if (!seen.has(key)) {
      seen.set(key, action);
    }
  }

  return Array.from(seen.values())
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5);
}
