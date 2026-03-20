"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type AdminData = {
  summary: {
    totalMembers: number;
    activeMembers: number;
    totalContents: number;
    achieverCount: number;
  };
  concernDistribution: {
    concern: string;
    count: number;
    percentage: number;
  }[];
  contentGap: {
    category: string;
    demandCount: number;
    demandPercent: number;
    contentCount: number;
    gap: string;
  }[];
  members: {
    name: string;
    joinDate: string;
    job: string;
    mainConcern: string;
    hasAchievement: boolean;
  }[];
};

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">読み込み中...</p>
      </div>
    );
  }

  if (!data) return null;

  const maxConcernCount = Math.max(...data.concernDistribution.map((c) => c.count));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">運営ダッシュボード</h1>
            <p className="text-sm text-gray-500 mt-1">
              受講生の課題分析 & コンテンツレコメンド管理
            </p>
          </div>
          <span className="text-emerald-600 font-bold text-xl tracking-widest">
            ProjectF
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="総受講生数" value={data.summary.totalMembers} unit="名" />
          <SummaryCard label="在籍中" value={data.summary.activeMembers} unit="名" />
          <SummaryCard label="コンテンツ数" value={data.summary.totalContents} unit="本" />
          <SummaryCard label="成果報告者" value={data.summary.achieverCount} unit="名" />
        </div>

        {/* Content Gap Analysis */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            コンテンツギャップ分析
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            受講生の課題（需要）と既存コンテンツ（供給）の差分
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">カテゴリ</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">需要（件数）</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">需要（%）</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">コンテンツ数</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">充足度</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">アクション</th>
                </tr>
              </thead>
              <tbody>
                {data.contentGap.map((row) => (
                  <tr key={row.category} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{row.category}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{row.demandCount}</td>
                    <td className="py-3 px-4 text-center text-gray-700">{row.demandPercent}%</td>
                    <td className="py-3 px-4 text-center text-gray-700">{row.contentCount}本</td>
                    <td className="py-3 px-4 text-center">
                      <GapBadge gap={row.gap} />
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {row.gap === "なし"
                        ? "最優先でコンテンツ作成"
                        : row.gap === "不足"
                          ? "コンテンツ追加を検討"
                          : "現状維持"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Concern Distribution */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            受講生の課題分布
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            事前課題・グルコン・セッションから集計した悩み
          </p>
          <div className="space-y-3">
            {data.concernDistribution.slice(0, 15).map((item) => (
              <div key={item.concern} className="flex items-center gap-4">
                <div className="w-56 text-sm text-gray-700 shrink-0 truncate">
                  {item.concern}
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(item.count / maxConcernCount) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">{item.count}</span>
                  </div>
                </div>
                <div className="w-12 text-right text-sm text-gray-500">{item.percentage}%</div>
              </div>
            ))}
          </div>
        </section>

        {/* Member List with Recommendations */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            受講生一覧 & おすすめコンテンツ
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            各受講生をクリックすると個別の詳細・おすすめコンテンツが見られます
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">名前</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">職種</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">入会日</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">主な課題</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">成果</th>
                </tr>
              </thead>
              <tbody>
                {data.members.map((m) => (
                  <tr
                    key={m.name}
                    className="border-b border-gray-100 hover:bg-emerald-50 cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/member/${encodeURIComponent(m.name)}`}
                        className="text-emerald-600 font-medium hover:underline"
                      >
                        {m.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{m.job}</td>
                    <td className="py-3 px-4 text-gray-700">{m.joinDate}</td>
                    <td className="py-3 px-4 text-gray-700">{m.mainConcern}</td>
                    <td className="py-3 px-4 text-center">
                      {m.hasAchievement ? (
                        <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                          あり
                        </span>
                      ) : (
                        <span className="inline-block bg-gray-100 text-gray-500 text-xs font-medium px-2 py-1 rounded-full">
                          なし
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">
        {value}
        <span className="text-base font-normal text-gray-500 ml-1">{unit}</span>
      </p>
    </div>
  );
}

function GapBadge({ gap }: { gap: string }) {
  if (gap === "なし") {
    return (
      <span className="inline-block bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
        なし
      </span>
    );
  }
  if (gap === "不足") {
    return (
      <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-medium px-2 py-1 rounded-full">
        不足
      </span>
    );
  }
  return (
    <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
      充実
    </span>
  );
}
