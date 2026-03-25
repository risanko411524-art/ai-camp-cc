"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import BananaRisa from "../components/BananaRisa";

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

interface StudentProfile {
  name: string;
  business_stage: string;
  current_challenge: string;
  ideal_future: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [latestMessage, setLatestMessage] = useState("");
  const [streak, setStreak] = useState(0);

  // Today's form state
  const [grucon, setGrucon] = useState(false);
  const [coreLive, setCoreLive] = useState(false);
  const [seminar, setSeminar] = useState(false);
  const [contentWatch, setContentWatch] = useState(false);
  const [snsReel, setSnsReel] = useState(false);
  const [snsThreads, setSnsThreads] = useState(false);
  const [snsStories, setSnsStories] = useState(false);
  const [snsLive, setSnsLive] = useState(false);
  const [salesOffer, setSalesOffer] = useState(false);
  const [description, setDescription] = useState("");

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/daily-log");
      if (res.status === 401) {
        router.push("/");
        return;
      }
      const data = await res.json();
      setStudent(data.student);
      setLogs(data.logs || []);

      // Load today's data if exists
      const today = new Date().toISOString().split("T")[0];
      const todayLog = data.logs?.find((l: DailyLog) => l.date === today);
      if (todayLog) {
        setGrucon(todayLog.grucon);
        setCoreLive(todayLog.core_live);
        setSeminar(todayLog.seminar);
        setContentWatch(todayLog.content_watch);
        setSnsReel(todayLog.sns_reel);
        setSnsThreads(todayLog.sns_threads);
        setSnsStories(todayLog.sns_stories);
        setSnsLive(todayLog.sns_live);
        setSalesOffer(todayLog.sales_offer);
        setDescription(todayLog.description || "");
        setLatestMessage(todayLog.ai_message || "");
      }

      // Calculate streak
      let s = 0;
      const sortedLogs = [...(data.logs || [])].sort(
        (a: DailyLog, b: DailyLog) => b.date.localeCompare(a.date)
      );
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      for (let i = 0; i < sortedLogs.length; i++) {
        const expected = new Date(todayDate);
        expected.setDate(expected.getDate() - i);
        if (sortedLogs[i].date === expected.toISOString().split("T")[0]) {
          s++;
        } else {
          break;
        }
      }
      setStreak(s);
    } catch {
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/daily-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grucon,
          core_live: coreLive,
          seminar,
          content_watch: contentWatch,
          sns_reel: snsReel,
          sns_threads: snsThreads,
          sns_stories: snsStories,
          sns_live: snsLive,
          sales_offer: salesOffer,
          description,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setLatestMessage(data.aiMessage);
        setStreak(data.streak);
        await loadData();
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false);
    }
  }

  // Stats
  const thisMonthLogs = logs.filter((l) => {
    const d = new Date(l.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const learningCount = thisMonthLogs.filter(
    (l) => l.grucon || l.core_live || l.seminar || l.content_watch
  ).length;
  const snsCount = thisMonthLogs.filter(
    (l) => l.sns_reel || l.sns_threads || l.sns_stories || l.sns_live
  ).length;
  const salesCount = thisMonthLogs.filter((l) => l.sales_offer).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100 to-orange-50 flex items-center justify-center">
        <div className="text-yellow-700 text-lg">読み込み中...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100 to-orange-50 pb-12">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur border-b border-yellow-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍌</span>
            <span className="font-bold text-yellow-800">
              {student?.name || ""}さん
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 px-3 py-1 rounded-full text-sm font-bold text-yellow-800">
              🔥 {streak}日連続
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        {/* Progress Summary */}
        <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-5 border border-yellow-200">
          <h2 className="text-lg font-bold text-yellow-800 mb-3">今月の進捗</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{learningCount}</div>
              <div className="text-xs text-yellow-600 mt-1">学習日数</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{snsCount}</div>
              <div className="text-xs text-blue-600 mt-1">SNS発信日数</div>
            </div>
            <div className="bg-pink-50 rounded-xl p-3 text-center border border-pink-200">
              <div className="text-2xl font-bold text-pink-700">{salesCount}</div>
              <div className="text-xs text-pink-600 mt-1">セールス日数</div>
            </div>
          </div>

          {/* Activity Calendar (last 30 days) */}
          <div className="mt-4">
            <p className="text-xs text-yellow-600 mb-2">直近30日間</p>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 30 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - (29 - i));
                const dateStr = d.toISOString().split("T")[0];
                const hasLog = logs.some((l) => l.date === dateStr);
                return (
                  <div
                    key={dateStr}
                    title={dateStr}
                    className={`w-6 h-6 rounded text-xs flex items-center justify-center ${
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
          </div>
        </section>

        {/* Daily Input Form */}
        <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-5 border border-yellow-200">
          <h2 className="text-lg font-bold text-yellow-800 mb-4">
            今日やったことを記録しよう！
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Learning */}
            <div>
              <p className="text-sm font-bold text-yellow-700 mb-2">📚 学習</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "グルコン", checked: grucon, set: setGrucon },
                  { label: "コアライブ", checked: coreLive, set: setCoreLive },
                  { label: "セミナー", checked: seminar, set: setSeminar },
                  { label: "コンテンツ視聴", checked: contentWatch, set: setContentWatch },
                ].map((item) => (
                  <label
                    key={item.label}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      item.checked
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-yellow-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => item.set(e.target.checked)}
                      className="accent-yellow-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* SNS */}
            <div>
              <p className="text-sm font-bold text-blue-700 mb-2">📱 SNS発信</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "リール", checked: snsReel, set: setSnsReel },
                  { label: "スレッズ", checked: snsThreads, set: setSnsThreads },
                  { label: "ストーリーズ", checked: snsStories, set: setSnsStories },
                  { label: "ライブ", checked: snsLive, set: setSnsLive },
                ].map((item) => (
                  <label
                    key={item.label}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      item.checked
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => item.set(e.target.checked)}
                      className="accent-blue-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sales */}
            <div>
              <p className="text-sm font-bold text-pink-700 mb-2">💰 セールス</p>
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  salesOffer
                    ? "border-pink-400 bg-pink-50"
                    : "border-gray-200 hover:border-pink-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={salesOffer}
                  onChange={(e) => setSalesOffer(e.target.checked)}
                  className="accent-pink-500 w-4 h-4"
                />
                <span className="text-sm text-gray-700">セールス・オファーできた</span>
              </label>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm font-bold text-yellow-700 mb-2">📝 今日やったこと</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none bg-white text-sm"
                placeholder="今日取り組んだことを自由に書いてください"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-lg transition-colors disabled:opacity-50 shadow-md text-lg"
            >
              {submitting ? "送信中..." : "記録する 🍌"}
            </button>
          </form>
        </section>

        {/* Risa Message */}
        {latestMessage && (
          <section className="flex flex-col items-center">
            <BananaRisa size={100} message={latestMessage} />
          </section>
        )}

        {/* Past Messages */}
        {logs.length > 0 && (
          <section className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-5 border border-yellow-200">
            <h2 className="text-lg font-bold text-yellow-800 mb-3">
              りささんからのメッセージ履歴
            </h2>
            <div className="space-y-3">
              {logs
                .filter((l) => l.ai_message)
                .slice(0, 10)
                .map((log) => (
                  <div
                    key={log.id}
                    className="bg-yellow-50 rounded-lg p-3 border border-yellow-200"
                  >
                    <div className="text-xs text-yellow-600 mb-1">{log.date}</div>
                    <p className="text-sm text-gray-700">{log.ai_message}</p>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
