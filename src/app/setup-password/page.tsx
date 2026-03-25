"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SetupPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id") || "";

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }

    if (password !== passwordConfirm) {
      setError("パスワードが一致しません");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/student/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      router.push("/student-dashboard");
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="text-center text-emerald-600 font-bold text-3xl md:text-4xl tracking-widest mb-3">
        The Start Up
      </p>
      <h1 className="text-xl font-bold text-center text-gray-800 mb-2">
        パスワード設定
      </h1>
      <p className="text-center text-gray-500 text-sm mb-8">
        <span className="font-mono font-bold text-emerald-600">{studentId}</span> のパスワードを設定してください
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード（6文字以上）
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            placeholder="パスワードを入力"
          />
        </div>

        <div>
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード（確認）
          </label>
          <input
            id="passwordConfirm"
            type="password"
            required
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            placeholder="もう一度入力"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 disabled:from-emerald-200 disabled:to-emerald-300 text-white font-bold py-4 rounded-lg transition-all text-lg cursor-pointer disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {loading ? "設定中..." : "パスワードを設定する"}
        </button>
      </form>
    </>
  );
}

export default function SetupPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-pink-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 md:p-10">
        <Suspense fallback={<p className="text-center text-gray-500">読み込み中...</p>}>
          <SetupPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
