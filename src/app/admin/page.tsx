"use client";

import { useState, useEffect } from "react";
import BananaRisaCharacter from "../components/BananaRisaCharacter";
import Link from "next/link";

interface StudentWithLog {
  id: string;
  name: string;
  business_stage: string;
  missing_element: string;
  concern: string;
  ideal_future: string;
  monthly_goals: string;
  main_activity: string;
  note_to_risa: string;
  created_at: string;
  last_log_date: string | null;
  days_since_last_log: number | null;
  needs_alert: boolean;
}

interface DailyLog {
  id: string;
  date: string;
  group_consulting: boolean;
  core_live: boolean;
  seminar: boolean;
  content_viewing: boolean;
  sns_reel: boolean;
  sns_threads: boolean;
  sns_stories: boolean;
  sns_live: boolean;
  sales_offer: boolean;
  description: string;
  ai_message: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [students, setStudents] = useState<StudentWithLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentWithLog | null>(null);
  const [studentLogs, setStudentLogs] = useState<DailyLog[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisLoaded, setAnalysisLoaded] = useState(false);

  // ログイン後に自動でAI分析を取得
  useEffect(() => {
    if (authenticated && students.length > 0 && !analysisLoaded) {
      // fetchAnalysisは下で定義 - 直接インラインで実行
      (async () => {
        setLoadingAnalysis(true);
        try {
          // ステージ分布を計算
          const sd: Record<string, number> = {};
          const md: Record<string, number> = {};
          students.forEach((s) => {
            const stageShort = s.business_stage.replace(/Stage \d：/, "Stage " + s.business_stage.match(/Stage (\d)/)?.[1] + ": ");
            sd[stageShort] = (sd[stageShort] || 0) + 1;
            const elementShort = s.missing_element.replace(/（.*?）/, "");
            md[elementShort] = (md[elementShort] || 0) + 1;
          });
          const res = await fetch("/api/admin/analysis", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-password": password,
            },
            body: JSON.stringify({
              stageDistribution: sd,
              missingElementDistribution: md,
              totalStudents: students.length,
            }),
          });
          const data = await res.json();
          setAnalysis(data.analysis);
          setAnalysisLoaded(true);
        } catch {
          setAnalysis("分析の取得に失敗しました。");
        } finally {
          setLoadingAnalysis(false);
        }
      })();
    }
  }, [authenticated, students.length]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/students", {
        headers: { "x-admin-password": password },
      });

      if (!res.ok) {
        setError("パスワードが正しくありません");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setStudents(data.students);
      setAuthenticated(true);
    } catch {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(student: StudentWithLog) {
    setSelectedStudent(student);
    setLoadingDetail(true);

    try {
      const res = await fetch(`/api/admin/student/${student.id}`, {
        headers: { "x-admin-password": password },
      });
      if (res.ok) {
        const data = await res.json();
        setStudentLogs(data.logs);
      }
    } catch {
      // ignore
    } finally {
      setLoadingDetail(false);
    }
  }

  // ログインページ
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100/30 to-white flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 border border-yellow-200 text-center">
          <BananaRisaCharacter mood="normal" size={120} />
          <h1 className="text-xl font-bold text-yellow-800 mt-4 mb-6">
            講師用管理ページ
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              className="w-full rounded-lg border border-yellow-300 px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-center"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-yellow-900 font-bold py-3 rounded-lg transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? "確認中..." : "ログイン"}
            </button>
          </form>
          <Link href="/" className="inline-block mt-4 text-yellow-600 text-sm underline">
            トップへ戻る
          </Link>
        </div>
      </main>
    );
  }

  // 詳細表示
  if (selectedStudent) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100/30 to-white px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setSelectedStudent(null)}
            className="text-yellow-600 hover:text-yellow-800 mb-4 flex items-center gap-1 cursor-pointer"
          >
            ← 一覧に戻る
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-200 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-yellow-800">{selectedStudent.name}</h1>
                <p className="text-sm text-yellow-600">{selectedStudent.business_stage}</p>
              </div>
              {selectedStudent.needs_alert && (
                <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                  ⚠️ {selectedStudent.days_since_last_log === null ? "未入力" : `${selectedStudent.days_since_last_log}日未入力`}
                </span>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-yellow-700">足りない要素</p>
                <p className="text-gray-700">{selectedStudent.missing_element}</p>
              </div>
              <div>
                <p className="font-semibold text-yellow-700">悩み・課題</p>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedStudent.concern}</p>
              </div>
              <div>
                <p className="font-semibold text-yellow-700">3ヶ月後の理想</p>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedStudent.ideal_future}</p>
              </div>
              <div>
                <p className="font-semibold text-yellow-700">今月の行動目標</p>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedStudent.monthly_goals}</p>
              </div>
              <div>
                <p className="font-semibold text-yellow-700">最も時間を割いている作業</p>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedStudent.main_activity}</p>
              </div>
              {selectedStudent.note_to_risa && (
                <div>
                  <p className="font-semibold text-yellow-700">りさへのメモ</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedStudent.note_to_risa}</p>
                </div>
              )}
            </div>
          </div>

          {/* 活動履歴 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-200">
            <h2 className="text-lg font-bold text-yellow-800 mb-4">📅 活動履歴</h2>
            {loadingDetail ? (
              <p className="text-yellow-600 text-center py-4">読み込み中...</p>
            ) : studentLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">まだ活動記録がありません</p>
            ) : (
              <div className="space-y-4">
                {studentLogs.map((log) => {
                  const activities = [
                    log.group_consulting && "グルコン",
                    log.core_live && "コアライブ",
                    log.seminar && "セミナー",
                    log.content_viewing && "視聴",
                    log.sns_reel && "リール",
                    log.sns_threads && "スレッズ",
                    log.sns_stories && "ストーリーズ",
                    log.sns_live && "ライブ",
                    log.sales_offer && "オファー",
                  ].filter(Boolean);

                  return (
                    <div key={log.id} className="border-b border-yellow-100 pb-3 last:border-0">
                      <p className="font-semibold text-yellow-800">{log.date}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activities.map((a) => (
                          <span
                            key={a as string}
                            className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full"
                          >
                            {a}
                          </span>
                        ))}
                        {activities.length === 0 && (
                          <span className="text-xs text-gray-400">アクティビティなし</span>
                        )}
                      </div>
                      {log.description && (
                        <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                      )}
                      {log.ai_message && (
                        <p className="text-sm text-yellow-700 mt-1 italic">💬 {log.ai_message}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  // 一覧表示
  const alertCount = students.filter((s) => s.needs_alert).length;

  // ステージ分布を計算
  const stageDistribution: Record<string, number> = {};
  const missingElementDistribution: Record<string, number> = {};
  students.forEach((s) => {
    const stageShort = s.business_stage.replace(/Stage \d：/, "Stage " + s.business_stage.match(/Stage (\d)/)?.[1] + ": ");
    stageDistribution[stageShort] = (stageDistribution[stageShort] || 0) + 1;
    const elementShort = s.missing_element.replace(/（.*?）/, "");
    missingElementDistribution[elementShort] = (missingElementDistribution[elementShort] || 0) + 1;
  });
  const maxStageCount = Math.max(...Object.values(stageDistribution), 1);

  async function fetchAnalysis() {
    if (analysisLoaded) return;
    setLoadingAnalysis(true);
    try {
      const res = await fetch("/api/admin/analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          stageDistribution,
          missingElementDistribution,
          totalStudents: students.length,
        }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
      setAnalysisLoaded(true);
    } catch {
      setAnalysis("分析の取得に失敗しました。");
    } finally {
      setLoadingAnalysis(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100/30 to-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-yellow-800">🍌 管理ダッシュボード</h1>
          <Link href="/" className="text-yellow-600 text-sm underline hover:text-yellow-800">
            トップへ
          </Link>
        </div>

        {/* サマリー */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 border border-yellow-200 text-center">
            <p className="text-yellow-600 text-sm">受講生数</p>
            <p className="text-3xl font-bold text-yellow-800">{students.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 border border-yellow-200 text-center">
            <p className="text-yellow-600 text-sm">要フォロー</p>
            <p className={`text-3xl font-bold ${alertCount > 0 ? "text-red-600" : "text-green-600"}`}>
              {alertCount}人
            </p>
          </div>
        </div>

        {/* ステージ分布 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-200 mb-6">
          <h2 className="text-lg font-bold text-yellow-800 mb-4">📊 ビジネスステージ分布</h2>
          <div className="space-y-3">
            {Object.entries(stageDistribution)
              .sort(([a], [b]) => {
                const numA = parseInt(a.match(/\d/)?.[0] || "0");
                const numB = parseInt(b.match(/\d/)?.[0] || "0");
                return numA - numB;
              })
              .map(([stage, count]) => {
                const stageNum = stage.match(/Stage (\d)/)?.[1] || "?";
                const stageLabel = stage.replace(/Stage \d: /, "");
                const percentage = Math.round((count / students.length) * 100);
                const barWidth = Math.round((count / maxStageCount) * 100);
                const colors = [
                  "", // 0
                  "bg-red-300",    // Stage 1
                  "bg-orange-300", // Stage 2
                  "bg-yellow-400", // Stage 3
                  "bg-lime-400",   // Stage 4
                  "bg-green-400",  // Stage 5
                  "bg-emerald-500", // Stage 6
                ];
                const color = colors[parseInt(stageNum)] || "bg-yellow-400";

                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium truncate flex-1 mr-2">
                        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full mr-1">
                          S{stageNum}
                        </span>
                        {stageLabel}
                      </span>
                      <span className="text-yellow-800 font-bold whitespace-nowrap">{count}名 ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className={`${color} h-4 rounded-full transition-all duration-500`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* 足りない要素の分布 */}
          <h3 className="text-md font-bold text-yellow-800 mt-6 mb-3">🔍 足りない要素</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(missingElementDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([element, count]) => {
                const percentage = Math.round((count / students.length) * 100);
                const icons: Record<string, string> = {
                  "スキル・知識": "📚",
                  "時間": "⏰",
                  "マインド": "💭",
                  "環境": "🤝",
                };
                const icon = Object.entries(icons).find(([k]) => element.includes(k))?.[1] || "📌";
                return (
                  <div key={element} className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100">
                    <p className="text-2xl">{icon}</p>
                    <p className="text-xs text-gray-600 mt-1">{element}</p>
                    <p className="text-lg font-bold text-yellow-800">{count}名 <span className="text-xs font-normal">({percentage}%)</span></p>
                  </div>
                );
              })}
          </div>
        </div>

        {/* AI分析 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-200 mb-6">
          <h2 className="text-lg font-bold text-yellow-800 mb-4">🤖 AI分析・情報提供アドバイス</h2>
          {loadingAnalysis ? (
            <div className="text-center py-6">
              <p className="text-yellow-600 animate-pulse">分析中... 🍌</p>
            </div>
          ) : analysis ? (
            <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{analysis}</div>
          ) : (
            <button
              onClick={fetchAnalysis}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-yellow-900 font-bold py-3 rounded-lg transition-all cursor-pointer"
            >
              分析を実行する
            </button>
          )}
          {analysisLoaded && (
            <button
              onClick={() => { setAnalysisLoaded(false); setAnalysis(""); setTimeout(fetchAnalysis, 100); }}
              className="mt-3 text-sm text-yellow-600 underline hover:text-yellow-800 cursor-pointer"
            >
              再分析する
            </button>
          )}
        </div>

        {/* 受講生一覧 */}
        <div className="bg-white rounded-2xl shadow-lg border border-yellow-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-yellow-100 border-b border-yellow-200">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-yellow-800">名前</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-yellow-800">ステージ</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-yellow-800">最終入力</th>
                  <th className="text-center px-4 py-3 text-sm font-semibold text-yellow-800">状態</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => openDetail(student)}
                    className="border-b border-yellow-50 hover:bg-yellow-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.business_stage.replace(/Stage \d：/, "")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.last_log_date || "未入力"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {student.needs_alert ? (
                        <span className="inline-block bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                          ⚠️ 要フォロー
                        </span>
                      ) : (
                        <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                          ✅ 活動中
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      まだ受講生がいません
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
