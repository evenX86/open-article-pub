import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Article Pub",
  description: "微信公众号草稿箱 API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
