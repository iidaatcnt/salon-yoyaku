import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hair Salon LUMIÈRE | ご予約",
  description: "Hair Salon LUMIÈREのオンライン予約システム。担当者指名・フリー予約対応。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
