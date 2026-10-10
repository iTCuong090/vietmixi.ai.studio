import type { Metadata } from "next";
import { LookbookManager } from "@/components/lookbook-manager";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Lookbook của tôi",
  description:
    "Lưu những bộ phối yêu thích, kể câu chuyện của riêng bạn và chia sẻ một chút gu Việt.",
  robots: { index: false, follow: false },
};

export default function LookbookPage() {
  return (
    <>
      <main id="main-content" className="container library-section">
        <LookbookManager />
      </main>
      <Footer />
    </>
  );
}
