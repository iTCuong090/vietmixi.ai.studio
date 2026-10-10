"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  Columns2,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Trash2,
  UserRound,
  Wand2,
} from "lucide-react";
import { Dialog } from "@/components/dialog";
import { OutfitFigure } from "@/components/outfit-figure";
import { ACCESSORIES, PRESETS, getGarment, getPalette, matchingPreset } from "@/lib/catalog";
import type { OutfitConfig } from "@/lib/types";
import styles from "./studio.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
  config: OutfitConfig;
  onApply: (config: OutfitConfig) => void;
}

const SETTINGS = [
  { id: "studio", name: "Studio tối giản" },
  { id: "hoi-an", name: "Phố cổ Hội An" },
  { id: "hue", name: "Cố đô Huế" },
  { id: "lotus-pond", name: "Vườn sen ban mai" },
  { id: "modern-street", name: "Dạo phố đương đại" },
] as const;

const QUICK_PROMPTS = [
  "Ánh nắng vàng ấm chiều tà",
  "Nụ cười rạng rỡ tự nhiên",
  "Cơn gió nhẹ làm bay tà áo",
  "Không gian ngập tràn hoa sen",
  "Nét thanh tao, điện ảnh",
];

const LOADING_STEPS = [
  "Đang chuẩn bị phom dáng Việt phục…",
  "Đang phối chất liệu lụa, gấm và màu sắc…",
  "Đang tái hiện trang sức và phụ kiện truyền thống…",
  "Đang tinh chỉnh chân dung bằng gemini-nano-banana-2.1…",
  "Đang hoàn thiện những chi tiết cuối cùng…",
];

export default function RealLifeDialog({ open, onClose, config, onApply }: Props) {
  const [mode, setMode] = useState<"model" | "photo" | "samples">("model");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoMime, setPhotoMime] = useState<string>("image/jpeg");
  const [uploadError, setUploadError] = useState("");

  // AI settings
  const [setting, setSetting] = useState<(typeof SETTINGS)[number]["id"]>("studio");
  const [shotType, setShotType] = useState<"full" | "medium">("full");
  const [customPrompt, setCustomPrompt] = useState("");

  // AI generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState<string>("gemini-nano-banana-2.1");
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [compareMode, setCompareMode] = useState<"none" | "2d" | "userPhoto">("none");
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);

  // Preset sample states
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const [failedImage, setFailedImage] = useState<string | null>(null);

  const preset = matchingPreset(config);
  const garment = getGarment(config.garment);
  const primaryColor = getPalette(config.primaryColor);
  const accentColor = getPalette(config.accentColor);

  const headAcc = ACCESSORIES.find((a) => a.slot === "head" && a.id === config.accessories.head);
  const handAcc = ACCESSORIES.find((a) => a.slot === "hand" && a.id === config.accessories.hand);
  const shoeAcc = ACCESSORIES.find((a) => a.slot === "shoes" && a.id === config.accessories.shoes);

  // Rotate loading steps
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  function handleSelectPhoto(file: File | undefined) {
    if (!file) return;
    setUploadError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Hãy chọn ảnh JPEG, PNG hoặc WebP.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Ảnh cần nhỏ hơn 8 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPhoto(dataUrl);
      setPhotoBase64(dataUrl);
      setPhotoMime(file.type);
    };
    reader.onerror = () => {
      setUploadError("Không thể đọc ảnh này. Bạn hãy thử một ảnh khác.");
    };
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    setPhoto(null);
    setPhotoBase64(null);
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setGenerationError("");
    setLoadingStepIndex(0);

    try {
      const res = await fetch("/api/real-life", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          mode: mode === "photo" ? "photo" : "model",
          userImageBase64: mode === "photo" ? photoBase64 : undefined,
          userImageMime: mode === "photo" ? photoMime : undefined,
          customPrompt: customPrompt.trim() || undefined,
          setting,
          shotType,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Không thể tạo hình ngoài đời thực. Vui lòng thử lại.");
      }

      setAiResult(data.imageUrl);
      setAiModel(data.model || "gemini-nano-banana-2.1");
      setAiAnalysis(data.editorialAnalysis || null);
      setIsFallback(Boolean(data.isFallback));
      if (mode === "photo" && photo) {
        setCompareMode("userPhoto");
      } else {
        setCompareMode("none");
      }
    } catch (err) {
      setGenerationError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo hình ảnh ngoài đời thực.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleDownloadImage() {
    if (!aiResult) return;
    const link = document.createElement("a");
    link.href = aiResult;
    link.download = `vietmixi-${config.garment}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Dialog open={open} onClose={onClose} title="Ngắm bản phối ngoài đời thực" wide>
      <p className={styles.dialogIntro}>
        Tái hiện chân thực bộ Việt phục bạn đã chọn thành người thật với AI thế hệ mới{" "}
        <strong>gemini-nano-banana-2.1</strong>: tạo hình người mẫu riêng hoặc mặc thử lên ảnh của bạn.
      </p>

      <div className={styles.realLifeGrid}>
        {/* Left Column: Configuration & Controls */}
        <div>
          <div className={styles.segmented}>
            <button
              type="button"
              aria-pressed={mode === "model"}
              onClick={() => {
                setMode("model");
                setGenerationError("");
              }}
            >
              <UserRound size={15} /> Người mẫu AI
            </button>
            <button
              type="button"
              aria-pressed={mode === "photo"}
              onClick={() => {
                setMode("photo");
                setGenerationError("");
              }}
            >
              <ImagePlus size={15} /> Ảnh của tôi
            </button>
            <button
              type="button"
              aria-pressed={mode === "samples"}
              onClick={() => {
                setMode("samples");
                setGenerationError("");
              }}
            >
              <Sparkles size={15} /> Mẫu có sẵn
            </button>
          </div>

          {/* Current Outfit Summary Card */}
          <div className={styles.aiSummaryCard}>
            <div className={styles.aiSummaryTitle}>
              <span>Chi tiết bản phối đã chọn</span>
              <span style={{ fontWeight: 400, opacity: 0.85 }}>Áp dụng vào người thật</span>
            </div>
            <div className={styles.aiSummaryChips}>
              <span className={styles.aiSummaryChip}>
                <strong>{garment.name}</strong>
              </span>
              <span className={styles.aiSummaryChip}>
                <i className={styles.aiColorDot} style={{ background: primaryColor.hex }} />
                {primaryColor.name}
              </span>
              <span className={styles.aiSummaryChip}>
                <i className={styles.aiColorDot} style={{ background: accentColor.hex }} />
                Phối {accentColor.name}
              </span>
              <span className={styles.aiSummaryChip}>
                {config.bottom === "skirt" ? "Váy dài" : "Quần dài"}
              </span>
              {headAcc && headAcc.id !== "none" && (
                <span className={styles.aiSummaryChip}>Đầu: {headAcc.name}</span>
              )}
              {handAcc && handAcc.id !== "none" && (
                <span className={styles.aiSummaryChip}>Tay: {handAcc.name}</span>
              )}
              {shoeAcc && shoeAcc.id !== "none" && (
                <span className={styles.aiSummaryChip}>{shoeAcc.name}</span>
              )}
              {config.garment === "ao-cham" && config.jewelry?.kieng && <span className={styles.aiSummaryChip}>Kiềng bạc</span>}
              {config.garment === "ao-cham" && config.jewelry?.xatich && <span className={styles.aiSummaryChip}>Xà tích bạc</span>}
              {config.garment === "ao-cham" && config.jewelry?.bangles && <span className={styles.aiSummaryChip}>Vòng bạc</span>}
            </div>
          </div>

          {/* Mode 1: Model Creation */}
          {mode === "model" && (
            <div>
              <div className={styles.aiFormGroup}>
                <label className={styles.aiFormLabel}>Bối cảnh không gian</label>
                <div className={styles.aiSettingChips}>
                  {SETTINGS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={styles.aiSettingChip}
                      aria-pressed={setting === item.id}
                      onClick={() => setSetting(item.id)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.aiFormGroup}>
                <label className={styles.aiFormLabel}>Góc chụp người mẫu</label>
                <div className={styles.aiSettingChips}>
                  <button
                    type="button"
                    className={styles.aiSettingChip}
                    aria-pressed={shotType === "full"}
                    onClick={() => setShotType("full")}
                  >
                    Toàn thân (Full-body)
                  </button>
                  <button
                    type="button"
                    className={styles.aiSettingChip}
                    aria-pressed={shotType === "medium"}
                    onClick={() => setShotType("medium")}
                  >
                    Bán thân (Chân dung)
                  </button>
                </div>
              </div>

              <div className={styles.aiFormGroup}>
                <label className={styles.aiFormLabel}>Gợi ý thêm bằng văn bản (Prompt tùy chỉnh)</label>
                <textarea
                  className={styles.aiTextarea}
                  placeholder="Nhập mô tả thêm về ánh sáng, thần thái, bối cảnh… (vd: Ánh hoàng hôn ấm áp, nụ cười nhẹ)"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  maxLength={500}
                />
                <div className={styles.aiQuickPrompts}>
                  {QUICK_PROMPTS.map((promptText) => (
                    <button
                      key={promptText}
                      type="button"
                      className={styles.aiQuickPromptBtn}
                      onClick={() =>
                        setCustomPrompt((prev) =>
                          prev ? `${prev}, ${promptText}` : promptText,
                        )
                      }
                    >
                      + {promptText}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className={styles.aiGenerateBtn}
                disabled={isGenerating}
                onClick={handleGenerate}
              >
                {isGenerating ? (
                  <>
                    <LoaderCircle size={17} className={styles.spin} />
                    <span>Đang tạo hình người mẫu…</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={17} />
                    <span>Tạo hình người thật (AI)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Mode 2: Virtual Try-on on User Photo */}
          {mode === "photo" && (
            <div>
              <div className={styles.uploadArea}>
                {photo ? (
                  <div style={{ textAlign: "center" }}>
                    <Image
                      src={photo}
                      alt="Ảnh của bạn đang xem trước"
                      width={180}
                      height={210}
                      unoptimized
                      className={styles.uploadPreview}
                    />
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        className={styles.smallButton}
                        type="button"
                        onClick={handleRemovePhoto}
                      >
                        <Trash2 size={14} /> Xóa ảnh
                      </button>
                      <label className={styles.smallButton} style={{ cursor: "pointer" }}>
                        <ImagePlus size={14} /> Đổi ảnh khác
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: "none" }}
                          onChange={(e) => handleSelectPhoto(e.target.files?.[0])}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className={styles.uploadLabel}>
                    <ImagePlus size={28} />
                    <strong>Tải ảnh chân dung hoặc toàn thân của bạn</strong>
                    <span>Hỗ trợ JPEG, PNG, WebP · tối đa 8 MB</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        handleSelectPhoto(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}

                {uploadError && (
                  <p role="alert" className={styles.error} style={{ marginTop: "8px" }}>
                    {uploadError}
                  </p>
                )}
              </div>

              <div className={styles.aiFormGroup}>
                <label className={styles.aiFormLabel}>Bối cảnh muốn hòa nhập</label>
                <div className={styles.aiSettingChips}>
                  {SETTINGS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={styles.aiSettingChip}
                      aria-pressed={setting === item.id}
                      onClick={() => setSetting(item.id)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.aiFormGroup}>
                <label className={styles.aiFormLabel}>Yêu cầu chi tiết (Prompt bổ sung)</label>
                <textarea
                  className={styles.aiTextarea}
                  placeholder="Gợi ý: Giữ nguyên khuôn mặt và nụ cười, thêm nét thanh lịch..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  maxLength={500}
                />
              </div>

              <button
                type="button"
                className={styles.aiGenerateBtn}
                disabled={isGenerating || !photo}
                onClick={handleGenerate}
              >
                {isGenerating ? (
                  <>
                    <LoaderCircle size={17} className={styles.spin} />
                    <span>Đang mặc thử lên ảnh của bạn…</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={17} />
                    <span>Mặc thử Việt phục lên ảnh</span>
                  </>
                )}
              </button>

              {!photo && (
                <p style={{ fontSize: "10px", color: "#8b947a", marginTop: "6px", textAlign: "center" }}>
                  Hãy tải ảnh lên để bắt đầu mặc thử trang phục ngoài đời thực.
                </p>
              )}
            </div>
          )}

          {/* Mode 3: Presets list */}
          {mode === "samples" && (
            <div className={styles.modelNote}>
              <UserRound size={28} />
              <h3>Bộ mẫu có sẵn</h3>
              <p>
                Khám phá bộ sưu tập ảnh người mẫu minh họa tiêu biểu được phối sẵn theo các dáng áo
                truyền thống. Bấm chọn bên dưới để xem và áp dụng vào bản phối hiện tại.
              </p>
            </div>
          )}

          {/* Generation Progress Indicator */}
          {isGenerating && (
            <div className={styles.aiProgressBox}>
              <div className={styles.aiProgressPulse}>
                <LoaderCircle size={18} className={styles.spin} />
                <span>{LOADING_STEPS[loadingStepIndex]}</span>
              </div>
              <div className={styles.aiProgressBar}>
                <div className={styles.aiProgressBarFill} />
              </div>
              <p className={styles.aiProgressHint}>
                gemini-nano-banana-2.1 đang tạo hình độ phân giải cao (1K, tỉ lệ 3:4)…
              </p>
            </div>
          )}

          {/* Error Message */}
          {generationError && (
            <div className={styles.aiErrorAlert} role="alert">
              <div>
                <strong>Chưa tạo được hình ảnh:</strong>
                <div>{generationError}</div>
                <button type="button" onClick={handleGenerate}>
                  Thử lại
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Result / Showcase */}
        <div className={styles.aiResultContainer}>
          {mode === "samples" ? (
            <div className={styles.sampleResult}>
              {preset ? (
                <>
                  <div className={styles.sampleImage}>
                    {!loadedImage && !failedImage && (
                      <span className={styles.imageLoading}>
                        <LoaderCircle size={20} className={styles.spin} /> Đang tải ảnh mẫu…
                      </span>
                    )}
                    {failedImage === preset.image ? (
                      <p role="alert">Chưa tải được ảnh mẫu. Hãy thử lại sau.</p>
                    ) : (
                      <Image
                        key={preset.image}
                        src={preset.image}
                        alt={`Ảnh minh họa có sẵn: ${preset.name}`}
                        width={600}
                        height={800}
                        unoptimized
                        onLoad={() => setLoadedImage(preset.image)}
                        onError={() => setFailedImage(preset.image)}
                      />
                    )}
                    <span className={styles.sampleBadge}>ẢNH MINH HỌA CÓ SẴN</span>
                  </div>
                  <h3>{preset.name}</h3>
                  <p>{preset.tagline}</p>
                </>
              ) : (
                <div className={styles.noSample}>
                  <Sparkles size={34} />
                  <h3>Bản phối này có chất riêng!</h3>
                  <p>
                    Chưa có ảnh mẫu tĩnh khớp hoàn toàn với tổ hợp của bạn. Bạn hãy chuyển sang tab{" "}
                    <strong>Người mẫu AI</strong> hoặc <strong>Ảnh của tôi</strong> để AI tự tạo hình
                    chính xác bản phối này!
                  </p>
                </div>
              )}
            </div>
          ) : aiResult ? (
            <div>
              {compareMode === "userPhoto" && photo ? (
                <div className={styles.aiTryOnSideBySide}>
                  <div className={styles.aiTryOnCol}>
                    <div className={styles.aiTryOnColTitle}>Ảnh gốc của bạn</div>
                    <div className={styles.aiTryOnColImg}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt="Ảnh của bạn tải lên" />
                    </div>
                  </div>
                  <div className={styles.aiTryOnCol}>
                    <div className={styles.aiTryOnColTitle}>Việt phục ngoài đời thực</div>
                    <div className={styles.aiTryOnColImg}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={aiResult} alt="Người thật mặc Việt phục ngoài đời thực" />
                    </div>
                  </div>
                </div>
              ) : compareMode === "2d" ? (
                <div className={styles.aiCompareBox}>
                  <div className={styles.aiCompareCol}>
                    <div className={styles.aiCompareColHeader}>Bản vẽ 2D Studio</div>
                    <div className={styles.aiCompareColFigure}>
                      <OutfitFigure config={config} showBackground={false} />
                    </div>
                  </div>
                  <div className={styles.aiCompareCol}>
                    <div className={styles.aiCompareColHeader}>Người thật ngoài đời</div>
                    <div className={styles.aiCompareColFigure}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={aiResult} alt="Người thật mặc Việt phục ngoài đời thực" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.aiResultCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={aiResult} alt="Người thật mặc Việt phục ngoài đời thực" />
                  <span className={styles.aiModelBadge}>
                    {isFallback
                      ? "ẢNH MẪU THỰC TẾ · GIÁM TUYỂN GEMINI 3.8"
                      : `TẠO HÌNH AI · ${aiModel}`}
                  </span>
                </div>
              )}

              {aiAnalysis && (
                <div className={styles.aiAnalysisCard}>
                  <Sparkles size={18} style={{ color: "#ae8051", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong>Giám tuyển thời trang Việt Mixi (Gemini AI):</strong>
                    <p>{aiAnalysis}</p>
                  </div>
                </div>
              )}

              <div style={{ marginTop: "12px" }} className={styles.aiResultToolbar}>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {mode === "photo" && photo && (
                    <button
                      type="button"
                      className={`${styles.aiToolBtn} ${compareMode === "userPhoto" ? styles.aiToolBtnPrimary : ""}`}
                      onClick={() =>
                        setCompareMode(compareMode === "userPhoto" ? "none" : "userPhoto")
                      }
                    >
                      <Columns2 size={15} />
                      {compareMode === "userPhoto" ? "Xem ảnh lớn" : "So với ảnh bạn"}
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${styles.aiToolBtn} ${compareMode === "2d" ? styles.aiToolBtnPrimary : ""}`}
                    onClick={() => setCompareMode(compareMode === "2d" ? "none" : "2d")}
                  >
                    <Columns2 size={15} />
                    {compareMode === "2d" ? "Xem ảnh lớn" : "So với bản 2D"}
                  </button>
                  <button
                    type="button"
                    className={styles.aiToolBtn}
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    <RefreshCw size={14} /> Thử lại
                  </button>
                </div>
                <button
                  type="button"
                  className={`${styles.aiToolBtn} ${styles.aiToolBtnPrimary}`}
                  onClick={handleDownloadImage}
                >
                  <ArrowDownToLine size={15} /> Tải ảnh về
                </button>
              </div>

              {isFallback && (
                <p
                  style={{
                    fontSize: "10px",
                    color: "#888f7b",
                    marginTop: "8px",
                    lineHeight: 1.6,
                    textAlign: "center",
                  }}
                >
                  💡 <em>Đang hiển thị ảnh người mẫu thực tế tiêu chuẩn kèm bản giám tuyển từ Gemini 3.8 Flash. Bạn có thể kích hoạt khóa trả phí Google AI Studio để trải nghiệm tính năng sinh ảnh trực tiếp từ AI nano-banana.</em>
                </p>
              )}
            </div>
          ) : (
            <div className={styles.noSample}>
              <Sparkles size={38} />
              <h3>Sẵn sàng tái hiện ngoài đời thực</h3>
              <p>
                Bản phối với <strong>{garment.name}</strong>, sắc <strong>{primaryColor.name}</strong>{" "}
                và phụ kiện đi kèm đã sẵn sàng. Hãy bấm nút <strong>Tạo hình người thật</strong> hoặc{" "}
                <strong>Mặc thử lên ảnh</strong> ở bên trái để chiêm ngưỡng tác phẩm sống động!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preset Chips */}
      <div className={styles.samplePresets}>
        <p className={styles.eyebrow}>HOẶC KHÁM PHÁ CÁC BẢN PHỐI CẢM HỨNG CÓ SẴN</p>
        <div>
          {PRESETS.map((sample) => (
            <button
              className={styles.presetChip}
              key={sample.id}
              type="button"
              aria-pressed={sample.id === preset?.id}
              onClick={() => {
                onApply(sample.config);
                if (mode === "samples") {
                  setLoadedImage(null);
                  setFailedImage(null);
                }
              }}
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
