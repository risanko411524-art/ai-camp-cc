"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BananaRisa from "../components/BananaRisa";

const STAGES = [
  { value: "stage1", label: "Stage 1：自己理解・コンセプト期" },
  { value: "stage2", label: "Stage 2：商品設計期" },
  { value: "stage3", label: "Stage 3：初集客・検証期" },
  { value: "stage4", label: "Stage 4：フロント安定期" },
  { value: "stage5", label: "Stage 5：マネタイズ構築期" },
  { value: "stage6", label: "Stage 6：仕組み化・拡大期" },
];

const MISSING_ELEMENTS = ["スキル・知識", "時間", "マインド", "環境"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // Step 2 fields (survey)
  const [businessStage, setBusinessStage] = useState("");
  const [missingElement, setMissingElement] = useState("");
  const [currentChallenge, setCurrentChallenge] = useState("");
  const [idealFuture, setIdealFuture] = useState("");
  const [monthlyGoals, setMonthlyGoals] = useState("");
  const [mainTask, setMainTask] = useState("");
  const [otherInfo, setOtherInfo] = useState("");

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError("パスワードが一致しません");
      return;
    }
    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }
    setError("");
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          business_stage: businessStage,
          missing_element: missingElement,
          current_challenge: currentChallenge,
          ideal_future: idealFuture,
          monthly_goals: monthlyGoals,
          main_task: mainTask,
          other_info: otherInfo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 via-yellow-100 to-orange-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <BananaRisa size={100} />
          <h1 className="text-2xl font-bold text-yellow-800 mt-3">新規登録</h1>
          <div className="flex justify-center gap-2 mt-3">
            <div className={`w-8 h-2 rounded-full ${step >= 1 ? "bg-yellow-400" : "bg-yellow-200"}`} />
            <div className={`w-8 h-2 rounded-full ${step >= 2 ? "bg-yellow-400" : "bg-yellow-200"}`} />
          </div>
          <p className="text-sm text-yellow-600 mt-2">
            {step === 1 ? "Step 1: アカウント情報" : "Step 2: 現状把握アンケート"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form
            onSubmit={handleStep1}
            className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 space-y-4 border border-yellow-200"
          >
            <div>
              <label className="block text-sm font-medium text-yellow-800 mb-1">
                名前（フルネーム）<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                placeholder="山田 花子"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-800 mb-1">
                メールアドレス<span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-800 mb-1">
                パスワード<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                placeholder="6文字以上"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yellow-800 mb-1">
                パスワード（確認）<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                required
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none bg-white"
                placeholder="もう一度入力"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-lg transition-colors shadow-md"
            >
              次へ →
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-yellow-700 hover:text-yellow-900 text-sm underline underline-offset-2"
              >
                すでにアカウントをお持ちの方
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 space-y-5 border border-yellow-200"
          >
            <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              今の「現在地」を知ることは、理想の未来への近道です🍌
              <br />
              ありのまま、正直に回答してくださいね！
            </p>

            {/* Q1: Business Stage */}
            <div>
              <label className="block text-sm font-bold text-yellow-800 mb-2">
                あなたのビジネスの「現在地」を教えてください<span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {STAGES.map((s) => (
                  <label
                    key={s.value}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      businessStage === s.value
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-yellow-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="businessStage"
                      value={s.value}
                      checked={businessStage === s.value}
                      onChange={(e) => setBusinessStage(e.target.value)}
                      required
                      className="mr-3 accent-yellow-500"
                    />
                    <span className="text-sm text-gray-700">{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q2: Missing Element */}
            <div>
              <label className="block text-sm font-bold text-yellow-800 mb-2">
                現在の課題を解決するために最も足りない要素<span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MISSING_ELEMENTS.map((el) => (
                  <label
                    key={el}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      missingElement === el
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-yellow-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="missingElement"
                      value={el}
                      checked={missingElement === el}
                      onChange={(e) => setMissingElement(e.target.value)}
                      required
                      className="mr-2 accent-yellow-500"
                    />
                    <span className="text-sm text-gray-700">{el}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Q3: Current Challenge */}
            <div>
              <label className="block text-sm font-bold text-yellow-800 mb-1">
                現在の悩み・課題<span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={currentChallenge}
                onChange={(e) => setCurrentChallenge(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none bg-white text-sm"
                placeholder="今、一番悩んでいることを書いてください"
              />
            </div>

            {/* Q4: Ideal Future */}
            <div>
              <label className="block text-sm font-bold text-yellow-800 mb-1">
                3ヶ月後の理想の状態<span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={idealFuture}
                onChange={(e) => setIdealFuture(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none bg-white text-sm"
                placeholder="3ヶ月後、どうなっていたいですか？"
              />
            </div>

            {/* Q5: Monthly Goals */}
            <div>
              <label className="block text-sm font-bold text-yellow-800 mb-1">
                今月の行動目標3つ
              </label>
              <textarea
                value={monthlyGoals}
                onChange={(e) => setMonthlyGoals(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none bg-white text-sm"
                placeholder="1. &#10;2. &#10;3. "
              />
            </div>

            {/* Q6: Main Task */}
            <div>
              <label className="block text-sm font-bold text-yellow-800 mb-1">
                現在最も時間を割いている作業
              </label>
              <textarea
                value={mainTask}
                onChange={(e) => setMainTask(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none bg-white text-sm"
                placeholder="日々、何に一番時間を使っていますか？"
              />
            </div>

            {/* Q7: Other */}
            <div>
              <label className="block text-sm font-bold text-yellow-800 mb-1">
                その他伝えたいこと
              </label>
              <textarea
                value={otherInfo}
                onChange={(e) => setOtherInfo(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-yellow-300 focus:ring-2 focus:ring-yellow-400 outline-none bg-white text-sm"
                placeholder="何でもお気軽にどうぞ"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors"
              >
                ← 戻る
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-lg transition-colors disabled:opacity-50 shadow-md"
              >
                {loading ? "登録中..." : "登録する 🍌"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
