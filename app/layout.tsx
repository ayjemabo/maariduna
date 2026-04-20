import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "معارضنا",
  description: "منصة عربية لإدارة وتسليم المعارض الفنية في مدرسة البلد الأمين"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html dir="rtl" lang="ar">
      <body>{children}</body>
    </html>
  );
}
