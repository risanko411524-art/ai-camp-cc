"use client";

export default function BananaRisa({ size = 120, message }: { size?: number; message?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Banana body */}
        <path
          d="M60 160 C30 130, 25 80, 60 40 C80 20, 120 15, 140 35 C160 55, 155 100, 140 140 C130 160, 90 175, 60 160Z"
          fill="#FFE135"
          stroke="#D4A800"
          strokeWidth="2"
        />
        {/* Banana highlight */}
        <path
          d="M70 145 C45 120, 42 80, 70 48 C82 34, 105 30, 118 42"
          fill="none"
          stroke="#FFF5A0"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Banana tip top */}
        <path
          d="M60 40 C55 32, 48 28, 42 30"
          fill="none"
          stroke="#8B6914"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Banana tip bottom */}
        <path
          d="M60 160 C55 165, 50 168, 48 166"
          fill="none"
          stroke="#8B6914"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Face - eyes */}
        <ellipse cx="88" cy="85" rx="5" ry="6" fill="#5D3A1A" />
        <ellipse cx="118" cy="80" rx="5" ry="6" fill="#5D3A1A" />
        {/* Eye sparkles */}
        <circle cx="86" cy="83" r="2" fill="white" />
        <circle cx="116" cy="78" r="2" fill="white" />
        {/* Blush */}
        <ellipse cx="78" cy="95" rx="8" ry="5" fill="#FFB6C1" opacity="0.5" />
        <ellipse cx="128" cy="90" rx="8" ry="5" fill="#FFB6C1" opacity="0.5" />
        {/* Smile */}
        <path
          d="M90 100 Q103 115, 120 98"
          fill="none"
          stroke="#5D3A1A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Hair/bangs */}
        <path
          d="M65 55 C70 40, 85 30, 95 35"
          fill="none"
          stroke="#5D3A1A"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M75 50 C80 38, 95 30, 105 32"
          fill="none"
          stroke="#5D3A1A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Ribbon/bow */}
        <path
          d="M125 38 C132 28, 145 30, 140 40 C145 30, 155 35, 148 44"
          fill="#FF69B4"
          stroke="#FF1493"
          strokeWidth="1"
        />
        <circle cx="140" cy="38" r="3" fill="#FF1493" />
        {/* Waving hand */}
        <g className="animate-wave origin-[160px_70px]">
          <circle cx="160" cy="60" r="8" fill="#FFE135" stroke="#D4A800" strokeWidth="1.5" />
          <path
            d="M155 55 L150 45"
            stroke="#FFE135"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M160 53 L158 42"
            stroke="#FFE135"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M165 55 L167 44"
            stroke="#FFE135"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
        {/* Small sparkles around */}
        <text x="30" y="30" fontSize="16">✨</text>
        <text x="155" y="160" fontSize="14">🍌</text>
      </svg>

      {message && (
        <div className="relative bg-white rounded-2xl px-4 py-3 shadow-md max-w-xs border-2 border-yellow-300 animate-fade-in">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-yellow-300 rotate-45" />
          <p className="text-sm text-gray-700 leading-relaxed relative z-10">{message}</p>
        </div>
      )}

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-10deg); }
        }
        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
