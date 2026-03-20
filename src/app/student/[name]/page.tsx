"use client";

import { useState, useEffect, use } from "react";

type ActionRecommendation = {
  type: "action";
  priority: number;
  title: string;
  reason: string;
  category: string;
};

type SeminarRecord = {
  date: string;
  method: string;
  focus: number;
  acceleration: number;
  enjoyment: number;
  actionPlan: number;
  feedback: string;
};

type GcRecord = {
  date: string;
  consultation: string;
  insight: string;
  nextAction: string;
  satisfaction: number;
};

type SessionRecord = {
  date: string;
  instructor: string;
  consultation: string;
  resolution: number;
  satisfaction: number;
  feedback: string;
};

type AchievementReaction = {
  emoji: string;
  name: string;
};

type AchievementComment = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

type SharedAchievement = {
  id: string;
  name: string;
  job: string;
  revenueBefore: number;
  revenueAfter: number;
  strategy: string;
  message: string;
  reactions: AchievementReaction[];
  comments: AchievementComment[];
  createdAt: string;
};

type MemberData = {
  member: {
    name: string;
    joinDate: string;
    job: string;
  };
  preTask: {
    mainConcern: string;
    targetRevenue: number;
  } | null;
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
  seminarHistory: SeminarRecord[];
  seminarStats: {
    attendance: number;
    methods: string[];
    latestMethod: string | null;
    trend: "up" | "down" | "stable" | null;
  };
  gcHistory: GcRecord[];
  gcCount: number;
  sessionHistory: SessionRecord[];
  sessionCount: number;
  hasAchievement: boolean;
  achievement: {
    revenueAfter: number;
    strategy: string;
  } | null;
};

const ACTION_ICONS: Record<string, string> = {
  "セミナー": "🎤",
  "グルコン": "👥",
  "セッション": "💬",
  "アウトプット": "✍️",
};

const ACTION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "セミナー": { bg: "bg-pink-50", border: "border-l-pink-400", text: "text-pink-700" },
  "グルコン": { bg: "bg-blue-50", border: "border-l-blue-400", text: "text-blue-700" },
  "セッション": { bg: "bg-amber-50", border: "border-l-amber-400", text: "text-amber-700" },
  "アウトプット": { bg: "bg-purple-50", border: "border-l-purple-400", text: "text-purple-700" },
};

const CATEGORY_COLORS: Record<string, string> = {
  "マインド": "border-l-emerald-400",
  "集客": "border-l-amber-400",
  "成約": "border-l-blue-400",
  "リピート": "border-l-pink-400",
  "単価アップ": "border-l-purple-400",
  "SNS": "border-l-rose-400",
  "ライティング": "border-l-cyan-400",
  "仕組み化": "border-l-orange-400",
};

type NavKey = "contents" | "seminar" | "gc" | "session" | "output" | "achievement";

const NAV_ITEMS: { key: NavKey; icon: string; label: string; desc: string; color: string }[] = [
  { key: "contents", icon: "📚", label: "コンテンツ一覧", desc: "動画・資料を見る", color: "from-emerald-400 to-emerald-500" },
  { key: "seminar", icon: "🎤", label: "月1セミナー", desc: "セミナー履歴", color: "from-pink-400 to-pink-500" },
  { key: "gc", icon: "👥", label: "グルコン", desc: "グループコンサル", color: "from-blue-400 to-blue-500" },
  { key: "session", icon: "💬", label: "個別セッション", desc: "1on1で相談", color: "from-amber-400 to-amber-500" },
  { key: "output", icon: "📝", label: "アウトプット", desc: "学びをシェア", color: "from-purple-400 to-purple-500" },
  { key: "achievement", icon: "🏆", label: "成果報告", desc: "みんなの成果", color: "from-rose-400 to-rose-500" },
];

function getVimeoEmbedUrl(url: string): string | null {
  if (!url || !url.includes("vimeo.com")) return null;
  // Handle https://vimeo.com/560802088/bdf09437eb?params
  const match = url.match(/vimeo\.com\/(\d+)(\/([a-zA-Z0-9]+))?/);
  if (!match) return null;
  const videoId = match[1];
  const hash = match[3];
  return hash
    ? `https://player.vimeo.com/video/${videoId}?h=${hash}`
    : `https://player.vimeo.com/video/${videoId}`;
}

// Test featured content: C021 ビジネスの全体像
const FEATURED_CONTENT = {
  id: "C021",
  title: "ビジネスの全体像",
  category: "マインド",
  format: "動画",
  duration: 0,
  url: "https://vimeo.com/560802088/bdf09437eb",
};

function ScoreBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = value >= 8 ? "bg-emerald-400" : value >= 6 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-600 w-6 text-right">{value}</span>
    </div>
  );
}

export default function StudentPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const [data, setData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openSection, setOpenSection] = useState<NavKey | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [watched, setWatched] = useState<Record<string, boolean>>({});
  const [achievements, setAchievements] = useState<SharedAchievement[]>([]);
  const [achievementForm, setAchievementForm] = useState({
    revenueBefore: "",
    revenueAfter: "",
    strategy: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  // Load watched state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`pf-watched-${name}`);
      if (stored) setWatched(JSON.parse(stored));
    } catch {}
  }, [name]);

  const toggleWatched = (contentId: string) => {
    setWatched((prev) => {
      const next = { ...prev, [contentId]: !prev[contentId] };
      try { localStorage.setItem(`pf-watched-${name}`, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  useEffect(() => {
    fetch(`/api/member/${encodeURIComponent(name)}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, [name]);

  // Load achievements when section opens
  useEffect(() => {
    if (openSection === "achievement") {
      fetch("/api/achievements")
        .then((res) => res.json())
        .then((d) => setAchievements(d.achievements || []));
    }
  }, [openSection]);

  const submitAchievement = async () => {
    if (!data || submitting) return;
    setSubmitting(true);
    const res = await fetch("/api/achievements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.member.name,
        job: data.member.job,
        ...achievementForm,
      }),
    });
    const d = await res.json();
    if (d.achievement) {
      setAchievements((prev) => [d.achievement, ...prev]);
      setAchievementForm({ revenueBefore: "", revenueAfter: "", strategy: "", message: "" });
      setShowForm(false);
    }
    setSubmitting(false);
  };

  const toggleReaction = async (achievementId: string, emoji: string) => {
    if (!data) return;
    const res = await fetch("/api/achievements/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ achievementId, emoji, name: data.member.name }),
    });
    const d = await res.json();
    if (d.achievement) {
      setAchievements((prev) =>
        prev.map((a) => (a.id === achievementId ? d.achievement : a))
      );
    }
  };

  const submitComment = async (achievementId: string) => {
    if (!data) return;
    const text = commentText[achievementId]?.trim();
    if (!text) return;
    const res = await fetch("/api/achievements/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ achievementId, name: data.member.name, text }),
    });
    const d = await res.json();
    if (d.achievement) {
      setAchievements((prev) =>
        prev.map((a) => (a.id === achievementId ? d.achievement : a))
      );
      setCommentText((prev) => ({ ...prev, [achievementId]: "" }));
    }
  };

  const toggleSection = (key: NavKey) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0faf4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.member) {
    return (
      <div className="min-h-screen bg-[#f0faf4] flex items-center justify-center">
        <p className="text-gray-500 text-lg">受講生情報が見つかりません</p>
      </div>
    );
  }

  const primaryCategory = data.topCategories[0] || "";
  const primaryContents = data.recommended.filter(
    (c) => c.category === primaryCategory
  );
  const otherContents = data.recommended.filter(
    (c) => c.category !== primaryCategory
  );

  return (
    <div className="min-h-screen bg-[#f0faf4]">
      {/* Hero Header */}
      <header className="relative bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-32 h-32 bg-white rounded-full" />
          <div className="absolute bottom-2 left-12 w-20 h-20 bg-white rounded-full" />
          <div className="absolute top-12 left-1/3 w-16 h-16 bg-white rounded-full" />
        </div>
        <div className="relative max-w-2xl mx-auto px-6 py-10 text-center">
          <p className="text-white/80 text-sm font-medium tracking-widest mb-1">
            ProjectF
          </p>
          <h1 className="text-2xl font-bold text-white mb-1">
            {data.member.name}さん
          </h1>
          <p className="text-white/80 text-sm">
            {data.member.job} ・ 入会日 {data.member.joinDate}
          </p>
          {data.preTask && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2">
              <span className="text-white text-sm font-medium">
                目標: 月商{data.preTask.targetRevenue}万円
              </span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-12 -mt-4 relative z-10">
        {/* Navigation Cards — 3x2 grid */}
        <section className="grid grid-cols-3 gap-3 mb-4">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => toggleSection(item.key)}
              className={`bg-white rounded-2xl shadow-sm border-2 p-4 text-center hover:shadow-md transition-all group ${
                openSection === item.key
                  ? "border-emerald-400 shadow-md"
                  : "border-transparent"
              }`}
            >
              <div className={`w-11 h-11 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-2 text-xl group-hover:scale-105 transition-transform`}>
                {item.icon}
              </div>
              <p className="text-xs font-bold text-gray-800 leading-tight">
                {item.label}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
            </button>
          ))}
        </section>

        {/* === Expandable Sections === */}

        {/* Contents Section */}
        {openSection === "contents" && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">📚</span>
              <h2 className="text-sm font-bold text-gray-900">
                おすすめコンテンツ
              </h2>
            </div>

            {/* Featured Video: C021 */}
            <div className="mb-5">
              <p className="text-xs text-gray-400 mb-3 ml-6">
                まずはこちらから
              </p>
              <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/50 overflow-hidden">
                {playingVideo === FEATURED_CONTENT.id ? (
                  <div className="aspect-video bg-black">
                    <iframe
                      src={`${getVimeoEmbedUrl(FEATURED_CONTENT.url)}&autoplay=1`}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setPlayingVideo(FEATURED_CONTENT.id)}
                    className="w-full aspect-video relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-900 group"
                  >
                    {/* Decorative background elements */}
                    <div className="absolute inset-0">
                      {/* Grid pattern */}
                      <div className="absolute inset-0 opacity-[0.07]" style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                      }} />
                      {/* Flowing circles representing business flow */}
                      <div className="absolute top-6 left-8 w-20 h-20 border-2 border-emerald-400/30 rounded-full" />
                      <div className="absolute top-10 left-16 w-28 h-28 border border-teal-300/20 rounded-full" />
                      <div className="absolute -bottom-4 right-12 w-32 h-32 border-2 border-emerald-500/20 rounded-full" />
                      <div className="absolute top-4 right-8 w-16 h-16 border border-amber-400/25 rounded-full" />
                      {/* Flow arrows */}
                      <div className="absolute top-1/2 -translate-y-1/2 left-6 right-6 flex items-center justify-between opacity-20">
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 rounded bg-emerald-400/60" />
                          <div className="w-8 h-0.5 bg-emerald-400/40" />
                          <div className="w-6 h-6 rounded bg-teal-400/60" />
                          <div className="w-8 h-0.5 bg-teal-400/40" />
                          <div className="w-6 h-6 rounded bg-cyan-400/60" />
                        </div>
                      </div>
                      {/* Glow effects */}
                      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl" />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
                    </div>
                    {/* Content overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                      {/* Business icons row */}
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-9 h-9 bg-emerald-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-emerald-400/30">
                          <span className="text-base">💡</span>
                        </div>
                        <div className="text-emerald-400/60 text-xs">→</div>
                        <div className="w-9 h-9 bg-teal-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-teal-400/30">
                          <span className="text-base">📊</span>
                        </div>
                        <div className="text-emerald-400/60 text-xs">→</div>
                        <div className="w-9 h-9 bg-cyan-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-cyan-400/30">
                          <span className="text-base">🚀</span>
                        </div>
                      </div>
                      {/* Title */}
                      <p className="text-white/90 font-bold text-base tracking-wide">ビジネスの全体像</p>
                      <p className="text-emerald-300/70 text-[10px] tracking-widest">BUSINESS OVERVIEW</p>
                      {/* Play button */}
                      <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:bg-white/25 group-hover:scale-110 transition-all shadow-lg shadow-black/20 mt-1">
                        <span className="text-white text-xl ml-1">▶</span>
                      </div>
                    </div>
                  </button>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded-full">
                      おすすめ
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full">
                      {FEATURED_CONTENT.category}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900">{FEATURED_CONTENT.title}</p>
                  <button
                    onClick={() => toggleWatched(FEATURED_CONTENT.id)}
                    className={`mt-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                      watched[FEATURED_CONTENT.id]
                        ? "text-emerald-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      watched[FEATURED_CONTENT.id]
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-gray-300"
                    }`}>
                      {watched[FEATURED_CONTENT.id] && (
                        <span className="text-white text-xs font-bold">✓</span>
                      )}
                    </span>
                    {watched[FEATURED_CONTENT.id] ? "閲覧済み" : "閲覧したらチェック"}
                  </button>
                </div>
              </div>
            </div>

            {/* Primary category contents */}
            {primaryContents.length > 0 && (
              <>
                <p className="text-xs text-gray-400 mb-3 ml-6">
                  あなたの課題「{primaryCategory}」に合わせたおすすめ
                </p>
                <div className="space-y-3 mb-4">
                  {primaryContents.map((content, i) => {
                    const borderColor = CATEGORY_COLORS[content.category] || "border-l-gray-300";
                    const embedUrl = getVimeoEmbedUrl(content.url);
                    return (
                      <div key={content.id}>
                        {playingVideo === content.id && embedUrl ? (
                          <div className="rounded-xl border border-gray-200 overflow-hidden mb-1">
                            <div className="aspect-video bg-black">
                              <iframe
                                src={`${embedUrl}&autoplay=1`}
                                className="w-full h-full"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                            <div className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-bold text-gray-900 text-sm">{content.title}</p>
                                <button
                                  onClick={() => setPlayingVideo(null)}
                                  className="text-xs text-gray-400 hover:text-gray-600"
                                >
                                  閉じる
                                </button>
                              </div>
                              <button
                                onClick={() => toggleWatched(content.id)}
                                className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                                  watched[content.id] ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
                                }`}
                              >
                                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                  watched[content.id] ? "bg-emerald-500 border-emerald-500" : "border-gray-300"
                                }`}>
                                  {watched[content.id] && <span className="text-white text-[10px] font-bold">✓</span>}
                                </span>
                                {watched[content.id] ? "閲覧済み" : "閲覧したらチェック"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={`rounded-xl border border-gray-100 border-l-4 ${borderColor} hover:shadow-sm hover:bg-gray-50 transition-all`}>
                            <button
                              onClick={() => embedUrl ? setPlayingVideo(content.id) : undefined}
                              className="w-full flex items-center gap-4 p-4 text-left"
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                                watched[content.id] ? "bg-emerald-200 text-emerald-700" : "bg-emerald-500 text-white"
                              }`}>
                                {watched[content.id] ? "✓" : i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-bold text-sm ${watched[content.id] ? "text-gray-400 line-through" : "text-gray-900"}`}>{content.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {content.format}
                                  {content.duration > 0 && ` ・ ${content.duration}分`}
                                </p>
                              </div>
                              {embedUrl ? (
                                <span className="text-emerald-500 shrink-0 text-lg">▶</span>
                              ) : (
                                <span className="text-gray-300 shrink-0">›</span>
                              )}
                            </button>
                            <div className="px-4 pb-3 -mt-1">
                              <button
                                onClick={() => toggleWatched(content.id)}
                                className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                                  watched[content.id] ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
                                }`}
                              >
                                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                  watched[content.id] ? "bg-emerald-500 border-emerald-500" : "border-gray-300"
                                }`}>
                                  {watched[content.id] && <span className="text-white text-[10px] font-bold">✓</span>}
                                </span>
                                {watched[content.id] ? "閲覧済み" : "閲覧したらチェック"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Other contents */}
            {otherContents.length > 0 && (
              <>
                <p className="text-xs text-gray-400 mb-3 ml-6">次のステップ</p>
                <div className="space-y-2">
                  {otherContents.slice(0, 5).map((content) => {
                    const borderColor = CATEGORY_COLORS[content.category] || "border-l-gray-300";
                    const embedUrl = getVimeoEmbedUrl(content.url);
                    return (
                      <div key={content.id}>
                        {playingVideo === content.id && embedUrl ? (
                          <div className="rounded-xl border border-gray-200 overflow-hidden mb-1">
                            <div className="aspect-video bg-black">
                              <iframe
                                src={`${embedUrl}&autoplay=1`}
                                className="w-full h-full"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                            <div className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-900">{content.title}</p>
                                <button
                                  onClick={() => setPlayingVideo(null)}
                                  className="text-xs text-gray-400 hover:text-gray-600"
                                >
                                  閉じる
                                </button>
                              </div>
                              <button
                                onClick={() => toggleWatched(content.id)}
                                className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                                  watched[content.id] ? "text-emerald-600" : "text-gray-400 hover:text-gray-600"
                                }`}
                              >
                                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                  watched[content.id] ? "bg-emerald-500 border-emerald-500" : "border-gray-300"
                                }`}>
                                  {watched[content.id] && <span className="text-white text-[10px] font-bold">✓</span>}
                                </span>
                                {watched[content.id] ? "閲覧済み" : "閲覧したらチェック"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className={`rounded-xl border border-gray-50 border-l-4 ${borderColor} hover:bg-gray-50 transition-colors flex items-center gap-3 p-3`}>
                            <button
                              onClick={() => toggleWatched(content.id)}
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                watched[content.id] ? "bg-emerald-500 border-emerald-500" : "border-gray-300"
                              }`}
                            >
                              {watched[content.id] && <span className="text-white text-[10px] font-bold">✓</span>}
                            </button>
                            <div
                              className="flex-1 min-w-0 cursor-pointer"
                              onClick={() => embedUrl ? setPlayingVideo(content.id) : undefined}
                            >
                              <p className={`text-sm font-medium ${watched[content.id] ? "text-gray-400 line-through" : "text-gray-900"}`}>{content.title}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {content.category} ・ {content.format}
                                {content.duration > 0 && ` ・ ${content.duration}分`}
                              </p>
                            </div>
                            {embedUrl ? (
                              <span className="text-emerald-500 shrink-0 text-lg">▶</span>
                            ) : (
                              <span className="text-gray-300 shrink-0">›</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
            {primaryContents.length === 0 && otherContents.length === 0 && (
              <p className="text-sm text-gray-400 ml-6 mt-2">該当するコンテンツがありません</p>
            )}
          </section>
        )}

        {/* Seminar Section */}
        {openSection === "seminar" && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">🎤</span>
              <h2 className="text-sm font-bold text-gray-900">
                セミナー参加履歴
              </h2>
              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-medium">
                {data.seminarHistory?.length || 0}回参加
              </span>
              {data.seminarStats?.trend === "up" && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">上昇中</span>
              )}
              {data.seminarStats?.trend === "down" && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">要フォロー</span>
              )}
            </div>
            {data.seminarHistory && data.seminarHistory.length > 0 ? (
              <div className="space-y-4">
                {data.seminarHistory.slice().reverse().map((s, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">{s.date}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        s.method === "zoom" || s.method === "録画視聴"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-pink-100 text-pink-700"
                      }`}>
                        {s.method}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">集中度</p>
                        <ScoreBar value={s.focus} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">ビジネス加速度</p>
                        <ScoreBar value={s.acceleration} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">楽しめたか</p>
                        <ScoreBar value={s.enjoyment} />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 mb-0.5">アクションプラン</p>
                        <ScoreBar value={s.actionPlan} />
                      </div>
                    </div>
                    {s.feedback && (
                      <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                        💬 {s.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">🎤</p>
                <p className="text-sm text-gray-500">まだセミナーに参加していません</p>
                <p className="text-xs text-gray-400 mt-1">月1回のセミナーでビジネスを加速しよう！</p>
              </div>
            )}
          </section>
        )}

        {/* Group Consulting Section */}
        {openSection === "gc" && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">👥</span>
              <h2 className="text-sm font-bold text-gray-900">
                グルコン参加履歴
              </h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {data.gcCount}回参加
              </span>
            </div>
            {data.gcHistory && data.gcHistory.length > 0 ? (
              <div className="space-y-3">
                {data.gcHistory.slice().reverse().map((gc, i) => (
                  <div key={i} className="border-l-4 border-l-blue-400 bg-blue-50/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{gc.date}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <span key={si} className={`w-2 h-2 rounded-full ${si < gc.satisfaction ? "bg-blue-400" : "bg-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                    {gc.consultation && (
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        📋 {gc.consultation}
                      </p>
                    )}
                    {gc.insight && (
                      <p className="text-xs text-gray-600">
                        💡 {gc.insight}
                      </p>
                    )}
                    {gc.nextAction && (
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        → {gc.nextAction}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">👥</p>
                <p className="text-sm text-gray-500">まだグルコンに参加していません</p>
                <p className="text-xs text-gray-400 mt-1">他の受講生と一緒に悩みを解決しよう！</p>
              </div>
            )}
          </section>
        )}

        {/* Individual Session Section */}
        {openSection === "session" && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">💬</span>
              <h2 className="text-sm font-bold text-gray-900">
                個別セッション履歴
              </h2>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                {data.sessionCount}回利用
              </span>
            </div>
            {data.sessionHistory && data.sessionHistory.length > 0 ? (
              <div className="space-y-3">
                {data.sessionHistory.slice().reverse().map((s, i) => (
                  <div key={i} className="border-l-4 border-l-amber-400 bg-amber-50/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">{s.date}</span>
                      {s.instructor && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          担当: {s.instructor}
                        </span>
                      )}
                    </div>
                    {s.consultation && (
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        📋 {s.consultation}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400">満足度</span>
                        {Array.from({ length: 5 }).map((_, si) => (
                          <span key={si} className={`w-2 h-2 rounded-full ${si < s.satisfaction ? "bg-amber-400" : "bg-gray-200"}`} />
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400">解決度</span>
                        {Array.from({ length: 5 }).map((_, si) => (
                          <span key={si} className={`w-2 h-2 rounded-full ${si < s.resolution ? "bg-emerald-400" : "bg-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                    {s.feedback && (
                      <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-amber-100">
                        💬 {s.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">💬</p>
                <p className="text-sm text-gray-500">まだ個別セッションを利用していません</p>
                <p className="text-xs text-gray-400 mt-1">1対1であなたの悩みを解決しよう！</p>
              </div>
            )}
          </section>
        )}

        {/* Output Section */}
        {openSection === "output" && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-base">📝</span>
              <h2 className="text-sm font-bold text-gray-900">
                アウトプット
              </h2>
            </div>
            <div className="text-center py-6">
              <p className="text-3xl mb-2">✍️</p>
              <p className="text-sm text-gray-700 font-medium">学んだことをシェアしよう！</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">アウトプットすることで学びが定着します</p>
              <div className="space-y-2 text-left">
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                  <p className="text-xs font-medium text-purple-700">💡 おすすめアウトプット方法</p>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1">
                    <li>・ セミナーで学んだことをSNSで発信</li>
                    <li>・ グルコンで得た気づきをメモに残す</li>
                    <li>・ 実践した結果をコミュニティでシェア</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Achievement Section */}
        {openSection === "achievement" && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-base">🏆</span>
                <h2 className="text-sm font-bold text-gray-900">成果報告</h2>
              </div>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="text-xs bg-rose-500 text-white font-medium px-3 py-1.5 rounded-full hover:bg-rose-600 transition-colors"
              >
                {showForm ? "閉じる" : "成果を報告する"}
              </button>
            </div>

            {/* Submit Form */}
            {showForm && (
              <div className="bg-rose-50 rounded-xl border border-rose-200 p-4 mb-5">
                <p className="text-sm font-bold text-gray-900 mb-3">あなたの成果を教えてください</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] text-gray-500 font-medium">入会前の月商（万円）</label>
                    <input
                      type="number"
                      value={achievementForm.revenueBefore}
                      onChange={(e) => setAchievementForm((f) => ({ ...f, revenueBefore: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-medium">現在の月商（万円）</label>
                    <input
                      type="number"
                      value={achievementForm.revenueAfter}
                      onChange={(e) => setAchievementForm((f) => ({ ...f, revenueAfter: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-[10px] text-gray-500 font-medium">成果が出た施策</label>
                  <input
                    type="text"
                    value={achievementForm.strategy}
                    onChange={(e) => setAchievementForm((f) => ({ ...f, strategy: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                    placeholder="例: SNS発信を毎日続けた"
                  />
                </div>
                <div className="mb-3">
                  <label className="text-[10px] text-gray-500 font-medium">みんなへのメッセージ</label>
                  <textarea
                    value={achievementForm.message}
                    onChange={(e) => setAchievementForm((f) => ({ ...f, message: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
                    rows={3}
                    placeholder="仲間へ一言！"
                  />
                </div>
                <button
                  onClick={submitAchievement}
                  disabled={submitting || !achievementForm.strategy || !achievementForm.message}
                  className="w-full bg-rose-500 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "送信中..." : "成果を投稿する"}
                </button>
              </div>
            )}

            {/* Achievements Feed */}
            {achievements.length > 0 ? (
              <div className="space-y-4">
                {achievements.map((ach) => {
                  const isOwn = ach.name === data.member.name;
                  const revenueUp = ach.revenueAfter - ach.revenueBefore;
                  // Group reactions by emoji
                  const reactionCounts: Record<string, { count: number; hasOwn: boolean }> = {};
                  for (const r of ach.reactions) {
                    if (!reactionCounts[r.emoji]) reactionCounts[r.emoji] = { count: 0, hasOwn: false };
                    reactionCounts[r.emoji].count++;
                    if (r.name === data.member.name) reactionCounts[r.emoji].hasOwn = true;
                  }
                  return (
                    <div
                      key={ach.id}
                      className={`rounded-xl border-2 overflow-hidden ${
                        isOwn ? "border-rose-200 bg-rose-50/30" : "border-gray-100"
                      }`}
                    >
                      {/* Achievement Header */}
                      <div className="bg-gradient-to-r from-rose-400 to-orange-400 p-4 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                              {ach.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{ach.name}</p>
                              <p className="text-[10px] text-white/80">{ach.job}</p>
                            </div>
                          </div>
                          {isOwn && (
                            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">自分</span>
                          )}
                        </div>
                        <div className="text-center py-2">
                          <p className="text-white/80 text-[10px] tracking-widest mb-1">ACHIEVEMENT</p>
                          <p className="font-bold text-lg">
                            月商 {ach.revenueBefore}万 → {ach.revenueAfter}万円
                          </p>
                          {revenueUp > 0 && (
                            <span className="inline-block mt-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                              +{revenueUp}万円UP
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Achievement Body */}
                      <div className="p-4">
                        <div className="mb-3">
                          <p className="text-[10px] text-gray-400 font-medium mb-1">成果が出た施策</p>
                          <p className="text-sm font-medium text-gray-900">{ach.strategy}</p>
                        </div>
                        <div className="mb-3">
                          <p className="text-[10px] text-gray-400 font-medium mb-1">メッセージ</p>
                          <p className="text-sm text-gray-700">{ach.message}</p>
                        </div>
                        <p className="text-[10px] text-gray-300">
                          {new Date(ach.createdAt).toLocaleDateString("ja-JP")}
                        </p>

                        {/* Reactions */}
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 flex-wrap">
                          {["👏", "🎉", "🔥", "💪", "❤️"].map((emoji) => {
                            const info = reactionCounts[emoji];
                            return (
                              <button
                                key={emoji}
                                onClick={() => toggleReaction(ach.id, emoji)}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border transition-all ${
                                  info?.hasOwn
                                    ? "border-rose-300 bg-rose-50 shadow-sm"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {emoji}
                                {info && info.count > 0 && (
                                  <span className="text-xs text-gray-600 font-medium">{info.count}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Comments */}
                        {ach.comments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {ach.comments.map((c) => (
                              <div key={c.id} className="flex items-start gap-2">
                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0 mt-0.5">
                                  {c.name[0]}
                                </div>
                                <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1">
                                  <p className="text-[10px] font-bold text-gray-700">{c.name}</p>
                                  <p className="text-xs text-gray-600">{c.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment Input */}
                        <div className="flex items-center gap-2 mt-3">
                          <input
                            type="text"
                            value={commentText[ach.id] || ""}
                            onChange={(e) => setCommentText((prev) => ({ ...prev, [ach.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") submitComment(ach.id); }}
                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
                            placeholder="おめでとう！"
                          />
                          <button
                            onClick={() => submitComment(ach.id)}
                            className="text-xs bg-rose-100 text-rose-600 font-medium px-3 py-1.5 rounded-full hover:bg-rose-200 transition-colors"
                          >
                            送信
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              !showForm && (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">🏆</p>
                  <p className="text-sm text-gray-700 font-medium">まだ成果報告がありません</p>
                  <p className="text-xs text-gray-400 mt-1">最初の報告者になろう！</p>
                </div>
              )
            )}
          </section>
        )}

        {/* Engagement Stats */}
        <section className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {data.seminarStats?.attendance || 0}
              <span className="text-xs font-normal text-gray-400 ml-0.5">回</span>
            </p>
            <p className="text-[10px] text-gray-500 mt-1">セミナー参加</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {data.gcCount || 0}
              <span className="text-xs font-normal text-gray-400 ml-0.5">回</span>
            </p>
            <p className="text-[10px] text-gray-500 mt-1">グルコン参加</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {data.sessionCount || 0}
              <span className="text-xs font-normal text-gray-400 ml-0.5">回</span>
            </p>
            <p className="text-[10px] text-gray-500 mt-1">個別セッション</p>
          </div>
        </section>

        {/* Current Focus Tags */}
        {data.topCategories.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">🎯</span>
              <h2 className="text-sm font-bold text-gray-900">
                あなたの今の課題
              </h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              {data.topCategories.map((cat, i) => (
                <span
                  key={cat}
                  className={`text-sm font-medium px-4 py-1.5 rounded-full ${
                    i === 0
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {cat}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Action Recommendations */}
        {data.actions && data.actions.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">⚡</span>
              <h2 className="text-sm font-bold text-gray-900">
                今やるべきアクション
              </h2>
            </div>
            <p className="text-xs text-gray-400 mb-4 ml-6">
              あなたのデータから、成果につながる行動をおすすめ
            </p>
            <div className="space-y-3">
              {data.actions.map((action, i) => {
                const colors = ACTION_COLORS[action.category] || { bg: "bg-gray-50", border: "border-l-gray-400", text: "text-gray-700" };
                return (
                  <div
                    key={i}
                    className={`${colors.bg} rounded-xl p-4 border-l-4 ${colors.border} hover:shadow-sm transition-shadow cursor-pointer`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl shrink-0 mt-0.5">
                        {ACTION_ICONS[action.category] || "📌"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] ${colors.text} font-bold uppercase tracking-wider`}>
                          {action.category}
                        </span>
                        <p className="font-bold text-gray-900 text-sm mt-0.5">
                          {action.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {action.reason}
                        </p>
                      </div>
                      <span className="text-gray-300 shrink-0 mt-1">›</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            ProjectF メンバーサイト
          </p>
        </footer>
      </main>
    </div>
  );
}
