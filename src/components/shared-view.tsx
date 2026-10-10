"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowUpRight, LoaderCircle } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { PublicShare } from "@/lib/types";
import { PublicLookCard } from "@/components/public-look-card";

export function SharedView({
  initialShare,
  token,
}: {
  initialShare: PublicShare | null;
  token: string;
}) {
  const [share, setShare] = useState<PublicShare | null>(initialShare);
  const [loading, setLoading] = useState(!initialShare);

  useEffect(() => {
    if (share) return;
    let active = true;
    async function fetchFromClient() {
      try {
        const ref = doc(db, "shares", token);
        const snap = await getDoc(ref);
        if (active && snap.exists()) {
          const data = snap.data();
          if (data?.payload) {
            setShare(data.payload as PublicShare);
          }
        }
      } catch (err) {
        console.warn("Client fallback share fetch error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchFromClient();
    return () => {
      active = false;
    };
  }, [share, token]);

  if (loading) {
    return (
      <main id="main-content" className="container" style={{ padding: "6rem 0", textAlign: "center" }}>
        <LoaderCircle className="spin" size={32} style={{ margin: "0 auto 1rem" }} />
        <p>Đang mở bộ phối Việt phục được chia sẻ…</p>
      </main>
    );
  }

  if (!share) {
    return (
      <main id="main-content" className="container" style={{ padding: "6rem 0", textAlign: "center" }}>
        <BookOpen size={42} strokeWidth={1} style={{ margin: "0 auto 1rem", opacity: 0.7 }} />
        <h1>Liên kết không khả dụng</h1>
        <p style={{ margin: "1rem 0 2rem" }}>
          Bộ phối này có thể đã được tắt chia sẻ hoặc đường dẫn không còn tồn tại.
        </p>
        <Link href="/phong-phoi" className="button button-primary">
          Tự phối trang phục riêng <ArrowUpRight size={17} />
        </Link>
      </main>
    );
  }

  return (
    <main id="main-content" className="container">
      <header className="page-heading">
        <div>
          <span className="eyebrow">
            {share.kind === "lookbook" ? "LOOKBOOK ĐƯỢC CHIA SẺ" : "MỘT BỘ PHỐI, MỘT CÁ TÍNH"}
          </span>
          <h1>{share.name}</h1>
          <p>Được phối bởi {share.author}</p>
          {share.description && <p className="shared-description">{share.description}</p>}
        </div>
        <Link href="/phong-phoi" className="button button-secondary">
          Ghé phòng phối <ArrowUpRight size={17} />
        </Link>
      </header>
      <div className="share-banner">
        <span>
          <BookOpen size={15} style={{ display: "inline", marginRight: 8 }} />
          {share.looks.length} bộ phối · Cảm hứng Việt phục đương đại
        </span>
        <span className="text-muted">Thích một bộ? Hãy mở và thêm chất riêng của bạn.</span>
      </div>
      {share.looks.length ? (
        <div className={`public-look-grid ${share.looks.length === 1 ? "single" : ""}`}>
          {share.looks.map((look) => (
            <PublicLookCard key={look.id} look={look} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <BookOpen size={38} strokeWidth={1} />
          <h2>Câu chuyện đang được viết.</h2>
          <p>Chủ sở hữu chưa thêm bộ phối nào vào lookbook này.</p>
        </div>
      )}
    </main>
  );
}
