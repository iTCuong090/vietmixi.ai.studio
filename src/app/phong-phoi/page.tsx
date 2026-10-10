import { Suspense } from "react";
import Studio from "@/components/studio";

export const metadata = {
  title: "Phòng phối",
  description:
    "Phối Việt phục theo chất riêng. Khám phá áo dài, áo ngũ thân, áo tứ thân, nhật bình và áo bà ba.",
};

export default function StudioPage() {
  return (
    <main id="main-content">
      <Suspense
        fallback={
          <div style={{ padding: "6rem", textAlign: "center", color: "#253f4d" }}>
            Đang mở tủ Việt phục…
          </div>
        }
      >
        <Studio />
      </Suspense>
    </main>
  );
}
