"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      gender: (form.elements.namedItem("gender") as HTMLSelectElement).value,
      location: (form.elements.namedItem("location") as HTMLSelectElement).value,
      career: (form.elements.namedItem("career") as HTMLTextAreaElement).value,
      concern: (form.elements.namedItem("concern") as HTMLTextAreaElement).value,
      idealFuture: (form.elements.namedItem("idealFuture") as HTMLTextAreaElement).value,
      availableHours: (form.elements.namedItem("availableHours") as HTMLSelectElement).value,
      aiLevel: (form.elements.namedItem("aiLevel") as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("送信に失敗しました。");
      }

      const result = await res.json();
      router.push(`/result?group=${result.group}`);
    } catch {
      setError("送信に失敗しました。もう一度お試しください。");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-pink-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 md:p-10">
        <p className="text-center text-emerald-600 font-bold text-3xl md:text-4xl tracking-widest mb-3">
          The Start Up
        </p>
        <p className="text-center text-gray-700 font-bold text-lg md:text-xl mb-1">
          入会おめでとうございます！
        </p>
        <p className="text-center text-gray-500 text-sm mb-1">
          これから一緒に人生を変えていきましょう
        </p>
        <h1 className="text-lg md:text-xl font-bold text-center text-gray-800 mb-6">
          あなたの現状を教えてください
        </h1>

        <p className="text-center text-gray-500 mb-8 text-sm">
          回答をもとに、あなたにぴったりのグループをご案内します
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              お名前
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              placeholder="山田 太郎"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              性別
            </label>
            <select
              id="gender"
              name="gender"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white"
            >
              <option value="">選択してください</option>
              <option value="男性">男性</option>
              <option value="女性">女性</option>
              <option value="その他">その他</option>
              <option value="回答しない">回答しない</option>
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              お住まいの地域
            </label>
            <select
              id="location"
              name="location"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white"
            >
              <option value="">選択してください</option>
              <optgroup label="北海道・東北">
                <option value="北海道">北海道</option>
                <option value="青森県">青森県</option>
                <option value="岩手県">岩手県</option>
                <option value="宮城県">宮城県</option>
                <option value="秋田県">秋田県</option>
                <option value="山形県">山形県</option>
                <option value="福島県">福島県</option>
              </optgroup>
              <optgroup label="関東">
                <option value="茨城県">茨城県</option>
                <option value="栃木県">栃木県</option>
                <option value="群馬県">群馬県</option>
                <option value="埼玉県">埼玉県</option>
                <option value="千葉県">千葉県</option>
                <option value="東京都">東京都</option>
                <option value="神奈川県">神奈川県</option>
              </optgroup>
              <optgroup label="中部">
                <option value="新潟県">新潟県</option>
                <option value="富山県">富山県</option>
                <option value="石川県">石川県</option>
                <option value="福井県">福井県</option>
                <option value="山梨県">山梨県</option>
                <option value="長野県">長野県</option>
                <option value="岐阜県">岐阜県</option>
                <option value="静岡県">静岡県</option>
                <option value="愛知県">愛知県</option>
              </optgroup>
              <optgroup label="近畿">
                <option value="三重県">三重県</option>
                <option value="滋賀県">滋賀県</option>
                <option value="京都府">京都府</option>
                <option value="大阪府">大阪府</option>
                <option value="兵庫県">兵庫県</option>
                <option value="奈良県">奈良県</option>
                <option value="和歌山県">和歌山県</option>
              </optgroup>
              <optgroup label="中国">
                <option value="鳥取県">鳥取県</option>
                <option value="島根県">島根県</option>
                <option value="岡山県">岡山県</option>
                <option value="広島県">広島県</option>
                <option value="山口県">山口県</option>
              </optgroup>
              <optgroup label="四国">
                <option value="徳島県">徳島県</option>
                <option value="香川県">香川県</option>
                <option value="愛媛県">愛媛県</option>
                <option value="高知県">高知県</option>
              </optgroup>
              <optgroup label="九州・沖縄">
                <option value="福岡県">福岡県</option>
                <option value="佐賀県">佐賀県</option>
                <option value="長崎県">長崎県</option>
                <option value="熊本県">熊本県</option>
                <option value="大分県">大分県</option>
                <option value="宮崎県">宮崎県</option>
                <option value="鹿児島県">鹿児島県</option>
                <option value="沖縄県">沖縄県</option>
              </optgroup>
              <optgroup label="海外">
                <option value="海外">海外</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label htmlFor="career" className="block text-sm font-medium text-gray-700 mb-1">
              これまでの経歴を教えてください
            </label>
            <textarea
              id="career"
              name="career"
              required
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
              placeholder="例：営業職5年 → マーケティング部門3年、副業経験なし"
            />
          </div>

          <div>
            <label htmlFor="concern" className="block text-sm font-medium text-gray-700 mb-1">
              今のお悩みを教えてください
            </label>
            <textarea
              id="concern"
              name="concern"
              required
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
              placeholder="例：何かビジネスを始めたいけど、自分に何ができるかわからない..."
            />
          </div>

          <div>
            <label htmlFor="idealFuture" className="block text-sm font-medium text-gray-700 mb-1">
              3ヶ月後、どうなっていたいですか？
            </label>
            <textarea
              id="idealFuture"
              name="idealFuture"
              required
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent resize-none"
              placeholder="例：自分の強みを活かした副業で、最初の1万円を稼いでいたい..."
            />
          </div>

          <div>
            <label htmlFor="availableHours" className="block text-sm font-medium text-gray-700 mb-1">
              1日のうちでTheStartUpの活動に使える時間
            </label>
            <select
              id="availableHours"
              name="availableHours"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-white"
            >
              <option value="">選択してください</option>
              <option value="30分未満">30分未満</option>
              <option value="30分〜1時間">30分〜1時間</option>
              <option value="1〜2時間">1〜2時間</option>
              <option value="2〜3時間">2〜3時間</option>
              <option value="3時間以上">3時間以上</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              AIの活用度を教えてください
            </label>
            <div className="space-y-2">
              {[
                { value: "まったく使ったことがない", label: "まったく使ったことがない" },
                { value: "ChatGPTなどを少し触った程度", label: "ChatGPTなどを少し触った程度" },
                { value: "日常的にAIを使っている", label: "日常的にAIを使っている（調べもの・文章作成など）" },
                { value: "業務や副業でAIを活用している", label: "業務や副業でAIを活用している" },
                { value: "AIを使ったサービスや自動化を構築したことがある", label: "AIを使ったサービスや自動化を構築したことがある" },
              ].map((option) => (
                <label key={option.value} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                  <input
                    type="radio"
                    name="aiLevel"
                    value={option.value}
                    required
                    className="mt-0.5 w-4 h-4 text-emerald-500 focus:ring-emerald-400"
                  />
                  <span className="text-gray-700 text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 disabled:from-emerald-200 disabled:to-emerald-300 text-white font-bold py-4 rounded-lg transition-all text-lg cursor-pointer disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isSubmitting ? "送信中..." : "送信する"}
          </button>
        </form>
      </div>
    </main>
  );
}
