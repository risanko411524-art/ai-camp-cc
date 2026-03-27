"use client";

type Mood = "normal" | "happy" | "cheer";

interface BananaRisaCharacterProps {
  mood?: Mood;
  message?: string;
  size?: number;
}

export default function BananaRisaCharacter({
  mood = "normal",
  message,
  size = 200,
}: BananaRisaCharacterProps) {
  const isHappy = mood === "happy";
  const armAngle = mood === "cheer" ? -20 : 0;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={size}
        height={size * 1.3}
        viewBox="0 0 200 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={mood === "happy" ? "animate-bounce-slow" : ""}
      >
        {/* バナナの着ぐるみボディ */}
        <ellipse cx="100" cy="150" rx="60" ry="90" fill="#FFE135" stroke="#E6C800" strokeWidth="2" />
        {/* バナナの先端（頭の上） */}
        <path d="M100 60 Q95 40 105 25 Q110 35 105 60" fill="#8B6914" />
        {/* バナナの縦線 */}
        <path d="M70 90 Q68 150 75 230" stroke="#E6C800" strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M130 90 Q132 150 125 230" stroke="#E6C800" strokeWidth="1.5" fill="none" opacity="0.5" />

        {/* 顔 */}
        <ellipse cx="100" cy="130" rx="40" ry="35" fill="#FFF8DC" />

        {/* 目 */}
        {isHappy ? (
          <>
            <path d="M82 125 Q87 118 92 125" stroke="#5D4037" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M108 125 Q113 118 118 125" stroke="#5D4037" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="87" cy="125" r="4" fill="#5D4037" />
            <circle cx="113" cy="125" r="4" fill="#5D4037" />
            {/* ハイライト */}
            <circle cx="89" cy="123" r="1.5" fill="white" />
            <circle cx="115" cy="123" r="1.5" fill="white" />
          </>
        )}

        {/* ほっぺ */}
        <ellipse cx="75" cy="135" rx="8" ry="5" fill="#FFB6C1" opacity="0.5" />
        <ellipse cx="125" cy="135" rx="8" ry="5" fill="#FFB6C1" opacity="0.5" />

        {/* 口 */}
        {mood === "happy" ? (
          <path d="M90 140 Q100 152 110 140" stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : mood === "cheer" ? (
          <ellipse cx="100" cy="142" rx="8" ry="6" fill="#5D4037" />
        ) : (
          <path d="M92 142 Q100 148 108 142" stroke="#5D4037" strokeWidth="2" fill="none" strokeLinecap="round" />
        )}

        {/* 手（左） */}
        <g transform={`rotate(${armAngle}, 45, 160)`}>
          <ellipse cx="35" cy="170" rx="12" ry="8" fill="#FFE135" stroke="#E6C800" strokeWidth="1.5" />
        </g>

        {/* 手（右） */}
        <g transform={`rotate(${-armAngle}, 155, 160)`}>
          <ellipse cx="165" cy="170" rx="12" ry="8" fill="#FFE135" stroke="#E6C800" strokeWidth="1.5" />
          {mood === "cheer" && (
            <text x="170" y="155" fontSize="20" textAnchor="middle">✨</text>
          )}
        </g>

        {/* 足 */}
        <ellipse cx="80" cy="238" rx="15" ry="8" fill="#E6C800" />
        <ellipse cx="120" cy="238" rx="15" ry="8" fill="#E6C800" />
      </svg>

      {/* 吹き出し */}
      {message && (
        <div className="relative bg-white border-2 border-yellow-300 rounded-2xl px-5 py-3 max-w-xs shadow-md">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-yellow-300 rotate-45" />
          <p className="text-sm text-yellow-900 font-medium relative z-10">{message}</p>
        </div>
      )}

      <style jsx>{`
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
