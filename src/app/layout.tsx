import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shop Affiliate | Sản phẩm HOT giá tốt nhất",
  description: "Khám phá những sản phẩm HOT nhất từ Shopee, TikTok Shop với giá ưu đãi và mã giảm giá độc quyền. Deal săn sale hàng ngày!",
  keywords: "affiliate, shopee, tiktok shop, mã giảm giá, deal hot, săn sale",
  authors: [{ name: "Shop Affiliate" }],
  openGraph: {
    title: "Shop Affiliate | Sản phẩm HOT giá tốt nhất",
    description: "Khám phá những sản phẩm HOT nhất với giá ưu đãi và mã giảm giá độc quyền",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#0a0a0a]`}
      >
        {children}
      </body>
    </html>
  );
}
