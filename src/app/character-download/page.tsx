"use client";

import { useRef } from "react";
import BananaRisaCharacter from "../components/BananaRisaCharacter";

type Mood = "normal" | "happy" | "cheer";

const MOODS: { mood: Mood; label: string; desc: string }[] = [
  { mood: "normal", label: "通常", desc: "普通の表情" },
  { mood: "happy", label: "笑顔", desc: "うれしい顔" },
  { mood: "cheer", label: "応援", desc: "両手を上げて応援" },
];

function getSvgString(mood: Mood, size = 400): string {
  const isHappy = mood === "happy";
  const armAngle = mood === "cheer" ? -20 : 0;

  return `<svg width="${size}" height="${Math.round(size * 1.3)}" viewBox="0 0 200 260" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="260" fill="white"/>
  <ellipse cx="100" cy="150" rx="60" ry="90" fill="#FFE135" stroke="#E6C800" stroke-width="2"/>
  <path d="M100 60 Q95 40 105 25 Q110 35 105 60" fill="#8B6914"/>
  <path d="M70 90 Q68 150 75 230" stroke="#E6C800" stroke-width="1.5" fill="none" opacity="0.5"/>
  <path d="M130 90 Q132 150 125 230" stroke="#E6C800" stroke-width="1.5" fill="none" opacity="0.5"/>
  <ellipse cx="100" cy="130" rx="40" ry="35" fill="#FFF8DC"/>
  ${isHappy ? `
  <path d="M82 125 Q87 118 92 125" stroke="#5D4037" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M108 125 Q113 118 118 125" stroke="#5D4037" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  ` : `
  <circle cx="87" cy="125" r="4" fill="#5D4037"/>
  <circle cx="113" cy="125" r="4" fill="#5D4037"/>
  <circle cx="89" cy="123" r="1.5" fill="white"/>
  <circle cx="115" cy="123" r="1.5" fill="white"/>
  `}
  <ellipse cx="75" cy="135" rx="8" ry="5" fill="#FFB6C1" opacity="0.5"/>
  <ellipse cx="125" cy="135" rx="8" ry="5" fill="#FFB6C1" opacity="0.5"/>
  ${mood === "happy" ? `<path d="M90 140 Q100 152 110 140" stroke="#5D4037" stroke-width="2" fill="none" stroke-linecap="round"/>` : ""}
  ${mood === "cheer" ? `<ellipse cx="100" cy="142" rx="8" ry="6" fill="#5D4037"/>` : ""}
  ${mood === "normal" ? `<path d="M92 142 Q100 148 108 142" stroke="#5D4037" stroke-width="2" fill="none" stroke-linecap="round"/>` : ""}
  <g transform="rotate(${armAngle}, 45, 160)">
    <ellipse cx="35" cy="170" rx="12" ry="8" fill="#FFE135" stroke="#E6C800" stroke-width="1.5"/>
  </g>
  <g transform="rotate(${-armAngle}, 155, 160)">
    <ellipse cx="165" cy="170" rx="12" ry="8" fill="#FFE135" stroke="#E6C800" stroke-width="1.5"/>
  </g>
  <ellipse cx="80" cy="238" rx="15" ry="8" fill="#E6C800"/>
  <ellipse cx="120" cy="238" rx="15" ry="8" fill="#E6C800"/>
</svg>`;
}

function downloadSvg(mood: Mood) {
  const svgString = getSvgString(mood, 400);
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `banana-risa-${mood}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPng(mood: Mood, svgRef: SVGSVGElement | null) {
  if (!svgRef) return;

  const size = 400;
  const height = Math.round(size * 1.3);
  const svgString = getSvgString(mood, size);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = new Image();
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, size, height);
    ctx.drawImage(img, 0, 0, size, height);
    URL.revokeObjectURL(url);

    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return;
      const pngUrl = URL.createObjectURL(pngBlob);
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `banana-risa-${mood}.png`;
      a.click();
      URL.revokeObjectURL(pngUrl);
    }, "image/png");
  };
  img.src = url;
}

export default function CharacterDownloadPage() {
  const svgRefs = useRef<Record<string, SVGSVGElement | null>>({});

  return (
    <main className="min-h-screen bg-gradient-to-b from-yellow-50 to-white px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-yellow-800 mb-2">
            🍌 バナナりさキャラクター
          </h1>
          <p className="text-yellow-600 text-sm">
            PNG または SVG でダウンロードできます
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {MOODS.map(({ mood, label, desc }) => (
            <div
              key={mood}
              className="bg-white rounded-2xl shadow-md border border-yellow-200 p-6 text-center"
            >
              <p className="text-sm font-bold text-yellow-800 mb-1">{label}</p>
              <p className="text-xs text-gray-400 mb-4">{desc}</p>

              <div className="flex justify-center mb-5">
                <BananaRisaCharacter mood={mood} size={150} />
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => downloadPng(mood, svgRefs.current[mood])}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-yellow-900 font-bold py-2.5 rounded-xl text-sm transition-all shadow-sm hover:shadow-md"
                >
                  📥 PNG でダウンロード
                </button>
                <button
                  onClick={() => downloadSvg(mood)}
                  className="w-full bg-white border-2 border-yellow-300 hover:border-yellow-400 text-yellow-700 font-bold py-2 rounded-xl text-sm transition-all"
                >
                  📄 SVG でダウンロード
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-sm text-yellow-800">
          <p className="font-bold mb-2">💡 使い方のヒント</p>
          <ul className="space-y-1 text-xs text-yellow-700">
            <li>・ PNG は画像として使いたい場合（SNSなど）に最適です</li>
            <li>・ SVG はサイズを変えても綺麗なまま使えます</li>
            <li>・ 400×520px のサイズでダウンロードされます</li>
          </ul>
        </div>

        <div className="text-center mt-8">
          <a href="/" className="text-yellow-600 text-sm underline hover:text-yellow-800">
            トップへ戻る
          </a>
        </div>
      </div>
    </main>
  );
}
