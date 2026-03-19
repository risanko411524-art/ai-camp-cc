export default function Thanks() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-pink-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 md:p-10 text-center">
        <div className="text-5xl mb-6">&#x2709;&#xFE0F;</div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          ありがとうございます！
        </h1>
        <p className="text-gray-600 leading-relaxed mb-2">
          あなたのお悩みをもとに、
        </p>
        <p className="text-gray-600 leading-relaxed mb-6">
          ぴったりのグループをご案内するメールをお送りします。
        </p>
        <p className="text-sm text-gray-400">
          ※メールが届かない場合は、迷惑メールフォルダをご確認ください
        </p>
      </div>
    </main>
  );
}
