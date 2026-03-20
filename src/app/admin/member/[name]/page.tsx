"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

type ActionRecommendation = {
  type: "action";
  priority: number;
  title: string;
  reason: string;
  category: string;
};

type MemberData = {
  member: {
    name: string;
    joinDate: string;
    job: string;
    status: string;
  };
  preTask: {
    mainConcern: string;
    currentRevenue: number;
    targetRevenue: number;
    triedBefore: string;
    weeklyHours: number;
  } | null;
  concerns: string[];
  topCategories: string[];
  recommended: {
    id: string;
    title: string;
    category: string;
    format: string;
    duration: number;
    url: string;
  }[];
  actions: ActionRecommendation[];
  seminar: {
    method: string;
    focus: number;
    acceleration: number;
    enjoyment: number;
    actionPlan: number;
    feedback: string;
  } | null;
  gcCount: number;
  sessionCount: number;
  hasAchievement: boolean;
  achievement: {
    revenueBefore: number;
    revenueAfter: number;
    strategy: string;
    bestContent: string;
    bestSupport: string;
  } | null;
};

export default function MemberDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const [data, setData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/member/${encodeURIComponent(name)}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [name]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">読み込み中...</p>
      </div>
    );
  }

  if (!data || !data.member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">受講生が見つかりません</p>
      </div>
    );
  }

  // Count concerns by frequency
  const concernCounts: Record<string, number> = {};
  for (const c of data.concerns) {
    concernCounts[c] = (concernCounts[c] || 0) + 1;
  }
  const sortedConcerns = Object.entries(concernCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/admin"
            className="text-sm text-emerald-600 hover:underline"
          >
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {data.member.name}
          </h1>
          <p className="text-sm text-gray-500">
            {data.member.job} ・ 入会日: {data.member.joinDate}
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Profile Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">入会時の悩み</p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {data.preTask?.mainConcern || "不明"}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">グルコン参加回数</p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {data.gcCount}回
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">個別セッション回数</p>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {data.sessionCount}回
            </p>
          </div>
        </div>

        {/* Pre-task details */}
        {data.preTask && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">入会時の情報</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">現在の月商</p>
                <p className="font-semibold text-gray-900">{data.preTask.currentRevenue}万円</p>
              </div>
              <div>
                <p className="text-gray-500">目標月商</p>
                <p className="font-semibold text-gray-900">{data.preTask.targetRevenue}万円</p>
              </div>
              <div>
                <p className="text-gray-500">過去に試したこと</p>
                <p className="font-semibold text-gray-900">{data.preTask.triedBefore}</p>
              </div>
              <div>
                <p className="text-gray-500">週に使える時間</p>
                <p className="font-semibold text-gray-900">{data.preTask.weeklyHours}時間</p>
              </div>
            </div>
          </section>
        )}

        {/* Achievement */}
        {data.hasAchievement && data.achievement && (
          <section className="bg-emerald-50 rounded-xl border border-emerald-200 p-6">
            <h2 className="text-lg font-bold text-emerald-800 mb-4">成果報告あり</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-emerald-600">入会前月商</p>
                <p className="font-semibold text-emerald-900">{data.achievement.revenueBefore}万円</p>
              </div>
              <div>
                <p className="text-emerald-600">現在月商</p>
                <p className="font-semibold text-emerald-900">{data.achievement.revenueAfter}万円</p>
              </div>
              <div>
                <p className="text-emerald-600">成果が出た施策</p>
                <p className="font-semibold text-emerald-900">{data.achievement.strategy}</p>
              </div>
              <div>
                <p className="text-emerald-600">役に立ったコンテンツ</p>
                <p className="font-semibold text-emerald-900">{data.achievement.bestContent}</p>
              </div>
            </div>
          </section>
        )}

        {/* Seminar Data */}
        {data.seminar && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">直近のセミナーアンケート</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-gray-500">参加方法</p>
                <p className="font-semibold text-gray-900">{data.seminar.method}</p>
              </div>
              <div>
                <p className="text-gray-500">集中度</p>
                <p className={`font-semibold ${data.seminar.focus >= 8 ? "text-emerald-600" : data.seminar.focus >= 6 ? "text-yellow-600" : "text-red-600"}`}>
                  {data.seminar.focus}/10
                </p>
              </div>
              <div>
                <p className="text-gray-500">ビジネス加速度</p>
                <p className={`font-semibold ${data.seminar.acceleration >= 8 ? "text-emerald-600" : data.seminar.acceleration >= 6 ? "text-yellow-600" : "text-red-600"}`}>
                  {data.seminar.acceleration}/10
                </p>
              </div>
              <div>
                <p className="text-gray-500">楽しめたか</p>
                <p className={`font-semibold ${data.seminar.enjoyment >= 8 ? "text-emerald-600" : data.seminar.enjoyment >= 6 ? "text-yellow-600" : "text-red-600"}`}>
                  {data.seminar.enjoyment}/10
                </p>
              </div>
              <div>
                <p className="text-gray-500">アクションプラン</p>
                <p className={`font-semibold ${data.seminar.actionPlan >= 8 ? "text-emerald-600" : data.seminar.actionPlan >= 6 ? "text-yellow-600" : "text-red-600"}`}>
                  {data.seminar.actionPlan}/10
                </p>
              </div>
            </div>
            {data.seminar.feedback && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-1">コメント</p>
                <p className="text-sm text-gray-700">{data.seminar.feedback}</p>
              </div>
            )}
          </section>
        )}

        {/* Action Recommendations */}
        {data.actions && data.actions.length > 0 && (
          <section className="bg-amber-50 rounded-xl border border-amber-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              おすすめアクション
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              セミナー・行動データから自動生成
            </p>
            <div className="space-y-2">
              {data.actions.map((action, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">
                      {action.category}
                    </span>
                    <span className="text-xs text-gray-400">優先度{action.priority}</span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{action.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{action.reason}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Concerns from all sources */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            この受講生の悩み・相談履歴
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            事前課題・グルコン・セッションから収集
          </p>
          {sortedConcerns.length > 0 ? (
            <div className="space-y-2">
              {sortedConcerns.map(([concern, count]) => (
                <div key={concern} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-64 shrink-0">{concern}</span>
                  <div className="flex gap-1">
                    {Array.from({ length: count }).map((_, i) => (
                      <span
                        key={i}
                        className="w-6 h-6 bg-emerald-500 rounded"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{count}回</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">データなし</p>
          )}

          {data.topCategories.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">課題カテゴリ（頻度順）</p>
              <div className="flex gap-2 flex-wrap">
                {data.topCategories.map((cat) => (
                  <span
                    key={cat}
                    className="bg-emerald-100 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Recommended Contents */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            おすすめコンテンツ
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            この受講生の課題カテゴリに合うコンテンツ
          </p>
          {data.recommended.length > 0 ? (
            <div className="space-y-3">
              {data.recommended.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50"
                >
                  <div className="shrink-0">
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
                      {content.format}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{content.title}</p>
                    <p className="text-sm text-gray-500">
                      {content.category}
                      {content.duration > 0 && ` ・ ${content.duration}分`}
                    </p>
                  </div>
                  <span className="shrink-0 bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                    {content.category}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">該当するコンテンツがありません</p>
          )}
        </section>
      </main>
    </div>
  );
}
