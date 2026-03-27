export interface Staff {
  id: string;
  name: string;
  title: string;       // 例: "トップスタイリスト"
  nominationFee: number; // 指名料（円）
  bio: string;
  color: string;       // アバター背景色
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  duration: number;    // 所要時間（分）
  category: "cut" | "color" | "perm" | "treatment" | "other";
}

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  menuIds: string[];
  staffId: string | null;  // null = フリー（おまかせ）
  date: string;            // YYYY-MM-DD
  time: string;            // HH:MM
  totalPrice: number;
  nominationFee: number;
  note: string;
  createdAt: string;
}

export interface AppData {
  staff: Staff[];
  menus: MenuItem[];
  reservations: Reservation[];
}
