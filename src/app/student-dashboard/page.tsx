"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Profile {
  studentId: string;
  name: string;
  email: string;
  gender: string;
  location: string;
  career: string;
  concern: string;
  ideal_future: string;
  available_hours: string;
  ai_level: string;
  group_key: string;
  photo_url: string | null;
  created_at: string;
}

interface GroupInfo {
  name: string;
  description: string;
}

interface ProfileData {
  profile: Profile;
  group: GroupInfo | null;
  chatLink: string | null;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/student/profile");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/student/login", { method: "DELETE" });
    router.push("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-pink-50 to-white flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </main>
    );
  }

  if (!data) return null;

  const { profile, group, chatLink } = data;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-pink-50 to-white px-4 py-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-600 font-bold text-2xl tracking-widest">The Start Up</p>
            <p className="text-gray-500 text-sm">マイページ</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600 text-sm underline"
          >
            ログアウト
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            {profile.photo_url ? (
              <img
                src={profile.photo_url}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-emerald-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold">
                {profile.name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
              <p className="text-emerald-600 font-mono font-bold">{profile.studentId}</p>
              <p className="text-gray-400 text-xs mt-1">
                登録日: {new Date(profile.created_at).toLocaleDateString("ja-JP")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs">メール</p>
              <p className="text-gray-700">{profile.email}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">性別</p>
              <p className="text-gray-700">{profile.gender || "-"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">地域</p>
              <p className="text-gray-700">{profile.location || "-"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">活動可能時間</p>
              <p className="text-gray-700">{profile.available_hours || "-"}</p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs">経歴</p>
              <p className="text-gray-700">{profile.career || "-"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">AIの活用度</p>
              <p className="text-gray-700">{profile.ai_level || "-"}</p>
            </div>
          </div>
        </div>

        {/* OpenChat Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <p className="text-xs text-emerald-600 font-medium mb-2">コミュニティ</p>
          <h3 className="text-xl font-bold text-gray-800 mb-2">TheStartUp総合オープンチャット</h3>
          <p className="text-gray-600 text-sm mb-4">受講生全員が参加するコミュニティです</p>
          <a
            href="https://line.me/ti/g2/XXXXXX"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition-all text-center shadow-md hover:shadow-lg"
          >
            オープンチャットに参加する
          </a>
        </div>

        {/* Goals Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">あなたの目標</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-1">今のお悩み</p>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-3">{profile.concern}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">3ヶ月後の理想の未来</p>
              <p className="text-gray-700 bg-emerald-50 rounded-lg p-3">{profile.ideal_future}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
