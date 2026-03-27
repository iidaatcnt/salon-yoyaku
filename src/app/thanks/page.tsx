"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ThanksContent() {
  const p = useSearchParams();
  const name = p.get("name") ?? "お客様";
  const date = p.get("date") ?? "";
  const time = p.get("time") ?? "";
  const staff = p.get("staff") ?? "";
  const total = Number(p.get("total") ?? 0);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">💐</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">
          ご予約ありがとうございます
        </h1>
        <p className="text-stone-500 mb-8">
          {name} 様のご来店を心よりお待ちしております
        </p>

        <div className="bg-white rounded-2xl border border-stone-100 p-6 text-left mb-8 shadow-sm">
          <h2 className="font-bold text-stone-600 text-sm tracking-widest mb-4">予約内容</h2>
          <div className="space-y-3 text-sm">
            {[
              { label: "お名前",   value: `${name} 様` },
              { label: "日時",     value: `${date} ${time}` },
              { label: "担当",     value: staff },
              { label: "合計",     value: `¥${total.toLocaleString()}` },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span className="text-stone-400">{row.label}</span>
                <span className="font-medium text-stone-800">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-stone-100 rounded-xl p-4 text-sm text-stone-500 mb-8 text-left space-y-1">
          <p>・前日にご確認のご連絡をする場合があります</p>
          <p>・キャンセルは前日までにお電話にてご連絡ください</p>
          <p>・5分以上遅れる場合はご連絡をお願いします</p>
        </div>

        <Link
          href="/"
          className="inline-block bg-stone-800 text-white font-bold px-10 py-3.5 rounded-full hover:bg-stone-700 transition-colors"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}

export default function ThanksPage() {
  return <Suspense><ThanksContent /></Suspense>;
}
