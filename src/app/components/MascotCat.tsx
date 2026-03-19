export default function MascotCat({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 左耳 */}
      <path
        d="M55 75 L40 30 L75 60 Z"
        fill="#F9D8C0"
        stroke="#E8C4A8"
        strokeWidth="2"
      />
      {/* 左耳の内側 */}
      <path
        d="M57 70 L47 38 L72 62 Z"
        fill="#FFB8C6"
      />
      {/* 右耳 */}
      <path
        d="M145 75 L160 30 L125 60 Z"
        fill="#F9D8C0"
        stroke="#E8C4A8"
        strokeWidth="2"
      />
      {/* 右耳の内側 */}
      <path
        d="M143 70 L153 38 L128 62 Z"
        fill="#FFB8C6"
      />

      {/* 体 (丸い) */}
      <ellipse
        cx="100"
        cy="130"
        rx="55"
        ry="45"
        fill="#F9D8C0"
        stroke="#E8C4A8"
        strokeWidth="2"
      />

      {/* 顔 (丸い) */}
      <circle
        cx="100"
        cy="100"
        r="50"
        fill="#F9D8C0"
        stroke="#E8C4A8"
        strokeWidth="2"
      />

      {/* 左ほっぺ */}
      <ellipse cx="70" cy="110" rx="12" ry="8" fill="#FFD4DC" opacity="0.6" />
      {/* 右ほっぺ */}
      <ellipse cx="130" cy="110" rx="12" ry="8" fill="#FFD4DC" opacity="0.6" />

      {/* 左目 */}
      <ellipse cx="82" cy="95" rx="6" ry="7" fill="#4A4A4A" />
      <ellipse cx="84" cy="93" rx="2.5" ry="2.5" fill="#FFFFFF" />

      {/* 右目 */}
      <ellipse cx="118" cy="95" rx="6" ry="7" fill="#4A4A4A" />
      <ellipse cx="120" cy="93" rx="2.5" ry="2.5" fill="#FFFFFF" />

      {/* 鼻 */}
      <ellipse cx="100" cy="105" rx="4" ry="3" fill="#FFB0B0" />

      {/* 口 (にっこり) */}
      <path
        d="M92 110 Q96 117 100 110"
        fill="none"
        stroke="#4A4A4A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M100 110 Q104 117 108 110"
        fill="none"
        stroke="#4A4A4A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* 左ひげ */}
      <line x1="45" y1="100" x2="72" y2="105" stroke="#D4B8A0" strokeWidth="1.2" />
      <line x1="43" y1="108" x2="72" y2="108" stroke="#D4B8A0" strokeWidth="1.2" />
      <line x1="45" y1="116" x2="72" y2="112" stroke="#D4B8A0" strokeWidth="1.2" />

      {/* 右ひげ */}
      <line x1="128" y1="105" x2="155" y2="100" stroke="#D4B8A0" strokeWidth="1.2" />
      <line x1="128" y1="108" x2="157" y2="108" stroke="#D4B8A0" strokeWidth="1.2" />
      <line x1="128" y1="112" x2="155" y2="116" stroke="#D4B8A0" strokeWidth="1.2" />

      {/* 左手 (振ってる) */}
      <ellipse
        cx="55"
        cy="145"
        rx="12"
        ry="10"
        fill="#F9D8C0"
        stroke="#E8C4A8"
        strokeWidth="2"
        transform="rotate(-20, 55, 145)"
      />

      {/* 右手 (振ってる) */}
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-5,148,135; 10,148,135; -5,148,135"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <ellipse
          cx="148"
          cy="135"
          rx="12"
          ry="10"
          fill="#F9D8C0"
          stroke="#E8C4A8"
          strokeWidth="2"
          transform="rotate(20, 148, 135)"
        />
      </g>

      {/* しっぽ */}
      <path
        d="M150 155 Q170 140 175 155 Q180 170 165 165"
        fill="none"
        stroke="#E8C4A8"
        strokeWidth="4"
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-3,150,155; 3,150,155; -3,150,155"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
