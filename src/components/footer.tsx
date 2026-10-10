import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "./brand";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main container">
        <div>
          <Brand />
          <p>
            Một chút truyền thống.
            <br />
            Một chút bạn.
          </p>
        </div>
        <div className="footer-links">
          <Link href="/phong-phoi">
            Bắt đầu phối đồ <ArrowUpRight size={15} />
          </Link>
          <Link href="/#cau-chuyen">
            Câu chuyện Việt phục <ArrowUpRight size={15} />
          </Link>
          <Link href="/lookbook">
            Lookbook của tôi <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>
      <div className="footer-bottom container">
        <span suppressHydrationWarning>© {new Date().getFullYear()} Việt Mixi</span>
        <span>Giữ nét Việt. Thêm chất riêng.</span>
        <span>Thiết kế bằng sự trân trọng.</span>
      </div>
    </footer>
  );
}
