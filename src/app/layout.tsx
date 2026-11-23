import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Gowun_Batang } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-editorial",
});

const gowunBatang = Gowun_Batang({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-serif-kr",
});

export const metadata: Metadata = {
  title: "READING LOG | 서재의 한 줄",
  description: "책과 웹툰의 문장을 수집하고 월말 에디토리얼 AI 서평을 받아보는 개인 아카이브",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "READING LOG",
  },
};

export const viewport: Viewport = {
  themeColor: "#F2F1ED",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${cormorant.variable} ${gowunBatang.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}