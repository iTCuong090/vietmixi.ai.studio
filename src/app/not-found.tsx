import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main-content" className="empty-page container">
      <span className="eyebrow">VIỆT MIXI · 404</span>
      <h1>Chưa tìm thấy trang này.</h1>
      <p>Đường dẫn có thể đã thay đổi hoặc chủ sở hữu đã tắt chia sẻ.</p>
      <Link href="/phong-phoi" className="button button-primary">
        Khám phá phòng phối
      </Link>
    </main>
  );
}
