"use client";

const OPENCHAT_LINK = "https://line.me/ti/g2/XXXXXX"; // TODO: 総合オプチャのリンクに差し替え

function ResultContent() {
  return (
    <>
      <p className="text-center text-emerald-600 font-bold text-3xl md:text-4xl tracking-widest mb-3">
        The Start Up
      </p>
      <p className="text-center text-gray-700 font-bold text-lg md:text-xl mb-2">
        ご登録ありがとうございます！
      </p>
      <p className="text-center text-gray-500 text-sm mb-8">
        受講生番号をメールでお送りしました。ご確認ください。
      </p>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6 text-center">
        <p className="text-sm text-emerald-600 font-medium mb-2">STEP 1</p>
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          TheStartUp総合オープンチャットへご登録ください
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          受講生全員が参加するコミュニティです
        </p>
        <a
          href={OPENCHAT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-4 rounded-lg transition-all text-lg text-center shadow-md hover:shadow-lg"
        >
          オープンチャットに参加する
        </a>
        <p className="text-gray-400 text-xs mt-2">
          ※ボタンをタップするとLINEオープンチャットが開きます
        </p>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <p className="text-sm text-emerald-600 font-medium mb-2 text-center">STEP 2</p>
        <p className="text-center text-gray-700 font-bold mb-3">
          マイページにログイン
        </p>
        <p className="text-center text-gray-500 text-sm mb-4">
          メールで届いた受講生IDでログインできます
        </p>
        <a
          href="/login"
          className="block w-full border-2 border-emerald-400 text-emerald-600 font-bold py-3 rounded-lg text-center hover:bg-emerald-50 transition-colors"
        >
          マイページにログイン
        </a>
      </div>
    </>
  );
}

export default function Result() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-pink-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 md:p-10">
        <ResultContent />
      </div>
    </main>
  );
}
