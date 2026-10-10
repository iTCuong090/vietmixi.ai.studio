import Link from "next/link";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Flower2,
  Layers3,
  Palette,
  Bookmark,
  Sparkles,
  MoveUpRight,
} from "lucide-react";
import { PRESETS, GARMENTS, getPalette } from "@/lib/catalog";
import { OutfitFigure } from "@/components/outfit-figure";
import { Footer } from "@/components/footer";
import { StyleStart } from "@/components/garment-items-catalog";
export default function Home() {
  return (
    <>
      <main id="main-content">
        <section className="hero container">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              DI SẢN TRONG DIỆN MẠO MỚI
            </div>
            <h1>
              Mặc nét Việt.
              <br />
              <em>Phối chất riêng.</em>
              <span className="heading-flower">
                <Flower2 strokeWidth={1} />
              </span>
            </h1>
            <p className="hero-description">
              Khám phá Việt phục, phối theo dịp và hiểu ý nghĩa văn hóa của từng bộ.
            </p>
            <div className="hero-buttons">
              <StyleStart autoOpen={false} label="Bắt đầu phối đồ" primary />
              <a href="#cam-hung" className="button button-link">Xem bản phối mẫu <ArrowDown size={17} /></a>
            </div>
            <div style={{ marginTop: 18 }}><Link href="/phong-phoi?demo=1" className="text-link"><Sparkles size={17} /> Khám phá demo trong 60 giây <ArrowRight size={17} /></Link><p style={{ fontSize: 12, marginTop: 7, color: "#65736c" }}>Kỷ yếu → đổi màu → chuyện áo → so sánh A/B → lưu kết quả. Có thể bỏ qua.</p></div>
            <div className="hero-note">
              <span className="mini-color-stack">
                <i />
                <i />
                <i />
                <i />
              </span>
              <span>Không cần biết phối đồ. Chỉ cần là bạn.</span>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="Hai bộ phối Việt phục lấy cảm hứng từ áo dài và áo ngũ thân"
          >
            <div className="hero-arch" />
            <div className="hero-orbit" />
            <div className="hero-photo hero-photo-back">
              <Image
                src="/images/looks/ngu-than.png"
                alt="Ảnh minh họa người mẫu mặc áo ngũ thân màu chàm và khăn đóng"
                fill
                sizes="(max-width: 700px) 45vw, 270px"
                priority
              />
              <div className="photo-caption">
                <span>01 / CHÀM CỐ ĐÔ</span>
                <MoveUpRight size={14} />
              </div>
            </div>
            <div className="hero-photo hero-photo-front">
              <Image
                src="/images/looks/ao-dai.png"
                alt="Ảnh minh họa người mẫu mặc áo dài xanh cốm cầm hoa sen"
                fill
                sizes="(max-width: 700px) 55vw, 320px"
                priority
              />
              <div className="photo-caption">
                <span>02 / NẮNG TRÊN VAI</span>
                <MoveUpRight size={14} />
              </div>
            </div>
            <div className="hero-stamp">
              <Flower2 size={25} strokeWidth={1} />
              <span>
                NÉT VIỆT
                <br />
                <strong>GU BẠN</strong>
              </span>
            </div>
            <div className="floating-note">
              <span className="tiny-star">✳</span> Truyền thống,
              <br />
              <em>theo một cách mới.</em>
            </div>
            <span className="hero-art-credit">ẢNH MINH HỌA · BỘ PHỐI MẪU</span>
          </div>
        </section>
        <section className="container" aria-label="Ba điều bạn có thể làm với Việt Mixi" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, paddingTop: 12, paddingBottom: 28 }}>
          {[
            { href: "/phong-phoi?mode=guided", title: "01 · Phối theo nhu cầu", body: "Chọn dịp, thời tiết và miền cảm hứng. Nhận mẫu để chỉnh ngay.", icon: Palette },
            { href: "/phong-phoi?mode=free&focus=culture", title: "02 · Hiểu văn hóa có nguồn", body: "Xem đặc trưng chiếc áo và mở nguồn tham khảo ngay cạnh bản phối.", icon: Layers3 },
            { href: "/phong-phoi?demo=1", title: "03 · So sánh và lưu bản phối", body: "Thử hai bản A/B độc lập, tải ảnh hoặc lưu vào lookbook cá nhân.", icon: Bookmark },
          ].map(item => <Link key={item.title} href={item.href} style={{ display: "block", border: "1px solid #d8ded1", borderRadius: 16, background: "#f5f5ec", padding: "20px 22px", color: "#253f4d", textDecoration: "none" }}><item.icon size={22} /><h2 style={{ fontSize: 17, margin: "12px 0 8px" }}>{item.title} ↗</h2><p style={{ fontSize: 13, lineHeight: 1.7, margin: 0 }}>{item.body}</p></Link>)}
        </section>
        <div className="garment-ribbon">
          <div className="container ribbon-inner">
            {GARMENTS.map((garment, index) => (
              <Link key={garment.id} href={`/phong-phoi?preset=${PRESETS[index].id}`}>
                <span>{garment.name}</span>
                <Flower2 size={18} strokeWidth={1} />
              </Link>
            ))}
          </div>
        </div>
        <section className="section container" id="cam-hung">
          <div className="section-heading">
            <div>
              <span className="eyebrow">BẮT ĐẦU TỪ MỘT CHÚT CẢM HỨNG</span>
              <h2>
                Nét quen, <em>phối mới.</em>
              </h2>
            </div>
            <p>
              Một vài gợi ý để bạn bắt đầu.
              <br />
              Chạm vào bộ bạn thích, rồi thêm chất riêng.
            </p>
          </div>
          <div className="preset-grid">
            {PRESETS.map((preset, index) => (
              <Link
                href={`/phong-phoi?preset=${preset.id}`}
                key={preset.id}
                className="preset-card"
              >
                <div className={`preset-art preset-art-${index}`}>
                  <span className="preset-number">0{index + 1}</span>
                  <OutfitFigure
                    config={preset.config}
                    className="preset-figure"
                    showBackground={false}
                  />
                  <span className="preset-arrow">
                    <ArrowUpRight size={19} />
                  </span>
                  <div className="preset-swatches">
                    <i style={{ background: getPalette(preset.config.primaryColor).hex }} />
                    <i style={{ background: getPalette(preset.config.accentColor).hex }} />
                  </div>
                </div>
                <div className="preset-caption">
                  <span className="eyebrow">{GARMENTS[index].name}</span>
                  <h3>{preset.name}</h3>
                  <p>{preset.tagline.split(" · ")[1]}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section className="how-section">
          <div className="container how-inner">
            <div className="how-title">
              <span className="eyebrow">MỘT BỘ PHỐI, BA BƯỚC NHỎ</span>
              <h2>
                Gu của bạn.
                <br />
                <em>Sân chơi của bạn.</em>
              </h2>
              <Link href="/phong-phoi" className="text-link">
                Thử phối ngay <ArrowRight size={17} />
              </Link>
            </div>
            <div className="how-steps">
              {[
                {
                  icon: Layers3,
                  title: "Chọn một nét Việt",
                  body: "Áo dài, ngũ thân hay bà ba? Bắt đầu từ dáng áo hoặc dịp bạn muốn mặc.",
                },
                {
                  icon: Palette,
                  title: "Thêm một chút mình",
                  body: "Chọn màu, thêm phụ kiện, đổi phong cách. Mỗi thay đổi hiện ngay trên nhân vật.",
                },
                {
                  icon: Bookmark,
                  title: "Giữ lại một cảm hứng",
                  body: "Lưu vào lookbook, so sánh những lựa chọn và gửi bộ phối đến người bạn muốn.",
                },
              ].map((step, i) => (
                <div className="how-step" key={step.title}>
                  <span className="step-icon">
                    <step.icon size={23} strokeWidth={1.3} />
                  </span>
                  <span className="step-number">0{i + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="story-section container" id="cau-chuyen">
          <div className="story-art">
            <div className="story-art-caption">
              <span className="eyebrow">TỪ NHỮNG LỚP ÁO XƯA</span>
              <span>Một hành trình tiếp nối</span>
            </div>
            <OutfitFigure
              config={PRESETS[3].config}
              showBackground={false}
              className="story-figure"
            />
            <span className="story-vertical">DI SẢN KHÔNG ĐỨNG YÊN</span>
            <div className="story-seal">
              <Flower2 strokeWidth={1} />
            </div>
          </div>
          <div className="story-copy">
            <span className="eyebrow">PHỐI BẰNG GU · HIỂU BẰNG TÌNH YÊU</span>
            <h2>
              Mỗi tà áo
              <br />
              đều có <em>một câu chuyện.</em>
            </h2>
            <p>
              Việt phục không chỉ là những đường nét đẹp. Đó còn là dấu ấn của một vùng đất, một nếp
              sống và bao thế hệ đã đi qua.
            </p>
            <p>
              Việt Mixi mở một không gian để bạn sáng tạo cùng di sản — với những ghi chú văn hóa
              ngắn gọn, nguồn tham khảo rõ ràng và gợi ý phối đầy trân trọng.
            </p>
            <div className="story-promise">
              <Flower2 size={22} strokeWidth={1.2} />
              <span>
                Tự do thêm chất riêng.
                <br />
                <strong>Luôn hiểu nét đẹp mình đang mặc.</strong>
              </span>
            </div>
            <Link href="/phong-phoi" className="text-link">
              Khám phá câu chuyện sau tà áo <ArrowUpRight size={17} />
            </Link>
          </div>
        </section>
        <section className="closing-section container">
          <Sparkles size={24} strokeWidth={1} />
          <span className="eyebrow">CHƯƠNG TIẾP THEO LÀ CỦA BẠN</span>
          <h2>
            Hôm nay, bạn muốn
            <br />
            <em>mặc một câu chuyện thế nào?</em>
          </h2>
          <Link href="/phong-phoi" className="button button-primary">
            Tạo bộ phối đầu tiên <ArrowUpRight size={19} />
          </Link>
          <p>Phối thử tự do. Lưu lại khi bạn yêu thích.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
