"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface DailyLog {
  id: string;
  date: string;
  grucon: boolean;
  core_live: boolean;
  seminar: boolean;
  content_watch: boolean;
  sns_reel: boolean;
  sns_threads: boolean;
  sns_stories: boolean;
  sns_live: boolean;
  sales_offer: boolean;
  description: string;
  ai_message: string;
}

interface StudentDetail {
  id: string;
  name: string;
  email: string;
  business_stage: string;
  missing_element: string;
  current_challenge: string;
  ideal_future: string;
  monthly_goals: string;
  main_task: string;
  other_info: string;
  created_at: string;
}

const STAGE_LABELS: Record<string, string> = {
  stage1: "Stage 1：自己理解・コンセプト期",
  stage2: "Stage 2：商品設計期",
  stage3: "Stage 3：初集客・検証期",
  stage4: "Stage 4：フロント安定期",
  stage5: "Stage 5：マネタイズ構築期",
  stage6: "Stage 6：仕組み化・拡大期",
};

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/teacher/students/${id}`);
        if (!res.ok) {
          router.push("/teacher");
          return;
        }
        const data = await res.json();
        setStudent(data.student);
        setLogs(data.logs || []);
      } catch {
        router.push("/teacher");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  if (loading || !student) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100 to-orange-50 flex items-center justify-center">
        <p className="text-yellow-700">読み込み中...</p>
      </main>
    );
  }

  // Stats
  const thisMonthLogs = logs.filter((l) => {
    const d = new Date(l.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const learningDays = thisMonthLogs.filter(
    (l) => l.grucon || l.core_live || l.seminar || l.content_watch
  ).length;
  const snsDays = thisMonthLogs.filter(
    (l) => l.sns_reel || l.sns_threads || l.sns_stories || l.sns_live
  ).length;
  const salesDays = thisMonthLogs.filter((l) => l.sales_offer).length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100 to-orange-50 pb-12">
      <header className="bg-white/70 backdrop-blur border-b border-yellow-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push("/teacher")}
            className="text-yellow-700 hover:text-yellow-900"
          >
            ← 戻る
          </button>
          <span className="text-2xl">🍌</span>
          <span className="font-bold text-yellow-800">{student.name}さんの詳細</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 mt-6 space-y-6">
        {/* Survey Info */}
        <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-5 border border-yellow-200">
          <h2 className="text-lg font-bold text-yellow-800 mb-4">アンケート情報</h2>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-yellow-50 rounded-lg p-3">
                <span className="font-bold text-yellow-700">名前</span>
                <p className="text-gray-700 mt-1">{student.name}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <span className="font-bold text-yellow-700">メール</span>
                <p className="text-gray-700 mt-1">{student.email}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <span className="font-bold text-yellow-700">ビジネスステージ</span>
                <p className="text-gray-700 mt-1">
                  {STAGE_LABELS[student.business_stage] || student.business_stage || "未設定"}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3">
                <span className="font-bold text-yellow-700">足りない要素</span>
                <p className="text-gray-700 mt-1">{student.missing_element || "未設定"}</p>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-3">
              <span className="font-bold text-yellow-700">現在の悩み・課題</span>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                {student.current_challenge || "未入力"}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-3">
              <span className="font-bold text-yellow-700">3ヶ月後の理想の状態</span>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                {student.ideal_future || "未入力"}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-3">
              <span className="font-bold text-yellow-700">今月の行動目標</span>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                {student.monthly_goals || "未入力"}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-3">
              <span className="font-bold text-yellow-700">最も時間を割いている作業</span>
              <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                {student.main_task || "未入力"}
              </p>
            </div>

            {student.other_info && (
              <div className="bg-yellow-50 rounded-lg p-3">
                <span className="font-bold text-yellow-700">その他</span>
                <p className="text-gray-700 mt-1 whitespace-pre-wrap">{student.other_info}</p>
              </div>
            )}

            <div className="bg-yellow-50 rounded-lg p-3">
              <span className="font-bold text-yellow-700">登録日</span>
              <p className="text-gray-700 mt-1">
                {new Date(student.created_at).toLocaleDateString("ja-JP")}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-5 border border-yellow-200">
          <h2 className="text-lg font-bold text-yellow-800 mb-3">今月の統計</h2>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{thisMonthLogs.length}</div>
              <div className="text-xs text-yellow-600 mt-1">記録日数</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{learningDays}</div>
              <div className="text-xs text-yellow-600 mt-1">学習日</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{snsDays}</div>
              <div className="text-xs text-blue-600 mt-1">SNS発信</div>
            </div>
            <div className="bg-pink-50 rounded-xl p-3 text-center border border-pink-200">
              <div className="text-2xl font-bold text-pink-700">{salesDays}</div>
              <div className="text-xs text-pink-600 mt-1">セールス</div>
            </div>
          </div>
        </section>

        {/* Activity Calendar */}
        <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-5 border border-yellow-200">
          <h2 className="text-lg font-bold text-yellow-800 mb-3">活動カレンダー</h2>
          <div className="flex flex-wrap gap-1 mb-4">
            {Array.from({ length: 30 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (29 - i));
              const dateStr = d.toISOString().split("T")[0];
              const hasLog = logs.some((l) => l.date === dateStr);
              return (
                <div
                  key={dateStr}
                  title={dateStr}
                  className={`w-7 h-7 rounded text-xs flex items-center justify-center ${
                    hasLog
                      ? "bg-yellow-400 text-yellow-900"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {hasLog ? "🍌" : d.getDate()}
                </div>
              );
            })}
          </div>
        </section>

        {/* Daily Logs */}
        <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-5 border border-yellow-200">
          <h2 className="text-lg font-bold text-yellow-800 mb-3">活動記録</h2>
          {logs.length === 0 ? (
            <p className="text-gray-400 text-center py-4">まだ記録がありません</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => {
                const activities = [];
                if (log.grucon) activities.push("グルコン");
                if (log.core_live) activities.push("コアライブ");
                if (log.seminar) activities.push("セミナー");
                if (log.content_watch) activities.push("コンテンツ視聴");
                if (log.sns_reel) activities.push("リール");
                if (log.sns_threads) activities.push("スレッズ");
                if (log.sns_stories) activities.push("ストーリーズ");
                if (log.sns_live) activities.push("ライブ");
                if (log.sales_offer) activities.push("セールス・オファー");

                return (
                  <div
                    key={log.id}
                    className="bg-yellow-50 rounded-lg p-4 border border-yellow-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-yellow-800">{log.date}</span>
                      <div className="flex flex-wrap gap-1">
                        {activities.map((a) => (
                          <span
                            key={a}
                            className="inline-block px-2 py-0.5 rounded-full text-xs bg-yellow-200 text-yellow-800"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                    {log.description && (
                      <p className="text-sm text-gray-700 mb-2">{log.description}</p>
                    )}
                    {log.ai_message && (
                      <div className="bg-white rounded-lg p-3 border border-yellow-300 mt-2">
                        <p className="text-xs text-yellow-600 mb-1">🍌 りささんからのメッセージ</p>
                        <p className="text-sm text-gray-700">{log.ai_message}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
