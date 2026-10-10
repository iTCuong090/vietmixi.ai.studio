"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Download, LoaderCircle } from "lucide-react";
import type { SavedLook } from "@/lib/types";
import { getGarment, getPalette } from "@/lib/catalog";
import { OutfitFigure } from "./outfit-figure";
import { exportOutfitImage } from "@/lib/export-image";
export function PublicLookCard({ look }: { look: SavedLook }) {
  const router = useRouter();
  const ref = useRef<SVGSVGElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function remix() {
    try {
      sessionStorage.setItem("vietmixi:remix", JSON.stringify(look.config));
      router.push("/phong-phoi?remix=1");
    } catch {
      setError(
        "Trình duyệt đang chặn lưu tạm. Hãy cho phép lưu dữ liệu trang này để mở lại bộ phối.",
      );
    }
  }
  async function download() {
    if (!ref.current || busy) return;
    setBusy(true);
    setError("");
    try {
      await exportOutfitImage(ref.current, look.name);
    } catch {
      setError("Chưa thể xuất ảnh. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  }
  const garment = getGarment(look.config.garment);
  return (
    <article className="public-look-card">
      <div className="public-look-figure">
        <OutfitFigure config={look.config} svgRef={ref} />
      </div>
      <div className="public-look-info">
        <span className="eyebrow">{garment.name}</span>
        <h2>{look.name}</h2>
        <div className="row">
          <span
            className="palette-dot"
            style={{ background: getPalette(look.config.primaryColor).hex }}
          />
          <span
            className="palette-dot"
            style={{ background: getPalette(look.config.accentColor).hex }}
          />
          <span className="fine-print" style={{ margin: 0 }}>
            {getPalette(look.config.primaryColor).name} · {getPalette(look.config.accentColor).name}
          </span>
        </div>
        <p>{garment.description}</p>
        <p>{garment.origin}</p>
        <div className="row wrap">
          <button className="button button-primary button-small" onClick={remix}>
            Phối theo cách của bạn <ArrowUpRight size={16} />
          </button>
          <button
            className="icon-button"
            onClick={download}
            disabled={busy}
            aria-label="Tải ảnh bộ phối"
          >
            {busy ? <LoaderCircle size={17} className="spin" /> : <Download size={17} />}
          </button>
        </div>
        {error && (
          <p className="notice notice-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
