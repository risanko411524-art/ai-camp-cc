"use client";

import { useState, useEffect } from "react";

interface Member {
  id: string;
  name: string;
  email: string;
  gender: string;
  location: string;
  career: string;
  concern: string;
  ideal_future: string;
  available_hours: string;
  ai_level: string;
  photo_url: string | null;
  student_number: number;
  student_id: string;
  created_at: string;
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        onLogin();
      } else {
        setError("パスワードが違います");
      }
    } catch {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-pink-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <p className="text-emerald-600 font-bold text-3xl tracking-widest">The Start Up</p>
          <h1 className="text-xl font-bold text-gray-800 mt-2">講師ページ</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
              placeholder="パスワードを入力"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 shadow-md cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </button>
        </form>
      </div>
    </main>
  );
}

function MemberCard({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-emerald-50 transition-colors"
      >
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt={member.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
            {member.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800">{member.name}</p>
          <p className="text-emerald-600 text-xs font-mono">{member.student_id || `TSU-${String(member.student_number).padStart(4, "0")}`}</p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>{member.location || "-"}</p>
          <p>{new Date(member.created_at).toLocaleDateString("ja-JP")}</p>
        </div>
        <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-gray-400 text-xs">メール</p>
              <p className="text-gray-700">{member.email}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">性別</p>
              <p className="text-gray-700">{member.gender || "-"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">活動可能時間</p>
              <p className="text-gray-700">{member.available_hours || "-"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">AIレベル</p>
              <p className="text-gray-700">{member.ai_level || "-"}</p>
            </div>
          </div>
          <div>
            <p className="text-gray-400 text-xs">経歴</p>
            <p className="text-gray-700">{member.career || "-"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">お悩み</p>
            <p className="text-gray-700 bg-white rounded-lg p-2">{member.concern || "-"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">理想の未来</p>
            <p className="text-gray-700 bg-emerald-50 rounded-lg p-2">{member.ideal_future || "-"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TeacherDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch("/api/teacher/members");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setMembers(data.members || []);
      } catch {
        setError("データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-pink-50 to-white flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-pink-50 to-white flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-pink-50 to-white">
      <header className="bg-white/80 backdrop-blur border-b border-emerald-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-emerald-600 font-bold text-xl tracking-widest">The Start Up</p>
            <p className="text-gray-500 text-xs">講師ダッシュボード</p>
          </div>
          <p className="text-emerald-600 font-bold text-sm">全 {members.length} 名</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {members.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">まだ受講生はいません</p>
          </div>
        ) : (
          members.map((m) => <MemberCard key={m.id} member={m} />)
        )}
      </div>
    </main>
  );
}

export default function TeacherPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/teacher/members");
        if (res.ok) {
          setAuthenticated(true);
        }
      } catch {
        // not authenticated
      } finally {
        setChecking(false);
      }
    }
    checkAuth();
  }, []);

  if (checking) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-pink-50 to-white flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </main>
    );
  }

  if (!authenticated) {
    return <LoginForm onLogin={() => setAuthenticated(true)} />;
  }

  return <TeacherDashboard />;
}
