"use client";

import { useState, useEffect, use } from "react";
import BananaRisaCharacter from "../../components/BananaRisaCharacter";
import Link from "next/link";

interface Student {
  id: string;
  name: string;
  business_stage: string;
  created_at: string;
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

const ACTIVITY_SECTIONS = [
  {
    title: "📚 学習",
    items: [
      { key: "group_consulting", label: "グルコン" },
      { key: "core_live", label: "コアライブ" },
      { key: "seminar", label: "セミナー" },
      { key: "content_viewing", label: "コンテンツ視聴" },
    ],
  },
  {
    title: "📱 SNS発信",
    items: [
      { key: "sns_reel", label: "リール" },
      { key: "sns_threads", label: "スレッズ" },
      { key: "sns_stories", label: "ストーリーズ" },
      { key: "sns_live", label: "ライブ" },
    ],
  },
  {
    title: "💰 セールス",
    items: [{ key: "sales_offer", label: "セールス・オファー" }],
  },
];

export default function StudentPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);

  const [student, setStudent] = useState<Student | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [characterMood, setCharacterMood] = useState<"normal" | "happy" | "cheer">("normal");

  const [form, setForm] = useState({
    group_consulting: false,
    core_live: false,
    seminar: false,
    content_viewing: false,
    sns_reel: false,
    sns_threads: false,
    sns_stories: false,
    sns_live: false,
    sales_offer: false,
    description: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const studentRes = await fetch(`/api/student/${encodeURIComponent(decodedName)}`);
        if (!studentRes.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const studentData = await studentRes.json();
        setStudent(studentData.student);

        const logsRes = await fetch(`/api/daily-log/${studentData.student.id}`);
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setLogs(logsData.logs);

          // 今日のログがあればフォームにセット
          const today = new Date().toISOString().split("T")[0];
          const todayLog = logsData.logs.find((l: DailyLog) => l.date === today);
          if (todayLog) {
            setForm({
              group_consulting: todayLog.group_consulting,
              core_live: todayLog.core_live,
              seminar: todayLog.seminar,
              content_viewing: todayLog.content_viewing,
              sns_reel: todayLog.sns_reel,
              sns_threads: todayLog.sns_threads,
              sns_stories: todayLog.sns_stories,
              sns_live: todayLog.sns_live,
              sales_offer: todayLog.sales_offer,
              description: todayLog.description || "",
            });
            if (todayLog.ai_message) {
              setAiMessage(todayLog.ai_message);
              setCharacterMood("happy");
            }
          }
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [decodedName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!student) return;
    setSubmitting(true);

    try {
      // AIメッセージ生成
      const aiRes = await fetch("/api/ai-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activities: form,
          description: form.description,
          studentName: student.name,
        }),
      });
      const aiData = await aiRes.json();
      const message = aiData.message;

      // 活動記録保存
      await fetch("/api/daily-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: student.id,
          ...form,
          ai_message: message,
        }),
      });

      setAiMessage(message);
      setCharacterMood("happy");

      // ログ再取得
      const logsRes = await fetch(`/api/daily-log/${student.id}`);
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs);
      }
    } catch {
      setAiMessage("記録を保存しました！明日も頑張ろう 🍌");
    } finally {
      setSubmitting(false);
    }
  }

  // 連続入力日数を計算
  function getStreak(): number {
    if (logs.length === 0) return 0;
    const sortedDates = logs.map((l) => l.date).sort().reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < sortedDates.length; i++) {
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split("T")[0];
      if (sortedDates[i] === expectedStr) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  // 今月のカレンダーデータ
  function getCalendarDays() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const logDates = new Set(logs.map((l) => l.date));

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: 0, hasLog: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, hasLog: logDates.has(dateStr) });
    }
    return days;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100/30 to-white flex items-center justify-center">
        <p className="text-yellow-800 text-lg">読み込み中... 🍌</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100/30 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <BananaRisaCharacter mood="normal" message="まだアンケートに回答していないみたい！先に登録してね。" size={140} />
          <Link
            href="/"
            className="inline-block mt-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            トップへ戻る
          </Link>
        </div>
      </main>
    );
  }

  const streak = getStreak();
  const calendarDays = getCalendarDays();
  const now = new Date();
  const monthLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100/30 to-white px-4 py-8">
      <div className="max-w-lg mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-yellow-800">
            {student?.name}さんのマイページ
          </h1>
          <p className="text-yellow-600 text-sm mt-1">{student?.business_stage}</p>
        </div>

        {/* りささんキャラ */}
        <div className="flex justify-center">
          <BananaRisaCharacter
            mood={characterMood}
            size={130}
          />
        </div>

        {/* ストリーク */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-yellow-200 text-center">
          <p className="text-yellow-600 text-sm">連続記録日数</p>
          <p className="text-4xl font-bold text-yellow-800">
            🔥 {streak}日
          </p>
        </div>

        {/* 活動カレンダー */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-yellow-200">
          <h2 className="text-lg font-bold text-yellow-800 mb-3">{monthLabel} の活動</h2>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {["日", "月", "火", "水", "木", "金", "土"].map((d) => (
              <div key={d} className="text-yellow-600 font-semibold py-1">{d}</div>
            ))}
            {calendarDays.map((cell, i) => (
              <div
                key={i}
                className={`py-1.5 rounded-md text-sm ${
                  cell.day === 0
                    ? ""
                    : cell.hasLog
                    ? "bg-yellow-400 text-yellow-900 font-bold"
                    : "bg-yellow-50 text-gray-400"
                }`}
              >
                {cell.day > 0 ? cell.day : ""}
              </div>
            ))}
          </div>
        </div>

        {/* 今日の活動入力 */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-yellow-200">
          <h2 className="text-lg font-bold text-yellow-800 mb-4">📝 今日やったこと</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {ACTIVITY_SECTIONS.map((section) => (
              <div key={section.title}>
                <p className="text-sm font-semibold text-yellow-700 mb-2">{section.title}</p>
                <div className="grid grid-cols-2 gap-2">
                  {section.items.map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        form[item.key as keyof typeof form]
                          ? "bg-yellow-100 border-yellow-400"
                          : "border-yellow-200 hover:bg-yellow-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form[item.key as keyof typeof form] as boolean}
                        onChange={(e) =>
                          setForm({ ...form, [item.key]: e.target.checked })
                        }
                        className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-400"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <label className="text-sm font-semibold text-yellow-700 block mb-2">
                📌 何をやったか詳しく
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-yellow-300 px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                placeholder="例：リール3本撮影して2本投稿した"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-yellow-200 disabled:to-yellow-300 text-yellow-900 font-bold py-3 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {submitting ? "記録中..." : "記録する 🍌"}
            </button>
          </form>

          {/* AIメッセージ（記録後に表示） */}
          {aiMessage && (
            <div className="mt-6">
              <BananaRisaCharacter
                mood="happy"
                message={aiMessage}
                size={110}
              />
            </div>
          )}
        </div>

        {/* 過去の記録 */}
        {logs.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 border border-yellow-200">
            <h2 className="text-lg font-bold text-yellow-800 mb-4">📅 最近の記録</h2>
            <div className="space-y-3">
              {logs.slice(0, 7).map((log) => {
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
                    <p className="text-sm font-semibold text-yellow-800">{log.date}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activities.map((a) => (
                        <span
                          key={a as string}
                          className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                    {log.description && (
                      <p className="text-xs text-gray-600 mt-1">{log.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center pb-8">
          <Link href="/" className="text-yellow-600 text-sm underline hover:text-yellow-800">
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
