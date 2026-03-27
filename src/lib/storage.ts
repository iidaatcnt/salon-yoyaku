import { AppData } from "@/types";

const KEY = "salon-yoyaku-data";

const defaultData: AppData = {
  staff: [
    { id: "s1", name: "田中 美咲", title: "トップスタイリスト", nominationFee: 1500, bio: "カラーとカットが得意。自然なスタイルを大切にします。", color: "#f9a8d4" },
    { id: "s2", name: "佐藤 健太", title: "スタイリスト",       nominationFee: 1000, bio: "メンズカットとパーマが得意。トレンドスタイルを提案します。", color: "#93c5fd" },
    { id: "s3", name: "鈴木 あおい", title: "シニアスタイリスト", nominationFee: 2000, bio: "ブリーチ・ハイトーンカラーが専門。個性的なスタイルもお任せ。", color: "#86efac" },
  ],
  menus: [
    { id: "m1", name: "カット",               price: 4500,  duration: 45,  category: "cut" },
    { id: "m2", name: "カット＋シャンプー",   price: 5500,  duration: 60,  category: "cut" },
    { id: "m3", name: "フルカラー",           price: 8000,  duration: 90,  category: "color" },
    { id: "m4", name: "リタッチカラー",       price: 6000,  duration: 70,  category: "color" },
    { id: "m5", name: "ハイライト",           price: 12000, duration: 120, category: "color" },
    { id: "m6", name: "デジタルパーマ",       price: 14000, duration: 150, category: "perm" },
    { id: "m7", name: "ストレートパーマ",     price: 13000, duration: 150, category: "perm" },
    { id: "m8", name: "トリートメント",       price: 3000,  duration: 30,  category: "treatment" },
    { id: "m9", name: "ヘッドスパ",           price: 4000,  duration: 40,  category: "treatment" },
  ],
  reservations: [],
};

export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultData;
    return JSON.parse(raw) as AppData;
  } catch {
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function formatPrice(n: number): string {
  return `¥${n.toLocaleString()}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
}

export function getAvailableDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() !== 0) { // 日曜定休
      dates.push(d.toISOString().split("T")[0]);
    }
  }
  return dates;
}

export const TIME_SLOTS = [
  "10:00","10:30","11:00","11:30","12:00","12:30",
  "13:00","13:30","14:00","14:30","15:00","15:30",
  "16:00","16:30","17:00","17:30","18:00","18:30",
];

export const CATEGORY_LABEL: Record<string, string> = {
  cut: "カット",
  color: "カラー",
  perm: "パーマ",
  treatment: "トリートメント",
  other: "その他",
};
