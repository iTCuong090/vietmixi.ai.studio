"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="empty-page container">
      <span className="eyebrow">MỘT CHÚT GIÁN ĐOẠN</span>
      <h1>Hẹn bạn thử lại một chút.</h1>
      <p>Chưa thể tải nội dung lúc này. Bạn có thể thử tải lại hoặc quay về phòng phối.</p>
      <button className="button button-primary" onClick={reset}>
        Thử lại
      </button>
    </main>
  );
}
