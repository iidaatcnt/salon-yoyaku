"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppData, MenuItem, Staff } from "@/types";
import {
  loadData, saveData, genId,
  formatPrice, formatDate,
  getAvailableDates, TIME_SLOTS, CATEGORY_LABEL,
} from "@/lib/storage";

type Step = 1 | 2 | 3 | 4;

export default function BookingPage() {
  const router = useRouter();
  const [data, setData] = useState<AppData>({ staff: [], menus: [], reservations: [] });
  const [step, setStep] = useState<Step>(1);

  // 選択状態
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null | "free">("free"); // "free" = おまかせ
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setData(loadData()); }, []);

  const availableDates = getAvailableDates();

  // 選択したメニューの合計
  const selectedMenus = data.menus.filter(m => selectedMenuIds.includes(m.id));
  const menuTotal = selectedMenus.reduce((s, m) => s + m.price, 0);
  const menuDuration = selectedMenus.reduce((s, m) => s + m.duration, 0);

  const selectedStaff = selectedStaffId !== "free"
    ? data.staff.find(s => s.id === selectedStaffId) ?? null
    : null;
  const nominationFee = selectedStaff ? selectedStaff.nominationFee : 0;
  const totalPrice = menuTotal + nominationFee;

  // メニューのカテゴリー別グループ
  const categories = Array.from(new Set(data.menus.map(m => m.category)));

  const toggleMenu = (id: string) => {
    setSelectedMenuIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const validateStep = (s: Step): boolean => {
    const errs: Record<string, string> = {};
    if (s === 1 && selectedMenuIds.length === 0) errs.menu = "メニューを1つ以上選択してください";
    if (s === 3 && !selectedDate) errs.date = "日付を選択してください";
    if (s === 3 && !selectedTime) errs.time = "時間を選択してください";
    if (s === 4) {
      if (!customerName.trim()) errs.name = "お名前を入力してください";
      if (!customerPhone.trim()) errs.phone = "電話番号を入力してください";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep(prev => (prev + 1) as Step);
  };

  const handleSubmit = () => {
    if (!validateStep(4)) return;
    const reservation = {
      id: genId(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      menuIds: selectedMenuIds,
      staffId: selectedStaffId === "free" ? null : selectedStaffId,
      date: selectedDate,
      time: selectedTime,
      totalPrice,
      nominationFee,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = { ...data, reservations: [...data.reservations, reservation] };
    saveData(next);
    const params = new URLSearchParams({
      name: customerName,
      date: formatDate(selectedDate),
      time: selectedTime,
      staff: selectedStaff ? selectedStaff.name : "おまかせ",
      total: String(totalPrice),
    });
    router.push(`/thanks?${params.toString()}`);
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {([1,2,3,4] as Step[]).map(s => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            step === s ? "bg-stone-800 text-white" :
            step > s ? "bg-stone-300 text-white" :
            "bg-stone-100 text-stone-400"
          }`}>{s}</div>
          {s < 4 && <div className={`w-8 h-px ${step > s ? "bg-stone-400" : "bg-stone-200"}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="text-stone-400 hover:text-stone-600 text-sm">←</Link>
          <div>
            <h1 className="font-bold text-stone-800 tracking-widest">LUMIÈRE</h1>
            <p className="text-xs text-stone-400">ご予約</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <StepIndicator />

        {/* ===== STEP 1: メニュー選択 ===== */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-stone-800 mb-1">メニューを選択</h2>
            <p className="text-sm text-stone-400 mb-6">複数選択可能です</p>
            {categories.map(cat => (
              <div key={cat} className="mb-6">
                <h3 className="text-xs font-bold text-stone-400 tracking-widest mb-3">{CATEGORY_LABEL[cat]}</h3>
                <div className="space-y-2">
                  {data.menus.filter(m => m.category === cat).map(menu => {
                    const selected = selectedMenuIds.includes(menu.id);
                    return (
                      <button
                        key={menu.id}
                        onClick={() => toggleMenu(menu.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                          selected
                            ? "border-stone-800 bg-stone-50"
                            : "border-stone-100 bg-white hover:border-stone-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            selected ? "border-stone-800 bg-stone-800" : "border-stone-300"
                          }`}>
                            {selected && <span className="text-white text-xs">✓</span>}
                          </div>
                          <div>
                            <p className="font-medium text-stone-800">{menu.name}</p>
                            <p className="text-xs text-stone-400">約{menu.duration}分</p>
                          </div>
                        </div>
                        <p className="font-bold text-stone-800">{formatPrice(menu.price)}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {errors.menu && <p className="text-red-500 text-sm mb-4">{errors.menu}</p>}

            {selectedMenus.length > 0 && (
              <div className="bg-white rounded-xl border border-stone-100 p-4 mb-6">
                <p className="text-sm font-bold text-stone-600 mb-2">選択中</p>
                <div className="space-y-1">
                  {selectedMenus.map(m => (
                    <div key={m.id} className="flex justify-between text-sm">
                      <span className="text-stone-600">{m.name}</span>
                      <span>{formatPrice(m.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-stone-100 mt-2 pt-2 flex justify-between text-sm font-bold">
                  <span>メニュー合計</span>
                  <span>{formatPrice(menuTotal)}</span>
                </div>
                <p className="text-xs text-stone-400 mt-1">所要時間：約{menuDuration}分</p>
              </div>
            )}
            <button onClick={nextStep} className="w-full bg-stone-800 text-white font-bold py-4 rounded-full hover:bg-stone-700 transition-colors">
              次へ：担当者を選ぶ
            </button>
          </div>
        )}

        {/* ===== STEP 2: 担当者選択 ===== */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-stone-800 mb-1">担当者を選択</h2>
            <p className="text-sm text-stone-400 mb-6">ご指名または「おまかせ」をお選びください</p>

            {/* おまかせ */}
            <button
              onClick={() => setSelectedStaffId("free")}
              className={`w-full flex items-center justify-between p-4 rounded-xl border-2 mb-3 transition-all ${
                selectedStaffId === "free"
                  ? "border-stone-800 bg-stone-50"
                  : "border-stone-100 bg-white hover:border-stone-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-2xl shrink-0">
                  🍀
                </div>
                <div className="text-left">
                  <p className="font-bold text-stone-800">おまかせ（フリー）</p>
                  <p className="text-xs text-stone-400 mt-0.5">空いているスタッフが担当します</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm text-stone-400">指名料</p>
                <p className="font-bold text-stone-500">なし</p>
              </div>
            </button>

            {/* スタッフ一覧 */}
            {data.staff.map(staff => (
              <button
                key={staff.id}
                onClick={() => setSelectedStaffId(staff.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 mb-3 transition-all ${
                  selectedStaffId === staff.id
                    ? "border-stone-800 bg-stone-50"
                    : "border-stone-100 bg-white hover:border-stone-200"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
                    style={{ backgroundColor: staff.color }}
                  >
                    {staff.name[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-stone-800">{staff.name}</p>
                    <p className="text-xs text-stone-400">{staff.title}</p>
                    <p className="text-xs text-stone-500 mt-1">{staff.bio}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-xs text-stone-400">指名料</p>
                  <p className="font-bold text-rose-500">{formatPrice(staff.nominationFee)}</p>
                </div>
              </button>
            ))}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="w-24 border border-stone-200 text-stone-600 font-bold py-4 rounded-full hover:bg-stone-50 transition-colors text-sm">
                戻る
              </button>
              <button onClick={nextStep} className="flex-1 bg-stone-800 text-white font-bold py-4 rounded-full hover:bg-stone-700 transition-colors">
                次へ：日時を選ぶ
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: 日時選択 ===== */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-stone-800 mb-1">日時を選択</h2>
            <p className="text-sm text-stone-400 mb-6">定休日（日曜）は選択できません</p>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-stone-400 tracking-widest mb-3">日付</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableDates.slice(0, 16).map(date => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`py-3 px-1 rounded-xl border-2 text-xs font-medium transition-all ${
                      selectedDate === date
                        ? "border-stone-800 bg-stone-800 text-white"
                        : "border-stone-100 bg-white hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    {(() => {
                      const d = new Date(date + "T00:00:00");
                      return (
                        <span>
                          {d.getMonth()+1}/{d.getDate()}
                          <span className="block text-[10px] opacity-70">
                            {["日","月","火","水","木","金","土"][d.getDay()]}
                          </span>
                        </span>
                      );
                    })()}
                  </button>
                ))}
              </div>
              {errors.date && <p className="text-red-500 text-sm mt-2">{errors.date}</p>}
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-stone-400 tracking-widest mb-3">時間</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      selectedTime === t
                        ? "border-stone-800 bg-stone-800 text-white"
                        : "border-stone-100 bg-white hover:border-stone-300 text-stone-700"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              {errors.time && <p className="text-red-500 text-sm mt-2">{errors.time}</p>}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="w-24 border border-stone-200 text-stone-600 font-bold py-4 rounded-full hover:bg-stone-50 transition-colors text-sm">
                戻る
              </button>
              <button onClick={nextStep} className="flex-1 bg-stone-800 text-white font-bold py-4 rounded-full hover:bg-stone-700 transition-colors">
                次へ：お客様情報
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP 4: お客様情報 + 確認 ===== */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-stone-800 mb-1">お客様情報</h2>
            <p className="text-sm text-stone-400 mb-6">ご確認のご連絡をする場合があります</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-1.5">お名前 <span className="text-red-500">*</span></label>
                <input
                  type="text" placeholder="山田 花子"
                  value={customerName} onChange={e => setCustomerName(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-white"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-1.5">電話番号 <span className="text-red-500">*</span></label>
                <input
                  type="tel" placeholder="090-0000-0000"
                  value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-white"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-stone-600 mb-1.5">ご要望・ご相談（任意）</label>
                <textarea
                  rows={3} placeholder="例：前回よりも短めに、など"
                  value={note} onChange={e => setNote(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-500 bg-white resize-none"
                />
              </div>
            </div>

            {/* 予約内容確認 */}
            <div className="bg-white rounded-2xl border border-stone-100 p-5 mb-6">
              <h3 className="font-bold text-stone-800 mb-4">ご予約内容の確認</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-400">担当</span>
                  <span className="font-medium text-stone-800">
                    {selectedStaff ? `${selectedStaff.name}（${selectedStaff.title}）` : "おまかせ"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">日時</span>
                  <span className="font-medium text-stone-800">{formatDate(selectedDate)} {selectedTime}</span>
                </div>
                <div className="border-t border-stone-100 pt-3">
                  <p className="text-stone-400 mb-2">メニュー</p>
                  {selectedMenus.map(m => (
                    <div key={m.id} className="flex justify-between mb-1">
                      <span className="text-stone-600">{m.name}</span>
                      <span>{formatPrice(m.price)}</span>
                    </div>
                  ))}
                  {nominationFee > 0 && (
                    <div className="flex justify-between mb-1 text-rose-500">
                      <span>指名料（{selectedStaff?.name}）</span>
                      <span>{formatPrice(nominationFee)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-stone-200 pt-3 flex justify-between font-bold text-base">
                  <span>合計（税込）</span>
                  <span className="text-stone-800">{formatPrice(totalPrice)}</span>
                </div>
                <p className="text-xs text-stone-400">所要時間：約{menuDuration}分</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="w-24 border border-stone-200 text-stone-600 font-bold py-4 rounded-full hover:bg-stone-50 transition-colors text-sm">
                戻る
              </button>
              <button onClick={handleSubmit} className="flex-1 bg-stone-800 text-white font-bold py-4 rounded-full hover:bg-stone-700 transition-colors">
                予約を確定する
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
