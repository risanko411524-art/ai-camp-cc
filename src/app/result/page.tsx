"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const GROUPS = {
  A: {
    name: "やりたいこと探索グループ",
    description: "やりたいことがまだ見つかっていない仲間と一緒に、自分だけの方向性を見つけていきましょう！",
    chatLink: "https://example.com/openchat/group-a",
    color: "emerald",
  },
  B: {
    name: "強み発見グループ",
    description: "自分の強みがわからない仲間と一緒に、あなただけの武器を見つけていきましょう！",
    chatLink: "https://example.com/openchat/group-b",
    color: "blue",
  },
  C: {
    name: "はじめの一歩グループ",
    description: "一歩を踏み出せない仲間と一緒に、行動できる自分に変わっていきましょう！",
    chatLink: "https://example.com/openchat/group-c",
    color: "pink",
  },
} as const;

type GroupKey = keyof typeof GROUPS;

function ResultContent() {
  const searchParams = useSearchParams();
  const groupKey = searchParams.get("group") as GroupKey | null;

  if (!groupKey || !GROUPS[groupKey]) {
    return (
      <div className="text-center">
        <p className="text-gray-600">グループ情報が見つかりませんでした。</p>
      </div>
    );
  }

  const group = GROUPS[groupKey];

  return (
    <>
      <p className="text-center text-emerald-600 font-bold text-3xl md:text-4xl tracking-widest mb-3">
        The Start Up
      </p>
      <p className="text-center text-gray-700 font-bold text-lg md:text-xl mb-6">
        あなたにぴったりのグループが見つかりました！
      </p>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6 text-center">
        <p className="text-sm text-emerald-600 font-medium mb-2">あなたのグループ</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          {group.name}
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          {group.description}
        </p>
      </div>

      <a
        href={group.chatLink}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-4 rounded-lg transition-all text-lg text-center shadow-md hover:shadow-lg mb-4"
      >
        オープンチャットに参加する
      </a>

      <p className="text-center text-gray-400 text-xs">
        ※ボタンをタップするとLINEオープンチャットが開きます
      </p>
    </>
  );
}

export default function Result() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-pink-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 md:p-10">
        <Suspense fallback={<p className="text-center text-gray-500">読み込み中...</p>}>
          <ResultContent />
        </Suspense>
      </div>
    </main>
  );
}
