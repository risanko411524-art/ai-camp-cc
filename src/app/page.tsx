"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BananaRisaCharacter from "./components/BananaRisaCharacter";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");

  function handleGoToMyPage(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim()) {
      router.push(`/student/${encodeURIComponent(name.trim())}`);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100/30 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        {/* ヘッダー */}
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-800 tracking-wide mb-2">
          🍌 バナナグループ
        </h1>
        <p className="text-yellow-600 text-lg mb-8">ビジネス加速アプリ</p>

        {/* りささんキャラクター */}
        <div className="mb-8">
          <BananaRisaCharacter
            mood="normal"
            message="今日も一歩ずつ前に進もう！"
            size={160}
          />
        </div>

        {/* 名前入力 → マイページ */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-yellow-200 mb-6">
          <h2 className="text-lg font-bold text-yellow-800 mb-4">
            マイページへログイン
          </h2>
          <form onSubmit={handleGoToMyPage} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="お名前を入力してください"
              required
              className="w-full rounded-lg border border-yellow-300 px-4 py-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-center"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-yellow-900 font-bold py-3 rounded-lg transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              マイページへ
            </button>
          </form>
        </div>

        {/* リンク */}
        <div className="flex flex-col gap-3">
          <Link
            href="/survey"
            className="block bg-white border-2 border-yellow-300 text-yellow-800 font-semibold py-3 px-6 rounded-lg hover:bg-yellow-50 transition-colors"
          >
            📋 初回アンケートはこちら
          </Link>
          <Link
            href="/admin"
            className="text-yellow-600 text-sm hover:text-yellow-800 transition-colors underline"
          >
            講師用管理ページ
          </Link>
        </div>
      </div>
    </main>
  );
}
