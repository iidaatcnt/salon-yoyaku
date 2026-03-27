import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-stone-800">LUMIÈRE</h1>
            <p className="text-xs text-stone-400 tracking-widest mt-0.5">HAIR SALON</p>
          </div>
          <Link
            href="/admin"
            className="text-xs text-stone-400 hover:text-stone-600 border border-stone-200 px-3 py-1.5 rounded-full transition-colors"
          >
            管理者ページ
          </Link>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-xs tracking-[0.3em] text-stone-400 mb-4">ONLINE RESERVATION</p>
          <h2 className="text-4xl sm:text-5xl font-bold text-stone-800 mb-6 leading-tight">
            いつものあなたを、<br />もっと美しく。
          </h2>
          <p className="text-stone-500 mb-10 leading-relaxed">
            担当者のご指名も、おまかせのフリー予約も。<br />
            24時間いつでもオンラインでご予約いただけます。
          </p>
          <Link
            href="/booking"
            className="inline-block bg-stone-800 text-white font-bold text-lg px-12 py-4 rounded-full hover:bg-stone-700 transition-colors"
          >
            予約する
          </Link>
        </div>
      </section>

      {/* サービス紹介 */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h3 className="text-center text-sm tracking-[0.3em] text-stone-400 mb-10">SERVICES</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: "✂️", name: "カット", desc: "¥4,500〜" },
            { icon: "🎨", name: "カラー", desc: "¥6,000〜" },
            { icon: "💫", name: "パーマ", desc: "¥13,000〜" },
            { icon: "✨", name: "トリートメント", desc: "¥3,000〜" },
          ].map((s) => (
            <div key={s.name} className="bg-white rounded-2xl p-6 text-center border border-stone-100 shadow-sm">
              <div className="text-3xl mb-3">{s.icon}</div>
              <p className="font-bold text-stone-800">{s.name}</p>
              <p className="text-xs text-stone-400 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* スタッフ紹介 */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-center text-sm tracking-[0.3em] text-stone-400 mb-10">STAFF</h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: "田中 美咲", title: "トップスタイリスト", fee: 1500, color: "#f9a8d4", bio: "カラーとカットが得意" },
              { name: "佐藤 健太", title: "スタイリスト", fee: 1000, color: "#93c5fd", bio: "メンズカット・パーマが得意" },
              { name: "鈴木 あおい", title: "シニアスタイリスト", fee: 2000, color: "#86efac", bio: "ハイトーンカラーが専門" },
            ].map((s) => (
              <div key={s.name} className="text-center">
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: s.color }}
                >
                  {s.name[0]}
                </div>
                <p className="font-bold text-stone-800">{s.name}</p>
                <p className="text-xs text-stone-400 mt-0.5">{s.title}</p>
                <p className="text-xs text-stone-500 mt-1">{s.bio}</p>
                <p className="text-xs text-rose-500 font-bold mt-2">指名料 ¥{s.fee.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <Link
          href="/booking"
          className="inline-block bg-stone-800 text-white font-bold text-lg px-16 py-5 rounded-full hover:bg-stone-700 transition-colors"
        >
          今すぐ予約する
        </Link>
        <p className="text-xs text-stone-400 mt-4">定休日：日曜日 / 営業時間：10:00〜19:00</p>
      </section>

      <footer className="border-t border-stone-200 py-8 text-center text-xs text-stone-400">
        © 2024 Hair Salon LUMIÈRE
      </footer>
    </div>
  );
}
