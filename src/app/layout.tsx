import type { Metadata } from "next";
import "@fontsource/be-vietnam-pro/vietnamese-400.css";
import "@fontsource/be-vietnam-pro/vietnamese-500.css";
import "@fontsource/be-vietnam-pro/vietnamese-600.css";
import "@fontsource/be-vietnam-pro/latin-400.css";
import "@fontsource/be-vietnam-pro/latin-500.css";
import "@fontsource/be-vietnam-pro/latin-600.css";
import "@fontsource/noto-serif/vietnamese-400.css";
import "@fontsource/noto-serif/vietnamese-400-italic.css";
import "@fontsource/noto-serif/latin-400.css";
import "@fontsource/noto-serif/latin-400-italic.css";
import "./globals.css";
import { Header } from "@/components/header";
export const metadata: Metadata = {
  title: { default: "Việt Mixi — Giữ nét Việt. Thêm chất riêng.", template: "%s | Việt Mixi" },
  description:
    "Khám phá và phối Việt phục theo cách của bạn. Thử trang phục 2D, tìm hiểu văn hóa và tạo lookbook riêng cùng Việt Mixi.",
  openGraph: {
    title: "Việt Mixi — Giữ nét Việt. Thêm chất riêng.",
    description: "Một chút truyền thống. Một chút bạn.",
    locale: "vi_VN",
    type: "website",
  },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main-content">
          Đến nội dung chính
        </a>
        <Header />
        {children}
      </body>
    </html>
  );
}
