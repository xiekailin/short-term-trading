import type { Metadata } from "next";
import { Noto_Sans_SC, DM_Serif_Display, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const notoSansSc = Noto_Sans_SC({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "夜航期权 · 美股期权观察",
  description: "面向个人观察者的美股期权看盘站，聚焦真实行情、波动率和期权链解释。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${notoSansSc.variable} ${dmSerif.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
