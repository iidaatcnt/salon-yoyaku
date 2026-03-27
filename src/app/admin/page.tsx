"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppData, Staff, MenuItem } from "@/types";
import { loadData, saveData, genId, formatPrice, formatDate, CATEGORY_LABEL } from "@/lib/storage";

type AdminTab = "reservations" | "staff" | "menus";

const CATEGORIES = ["cut","color","perm","treatment","other"] as const;

export default function AdminPage() {
  const [data, setData] = useState<AppData>({ staff: [], menus: [], reservations: [] });
  const [tab, setTab] = useState<AdminTab>("reservations");

  // Staff form
  const [staffForm, setStaffForm] = useState({ name:"", title:"", nominationFee:"", bio:"", color:"#c4b5fd" });
  const [editStaffId, setEditStaffId] = useState<string|null>(null);

  // Menu form
  const [menuForm, setMenuForm] = useState({ name:"", price:"", duration:"", category:"cut" as typeof CATEGORIES[number] });
  const [editMenuId, setEditMenuId] = useState<string|null>(null);

  useEffect(() => { setData(loadData()); }, []);

  const update = useCallback((next: AppData) => { setData(next); saveData(next); }, []);

  // ===== スタッフ =====
  const saveStaff = () => {
    const { name, title, nominationFee, bio, color } = staffForm;
    if (!name.trim() || !nominationFee) return;
    const fee = Number(nominationFee);
    if (editStaffId) {
      update({ ...data, staff: data.staff.map(s => s.id === editStaffId ? { ...s, name, title, nominationFee: fee, bio, color } : s) });
      setEditStaffId(null);
    } else {
      update({ ...data, staff: [...data.staff, { id: genId(), name, title, nominationFee: fee, bio, color }] });
    }
    setStaffForm({ name:"", title:"", nominationFee:"", bio:"", color:"#c4b5fd" });
  };

  const editStaff = (s: Staff) => {
    setEditStaffId(s.id);
    setStaffForm({ name: s.name, title: s.title, nominationFee: String(s.nominationFee), bio: s.bio, color: s.color });
  };

  const deleteStaff = (id: string) => {
    if (!confirm("削除しますか？")) return;
    update({ ...data, staff: data.staff.filter(s => s.id !== id) });
  };

  // ===== メニュー =====
  const saveMenu = () => {
    const { name, price, duration, category } = menuForm;
    if (!name.trim() || !price || !duration) return;
    if (editMenuId) {
      update({ ...data, menus: data.menus.map(m => m.id === editMenuId ? { ...m, name, price: Number(price), duration: Number(duration), category } : m) });
      setEditMenuId(null);
    } else {
      update({ ...data, menus: [...data.menus, { id: genId(), name, price: Number(price), duration: Number(duration), category }] });
    }
    setMenuForm({ name:"", price:"", duration:"", category:"cut" });
  };

  const editMenu = (m: MenuItem) => {
    setEditMenuId(m.id);
    setMenuForm({ name: m.name, price: String(m.price), duration: String(m.duration), category: m.category });
  };

  const deleteMenu = (id: string) => {
    if (!confirm("削除しますか？")) return;
    update({ ...data, menus: data.menus.filter(m => m.id !== id) });
  };

  const deleteReservation = (id: string) => {
    if (!confirm("この予約を削除しますか？")) return;
    update({ ...data, reservations: data.reservations.filter(r => r.id !== id) });
  };

  const inputCls = "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-500 bg-white";

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-stone-400 hover:text-stone-600 text-sm">←</Link>
            <div>
              <h1 className="font-bold text-stone-800 tracking-widest">LUMIÈRE</h1>
              <p className="text-xs text-stone-400">管理者ページ</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 flex">
          {([
            { id: "reservations", label: `予約一覧 (${data.reservations.length})` },
            { id: "staff",        label: `スタッフ (${data.staff.length})` },
            { id: "menus",        label: `メニュー (${data.menus.length})` },
          ] as { id: AdminTab; label: string }[]).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-stone-800 text-stone-800"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* ===== 予約一覧 ===== */}
        {tab === "reservations" && (
          <div>
            <h2 className="font-bold text-stone-800 mb-4">予約一覧</h2>
            {data.reservations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center text-stone-400">
                予約はまだありません
              </div>
            ) : (
              <div className="space-y-3">
                {[...data.reservations]
                  .sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                  .map(r => {
                    const staff = data.staff.find(s => s.id === r.staffId);
                    const menus = data.menus.filter(m => r.menuIds.includes(m.id));
                    return (
                      <div key={r.id} className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-bold text-stone-800 text-lg">{r.customerName} 様</p>
                            <p className="text-sm text-stone-500">{formatDate(r.date)} {r.time}</p>
                            <p className="text-sm text-stone-500">
                              担当：{staff ? `${staff.name}（${staff.title}）` : "おまかせ"}
                            </p>
                            <p className="text-sm text-stone-500">
                              メニュー：{menus.map(m => m.name).join(" / ")}
                            </p>
                            {r.nominationFee > 0 && (
                              <p className="text-xs text-rose-400">指名料 {formatPrice(r.nominationFee)} 含む</p>
                            )}
                            <p className="font-bold text-stone-800">合計 {formatPrice(r.totalPrice)}</p>
                            {r.note && <p className="text-xs text-stone-400 bg-stone-50 rounded px-2 py-1 mt-1">「{r.note}」</p>}
                            <p className="text-xs text-stone-300">TEL: {r.customerPhone}</p>
                          </div>
                          <button onClick={() => deleteReservation(r.id)}
                            className="text-red-400 hover:text-red-600 text-xs font-medium ml-4 shrink-0">
                            削除
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ===== スタッフ管理 ===== */}
        {tab === "staff" && (
          <div className="grid sm:grid-cols-2 gap-6">
            {/* フォーム */}
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <h2 className="font-bold text-stone-800 mb-4">
                {editStaffId ? "スタッフを編集" : "スタッフを追加"}
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">名前 *</label>
                  <input className={inputCls} placeholder="田中 美咲"
                    value={staffForm.name} onChange={e => setStaffForm(p => ({...p, name: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">役職</label>
                  <input className={inputCls} placeholder="トップスタイリスト"
                    value={staffForm.title} onChange={e => setStaffForm(p => ({...p, title: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">指名料（円） *</label>
                  <input className={inputCls} type="number" placeholder="1500"
                    value={staffForm.nominationFee} onChange={e => setStaffForm(p => ({...p, nominationFee: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">自己紹介</label>
                  <textarea className={`${inputCls} resize-none`} rows={2} placeholder="得意なスタイルなど"
                    value={staffForm.bio} onChange={e => setStaffForm(p => ({...p, bio: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">アバターカラー</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={staffForm.color}
                      onChange={e => setStaffForm(p => ({...p, color: e.target.value}))}
                      className="w-10 h-10 rounded-lg border border-stone-200 cursor-pointer" />
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: staffForm.color }}>
                      {staffForm.name[0] || "？"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveStaff}
                    className="flex-1 bg-stone-800 text-white font-bold py-2.5 rounded-full text-sm hover:bg-stone-700 transition-colors">
                    {editStaffId ? "更新" : "追加"}
                  </button>
                  {editStaffId && (
                    <button onClick={() => { setEditStaffId(null); setStaffForm({ name:"", title:"", nominationFee:"", bio:"", color:"#c4b5fd" }); }}
                      className="px-4 border border-stone-200 text-stone-500 font-bold py-2.5 rounded-full text-sm hover:bg-stone-50">
                      キャンセル
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 一覧 */}
            <div className="space-y-3">
              {data.staff.map(s => (
                <div key={s.id} className="bg-white rounded-2xl border border-stone-100 p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                    style={{ backgroundColor: s.color }}>
                    {s.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-800">{s.name}</p>
                    <p className="text-xs text-stone-400">{s.title}</p>
                    <p className="text-xs text-rose-400 font-bold">指名料 {formatPrice(s.nominationFee)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => editStaff(s)} className="text-xs text-stone-500 hover:text-stone-700 border border-stone-200 px-3 py-1.5 rounded-full">編集</button>
                    <button onClick={() => deleteStaff(s.id)} className="text-xs text-red-400 hover:text-red-600 border border-red-100 px-3 py-1.5 rounded-full">削除</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== メニュー管理 ===== */}
        {tab === "menus" && (
          <div className="grid sm:grid-cols-2 gap-6">
            {/* フォーム */}
            <div className="bg-white rounded-2xl border border-stone-100 p-5">
              <h2 className="font-bold text-stone-800 mb-4">
                {editMenuId ? "メニューを編集" : "メニューを追加"}
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">メニュー名 *</label>
                  <input className={inputCls} placeholder="カット"
                    value={menuForm.name} onChange={e => setMenuForm(p => ({...p, name: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">カテゴリー</label>
                  <select className={inputCls}
                    value={menuForm.category} onChange={e => setMenuForm(p => ({...p, category: e.target.value as typeof CATEGORIES[number]}))}>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">料金（円） *</label>
                  <input className={inputCls} type="number" placeholder="4500"
                    value={menuForm.price} onChange={e => setMenuForm(p => ({...p, price: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">所要時間（分） *</label>
                  <input className={inputCls} type="number" placeholder="45"
                    value={menuForm.duration} onChange={e => setMenuForm(p => ({...p, duration: e.target.value}))} />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={saveMenu}
                    className="flex-1 bg-stone-800 text-white font-bold py-2.5 rounded-full text-sm hover:bg-stone-700 transition-colors">
                    {editMenuId ? "更新" : "追加"}
                  </button>
                  {editMenuId && (
                    <button onClick={() => { setEditMenuId(null); setMenuForm({ name:"", price:"", duration:"", category:"cut" }); }}
                      className="px-4 border border-stone-200 text-stone-500 font-bold py-2.5 rounded-full text-sm hover:bg-stone-50">
                      キャンセル
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 一覧 */}
            <div className="space-y-2">
              {CATEGORIES.map(cat => {
                const items = data.menus.filter(m => m.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat}>
                    <p className="text-xs font-bold text-stone-400 tracking-widest mb-2 px-1">{CATEGORY_LABEL[cat]}</p>
                    {items.map(m => (
                      <div key={m.id} className="bg-white rounded-xl border border-stone-100 px-4 py-3 flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-stone-800 text-sm">{m.name}</p>
                          <p className="text-xs text-stone-400">{formatPrice(m.price)} / 約{m.duration}分</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => editMenu(m)} className="text-xs text-stone-500 hover:text-stone-700 border border-stone-200 px-3 py-1.5 rounded-full">編集</button>
                          <button onClick={() => deleteMenu(m.id)} className="text-xs text-red-400 hover:text-red-600 border border-red-100 px-3 py-1.5 rounded-full">削除</button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
