"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentId.toUpperCase(), password }),
      });

      const data = await res.json();

      if (data.needsPassword) {
        router.push(`/setup-password?id=${encodeURIComponent(studentId.toUpperCase())}`);
        return;
      }

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
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-pink-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 md:p-10">
        <p className="text-center text-emerald-600 font-bold text-3xl md:text-4xl tracking-widest mb-3">
          The Start Up
        </p>
        <h1 className="text-xl font-bold text-center text-gray-800 mb-8">
          受講生ログイン
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
              受講生ID
            </label>
            <input
              id="studentId"
              type="text"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent uppercase"
              placeholder="TSU-0001"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              placeholder="パスワードを入力"
            />
            <p className="text-xs text-gray-400 mt-1">
              初回ログインの場合はパスワード欄は空のまま送信してください
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 disabled:from-emerald-200 disabled:to-emerald-300 text-white font-bold py-4 rounded-lg transition-all text-lg cursor-pointer disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </main>
  );
}
