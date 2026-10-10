"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useReducer, useRef, useState, type CSSProperties } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Columns2,
  ExternalLink,
  Heart,
  Info,
  Layers3,
  LoaderCircle,
  Maximize2,
  Palette,
  Redo2,
  RotateCcw,
  Save,
  Shirt,
  SlidersHorizontal,
  Sparkles,
  Undo2,
  UserRound,
  WandSparkles,
  X,
} from "lucide-react";
import OutfitFigure from "@/components/outfit-figure";
import { Dialog } from "@/components/dialog";
import { AuthDialog } from "@/components/auth-dialog";
import RealLifeDialog from "@/components/real-life-dialog";
import GarmentItemsCatalog, { normalizeHeritage, equippedAccessoryNames, AccessoryPicker, AutoCultureWarning, CultureDemos, StyleStart } from "@/components/garment-items-catalog";
import { api, ApiError } from "@/lib/api";
import {
  ACCESSORIES,
  DEFAULT_OUTFIT,
  EVENTS,
  GARMENTS,
  PALETTE,
  PRESETS,
  REGIONS,
  STYLES,
  WEATHERS,
  getColorAdvice,
  getCulturalNotes,
  recommendOutfit,
  getGarment,
  getPalette,
} from "@/lib/catalog";
import { exportOutfitImage } from "@/lib/export-image";
import type { AccessorySlot, OutfitConfig, SavedLook } from "@/lib/types";
import styles from "./studio.module.css";

interface History {
  past: OutfitConfig[];
  present: OutfitConfig;
  future: OutfitConfig[];
}
type Action = { type: "edit" | "replace"; config: OutfitConfig } | { type: "undo" | "redo" };
const initialHistory: History = { past: [], present: DEFAULT_OUTFIT, future: [] };

function historyReducer(state: History, action: Action): History {
  if (action.type === "edit" || action.type === "replace") action = { ...action, config: normalizeHeritage(action.config) };
  if (action.type === "replace") return { past: [], present: action.config, future: [] };
  if (action.type === "edit") {
    if (JSON.stringify(state.present) === JSON.stringify(action.config)) return state;
    return { past: [...state.past.slice(-49), state.present], present: action.config, future: [] };
  }
  if (action.type === "undo" && state.past.length)
    return {
      past: state.past.slice(0, -1),
      present: state.past[state.past.length - 1],
      future: [state.present, ...state.future],
    };
  if (action.type === "redo" && state.future.length)
    return {
      past: [...state.past, state.present],
      present: state.future[0],
      future: state.future.slice(1),
    };
  return state;
}

function isStoredConfig(value: unknown): value is OutfitConfig {
  if (!value || typeof value !== "object") return false;
  const config = value as Partial<OutfitConfig>;
  return (
    config.version === 1 &&
    GARMENTS.some(({ id }) => id === config.garment) &&
    (config.avatar === "female" || config.avatar === "male") &&
    ["light", "medium", "deep"].includes(config.skinTone ?? "") &&
    PALETTE.some(({ id }) => id === config.primaryColor) &&
    PALETTE.some(({ id }) => id === config.accentColor) &&
    (config.bottom === "trousers" || config.bottom === "skirt") &&
    !!config.accessories &&
    (["head", "hand", "shoes"] as AccessorySlot[]).every((slot) =>
      ACCESSORIES.some((item) => item.slot === slot && item.id === config.accessories?.[slot]),
    ) &&
    EVENTS.some(({ id }) => id === config.event) &&
    WEATHERS.some(({ id }) => id === config.weather) &&
    STYLES.some(({ id }) => id === config.style)
  );
}

function isStoredLook(value: unknown): value is SavedLook {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<SavedLook>;
  return (
    typeof entry.id === "string" &&
    typeof entry.name === "string" &&
    typeof entry.revision === "number" &&
    Number.isInteger(entry.revision) &&
    entry.revision > 0 &&
    isStoredConfig(entry.config) &&
    typeof entry.createdAt === "string" &&
    typeof entry.updatedAt === "string"
  );
}

function readSession(key: string): unknown {
  try {
    return JSON.parse(sessionStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

interface StoredDraft {
  config?: unknown;
  name?: unknown;
  source?: unknown;
  look?: unknown;
  comparison?: { config?: unknown; side?: unknown };
  demoStep?: unknown;
  demoOriginal?: unknown;
}

function messageFrom(reason: unknown) {
  return reason instanceof Error ? reason.message : "Có một chút trục trặc. Bạn thử lại nhé.";
}

export default function Studio() {
  const search = useSearchParams();
  const query = search.toString();
  const [history, dispatch] = useReducer(historyReducer, initialHistory);
  const [historyA, dispatchA] = useReducer(historyReducer, initialHistory);
  const [compare, setCompare] = useState(false);
  const [side, setSide] = useState<"a" | "b">("b");
  const selectedHistory = compare && side === "a" ? historyA : history;
  const selectedDispatch = compare && side === "a" ? dispatchA : dispatch;
  const config = selectedHistory.present;
  const [warningRevision, setWarningRevision] = useState(0);
  const [historical, setHistorical] = useState(search.get("activity") === "history");
  const [name, setName] = useState("Nắng trên vai");
  const [look, setLook] = useState<SavedLook | null>(null);
  const [restored, setRestored] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"wardrobe" | "canvas" | "details">("canvas");
  const [detailsTab, setDetailsTab] = useState<"customize" | "culture">(search.get("focus") === "culture" ? "culture" : "customize");
  const [accessoryView, setAccessoryView] = useState<"suggested" | "all">("suggested");
  const [demoStep, setDemoStep] = useState<number | null>(search.get("demo") === "1" ? 0 : null);
  const demoOriginal = useRef<OutfitConfig | null>(null);
  const [saveSlow, setSaveSlow] = useState(false);
  const [colorSlot, setColorSlot] = useState<"primaryColor" | "accentColor">("primaryColor");
  const [filters, setFilters] = useState({
    region: "all",
    event: DEFAULT_OUTFIT.event,
    style: DEFAULT_OUTFIT.style,
    weather: DEFAULT_OUTFIT.weather,
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [showRealLife, setShowRealLife] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState(name);
  const [saveError, setSaveError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pendingSave = useRef<null | { name: string; config: OutfitConfig; copy: boolean }>(null);
  const pendingLoad = useRef<string | null>(null);
  const initialRestoreDone = useRef(false);
  const restoredSource = useRef<string | null>(null);
  const keepingDraft = useRef(false);
  const draftBase = useRef<SavedLook | null>(null);
  const garment = getGarment(config.garment);

  useEffect(() => {
    let active = true;
    let persistable = false;
    const params = new URLSearchParams(query);
    const replace = (next: OutfitConfig, nextName?: string) => {
      if (!active) return;
      persistable = true;
      dispatch({ type: "replace", config: next });
      if (nextName) setName(nextName);
      setFilters({ region: "all", event: next.event, weather: next.weather, style: next.style });
    };
    async function restore() {
      // Read browser storage after hydration; a cancelled query cannot replace a newer one.
      await Promise.resolve();
      if (!active) return;
      setRestored(false);
      restoredSource.current = null;
      setError("");
      setLook(null);
      setCompare(false);
      setSide("b");
      pendingLoad.current = null;
      keepingDraft.current = false;
      draftBase.current = null;
      const stored = readSession("vietmixi:draft:v1");
      const draft = stored && typeof stored === "object" ? (stored as StoredDraft) : null;
      const navigation = performance.getEntriesByType("navigation")[0] as
        PerformanceNavigationTiming | undefined;
      const documentUrl = navigation ? new URL(navigation.name) : null;
      const actualReload =
        !initialRestoreDone.current &&
        navigation?.type === "reload" &&
        documentUrl?.pathname === "/phong-phoi" &&
        documentUrl.searchParams.toString() === query;
      initialRestoreDone.current = true;
      try {
        if (actualReload && draft?.source === query && isStoredConfig(draft.config)) {
          keepingDraft.current = true;
          if (draft.demoStep === null || (typeof draft.demoStep === "number" && Number.isInteger(draft.demoStep) && draft.demoStep >= 0 && draft.demoStep <= 5)) setDemoStep(draft.demoStep as number | null);
          if (isStoredConfig(draft.demoOriginal)) demoOriginal.current = draft.demoOriginal;
          replace(draft.config, typeof draft.name === "string" ? draft.name : "Bản phối của tôi");
          if (
            isStoredLook(draft.look) &&
            (!params.get("look") || draft.look.id === params.get("look"))
          ) {
            draftBase.current = draft.look;
            setLook(draft.look);
          }
          if (isStoredConfig(draft.comparison?.config)) {
            dispatchA({ type: "replace", config: draft.comparison.config });
            setCompare(true);
            setSide(draft.comparison.side === "a" ? "a" : "b");
          }
          setNotice("Đã khôi phục bản nháp đang phối của bạn.");
          if (!params.get("look")) return;
        }
        if (params.get("remix") === "1") {
          const remix = readSession("vietmixi:remix");
          if (isStoredConfig(remix)) {
            replace(remix, "Bản phối của tôi");
            try {
              sessionStorage.removeItem("vietmixi:remix");
            } catch {
              /* Storage may be disabled. */
            }
            setNotice("Đã mở một bản sao để bạn tự do remix.");
            return;
          }
        }
        const preset = PRESETS.find((item) => item.id === params.get("preset"));
        if (preset) {
          const guided = params.get("guided") === "1";
          const needs = { event: params.get("event") || preset.config.event, style: params.get("style") || preset.config.style, weather: params.get("weather") || preset.config.weather, region: params.get("region") || "all", activity: params.get("activity") || "photo" };
          const suggestion = guided ? recommendOutfit(needs) : null;
          replace(suggestion?.config ?? preset.config, suggestion?.preset.name ?? preset.name);
          setHistorical(needs.activity === "history");
          return;
        }
        const lookId = params.get("look");
        if (lookId) {
          setLoading(true);
          const response = await api<{ look: SavedLook }>(
            `/api/looks/${encodeURIComponent(lookId)}`,
          );
          if (active) {
            setLook(keepingDraft.current ? draftBase.current : response.look);
            if (!keepingDraft.current) replace(response.look.config, response.look.name);
          }
          return;
        }
        persistable = true;
        if (isStoredConfig(draft?.config))
          replace(draft.config, typeof draft.name === "string" ? draft.name : "Bản phối của tôi");
        else if (isStoredConfig(stored)) replace(stored);
      } catch (reason) {
        if (active && params.get("look")) {
          const needsLogin = reason instanceof ApiError && reason.status === 401;
          setError(
            needsLogin
              ? "Đăng nhập để mở bộ phối đã lưu của bạn. Bản phối hiện tại vẫn được giữ lại."
              : messageFrom(reason),
          );
          if (needsLogin) {
            pendingLoad.current = params.get("look");
            setShowAuth(true);
          }
          if (reason instanceof ApiError && reason.status === 404) setLook(null);
        }
      } finally {
        if (active) {
          restoredSource.current = persistable ? query : null;
          setRestored(true);
          setLoading(false);
        }
      }
    }
    void restore();
    return () => {
      active = false;
    };
  }, [query]);

  useEffect(() => {
    if (!restored || restoredSource.current !== query) return;
    try {
      sessionStorage.setItem(
        "vietmixi:draft:v1",
        JSON.stringify({
          config: history.present,
          name,
          source: query,
          look,
          demoStep,
          demoOriginal: demoOriginal.current,
          ...(compare ? { comparison: { config: historyA.present, side } } : {}),
        }),
      );
    } catch {
      /* Draft saving is best effort when storage is unavailable. */
    }
  }, [history.present, historyA.present, name, restored, query, look, compare, side, demoStep]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 6500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!saving) { setSaveSlow(false); return; }
    const timer = window.setTimeout(() => setSaveSlow(true), 8000);
    return () => window.clearTimeout(timer);
  }, [saving]);

  const suggestions = useMemo(
    () =>
      PRESETS.filter(
        (item) =>
          filters.region === "all" ||
          getGarment(item.config.garment).region === filters.region ||
          getGarment(item.config.garment).region === "all",
      )
        .map((item) => ({
          item,
          score:
            Number(item.config.event === filters.event) * 3 +
            Number(item.config.style === filters.style) * 2 +
            Number(item.config.weather === filters.weather),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(({ item }) => item),
    [filters],
  );
  const visibleGarments = GARMENTS.filter(
    (item) => filters.region === "all" || item.region === filters.region || item.region === "all",
  );

  function update(patch: Partial<OutfitConfig>) {
    restoredSource.current = query;
    selectedDispatch({ type: "edit", config: { ...config, ...patch } });
    setSavedId(null);
  }

  function apply(next: OutfitConfig, nextName?: string) {
    setWarningRevision(value => value + 1);
    restoredSource.current = query;
    selectedDispatch({ type: "edit", config: next });
    if (nextName) setName(nextName);
    setFilters(old => ({ ...old, event: next.event, style: next.style, weather: next.weather }));
    setSavedId(null);
    setNotice("Đã áp dụng bản phối. Thêm một chút cá tính của bạn nhé!");
  }

  function selectGarment(item: (typeof GARMENTS)[number]) {
    const preset = PRESETS.find((p) => p.config.garment === item.id);
    if (preset) {
      apply(
        {
          ...preset.config,
          avatar: config.avatar,
          skinTone: config.skinTone,
          event: config.event,
          weather: config.weather,
          style: config.style,
          heritageAccessories: preset.config.heritageAccessories ?? [],
          jewelry:
            item.id === "ao-cham"
              ? { kieng: true, xatich: true, bangles: true }
              : { kieng: false, xatich: false, bangles: false },
        },
        preset.name,
      );
      setNotice(`Đã chuyển sang ${item.name} (${preset.name}). Bạn có thể tùy chỉnh thêm.`);
    } else {
      update({
        garment: item.id,
        heritageAccessories: [],
        jewelry:
          item.id === "ao-cham"
            ? { kieng: true, xatich: true, bangles: true }
            : { kieng: false, xatich: false, bangles: false },
      });
      setNotice(`Đã chọn ${item.name}.`);
    }
  }

  function toggleCompare() {
    if (compare) {
      if (side === "a") dispatch({ type: "edit", config: historyA.present });
      setCompare(false);
      setSide("b");
      setNotice(`Đã giữ bản ${side.toUpperCase()} trong phòng phối.`);
    } else {
      dispatchA({ type: "replace", config: demoStep === 3 && demoOriginal.current ? demoOriginal.current : history.present });
      setCompare(true);
      setSide("b");
      setNotice("Đã tạo hai bản độc lập. Chọn A hoặc B để chỉnh riêng từng bộ.");
      if (demoStep === 3) setDemoStep(4);
    }
  }

  async function exportImage() {
    if (!svgRef.current || exporting) return;
    setExporting(true);
    setError("");
    try {
      await exportOutfitImage(svgRef.current, name);
      setNotice("Đã chuẩn bị thẻ PNG 1080 × 1350 để tải xuống.");
      if (demoStep === 4) setDemoStep(5);
    } catch (reason) {
      setError(messageFrom(reason));
    } finally {
      setExporting(false);
    }
  }

  async function save(
    copy = false,
    snapshot?: { name: string; config: OutfitConfig; copy: boolean },
  ) {
    const attempt = snapshot ?? {
      name: saveName.trim(),
      config,
      copy: copy || (compare && side === "a"),
    };
    if (!attempt.name) {
      setSaveError("Đặt một cái tên cho bộ phối của bạn nhé.");
      return;
    }
    if (saving) return;
    setSaving(true);
    setSaveError("");
    try {
      const updating = look && !attempt.copy;
      const response = await api<{ look: SavedLook }>(
        updating ? `/api/looks/${encodeURIComponent(look.id)}` : "/api/looks",
        {
          method: updating ? "PATCH" : "POST",
          body: JSON.stringify({
            name: attempt.name,
            config: attempt.config,
            ...(updating ? { revision: look.revision } : {}),
          }),
        },
      );
      restoredSource.current = query;
      if (!(compare && side === "a")) setLook(response.look);
      setName(response.look.name);
      setSavedId(response.look.id);
      if (demoStep === 4) setDemoStep(5);
      setShowSave(false);
      setConflict(false);
      pendingSave.current = null;
      setNotice(`Đã lưu “${response.look.name}” vào bộ phối của bạn.`);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 401) {
        pendingSave.current = attempt;
        setShowAuth(true);
      } else if (reason instanceof ApiError && reason.status === 409) {
        setConflict(true);
        setSaveError(
          "Bộ phối này vừa được chỉnh sửa ở nơi khác. Bạn có thể xem bản mới nhất hoặc giữ thay đổi bằng một bản sao.",
        );
      } else setSaveError(messageFrom(reason));
    } finally {
      setSaving(false);
    }
  }

  async function reloadConflict() {
    if (!look) return;
    setSaving(true);
    try {
      const response = await api<{ look: SavedLook }>(`/api/looks/${encodeURIComponent(look.id)}`);
      // Keep the unsaved local version available as comparison A.
      dispatchA({ type: "replace", config: history.present });
      dispatch({ type: "replace", config: response.look.config });
      setCompare(true);
      setSide("b");
      setLook(response.look);
      setName(response.look.name);
      setShowSave(false);
      setConflict(false);
      setNotice("Bản mới nhất ở B. Thay đổi của bạn vẫn được giữ ở A để so sánh hoặc lưu riêng.");
    } catch (reason) {
      setSaveError(messageFrom(reason));
    } finally {
      setSaving(false);
    }
  }

  async function afterAuthentication() {
    setShowAuth(false);
    if (pendingSave.current) {
      await save(pendingSave.current.copy, pendingSave.current);
      return;
    }
    const requestedId = pendingLoad.current;
    if (!requestedId) return;
    setLoading(true);
    try {
      const response = await api<{ look: SavedLook }>(
        `/api/looks/${encodeURIComponent(requestedId)}`,
      );
      restoredSource.current = query;
      setLook(keepingDraft.current ? draftBase.current : response.look);
      if (!keepingDraft.current) {
        dispatch({ type: "replace", config: response.look.config });
        setName(response.look.name);
        setFilters({
          region: "all",
          event: response.look.config.event,
          weather: response.look.config.weather,
          style: response.look.config.style,
        });
      }
      setError("");
      pendingLoad.current = null;
    } catch (reason) {
      setError(messageFrom(reason));
    } finally {
      setLoading(false);
    }
  }

  function runDemoStep() {
    if (demoStep === 0) {
      const result = recommendOutfit({ event: "ky-yeu", style: "elegant", weather: "cool", region: "all", activity: "photo" });
      setCompare(false); setSide("b");
      restoredSource.current = query;
      dispatch({ type: "edit", config: result.config });
      demoOriginal.current = result.config;
      setName("Kỷ yếu · Chất riêng của tôi"); setSavedId(null); setHistorical(false);
      setFilters({ region: "all", event: "ky-yeu", style: "elegant", weather: "cool" });
      setDetailsTab("customize"); setMobilePanel("details"); setDemoStep(1);
    } else if (demoStep === 1) {
      update({ primaryColor: config.primaryColor === "indigo" ? "rose" : "indigo" });
      setDemoStep(2); setMobilePanel("canvas");
    } else if (demoStep === 2) {
      setDetailsTab("culture"); setMobilePanel("details"); setDemoStep(3);
    } else if (demoStep === 3) {
      if (!compare) toggleCompare(); else setDemoStep(4);
      setDetailsTab("customize"); setMobilePanel("canvas");
    } else if (demoStep === 4) {
      setSaveName(name); setSaveError(""); setConflict(false); setShowSave(true);
    } else setDemoStep(null);
  }
  const demoTitles = ["Chọn dịp kỷ yếu", "Thử một màu mới", "Hiểu chiếc áo đang mặc", "Đặt hai bản cạnh nhau", "Giữ lại kết quả", "Bạn đã khám phá xong!"];
  const demoDescriptions = [
    "Bắt đầu bằng gợi ý thật cho chụp kỷ yếu, trời mát và gu thanh lịch. Bộ mẫu sẽ thay bản đang xem; bạn có thể hoàn tác.",
    "Chọn một ô màu bên phải hoặc thử Chàm sâu. Nhân vật đổi ngay khi bạn chọn.",
    "Đọc đặc trưng và nguồn tham khảo. Thẻ Chuyện áo luôn ở cạnh kết quả, kể cả khi bạn đang chỉnh màu.",
    "A giữ màu ban đầu; B giữ màu bạn vừa chọn. Chọn từng bản để chỉnh độc lập.",
    "Lưu vào lookbook sau khi đăng nhập, hoặc tải PNG ngay không cần tài khoản.",
    "Tiếp tục thử phụ kiện, đổi nhu cầu hoặc mở lookbook để tổ chức các bản phối đã lưu.",
  ];

  return (
    <div className={styles.studio} data-demo={demoStep !== null}>
      <div className={styles.pageHeading}>
        <div>
          <Link className={styles.backLink} href="/">
            <ArrowLeft size={14} /> Khám phá Việt Mixi
          </Link>
          <h1>
            Phòng phối <em>của bạn.</em>
          </h1>
          <p>Chọn áo → đổi màu → thêm phụ kiện. Kết quả hiện ngay.</p>
        </div>
        <div className={styles.headingActions}>
          <StyleStart autoOpen={search.get("mode") === "guided" || (!search.has("demo") && !search.has("mode") && !search.has("preset") && !search.has("look") && !search.has("remix"))} onFree={() => setMobilePanel("canvas")} onChoose={(next, nextName, isHistorical) => { apply(next, nextName); setHistorical(isHistorical); setFilters({region:"all",event:next.event,style:next.style,weather:next.weather}); setMobilePanel("canvas"); }} />
          <button type="button" className={styles.helpButton} onClick={() => setShowHelp(true)}>
            <CircleHelp size={17} /> Cách phối
          </button>
          <button
            type="button"
            className={styles.saveButton}
            disabled={loading || !restored}
            onClick={() => {
              setSaveName(name);
              setSaveError("");
              setConflict(false);
              setShowSave(true);
            }}
          >
            <Heart size={17} /> Lưu bộ phối
          </button>
        </div>
      </div>

      {demoStep !== null ? (
        <section className={styles.demoGuide} aria-label="Khám phá demo trong 60 giây">
          <div className={styles.demoGuideTop}><span>KHÁM PHÁ DEMO TRONG 60 GIÂY · {Math.min(demoStep + 1, 5)}/5</span><button type="button" onClick={() => setDemoStep(null)}>{demoStep === 5 ? "Đóng hướng dẫn" : "Bỏ qua"} <X size={14} /></button></div>
          <div className={styles.demoGuideBody}><div aria-live="polite"><strong>{demoTitles[demoStep]}</strong><p>{demoDescriptions[demoStep]}</p></div><button type="button" className={styles.saveButton} disabled={loading || !restored} onClick={runDemoStep}>{["Chọn kỷ yếu", "Thử màu mới", "Đọc chuyện áo", "So sánh A/B", "Lưu kết quả", "Tự khám phá tiếp"][demoStep]} <ArrowRight size={15}/></button></div>
          <ol className={styles.demoProgress} aria-label="Tiến trình demo">{["Kỷ yếu", "Đổi màu", "Chuyện áo", "So sánh A/B", "Lưu kết quả"].map((label, index) => <li key={label} aria-current={demoStep === index ? "step" : undefined} data-done={demoStep > index}>{demoStep > index ? "✓" : index + 1} {label}</li>)}</ol>
        </section>
      ) : <button type="button" className={styles.demoEntry} onClick={() => setDemoStep(0)}><Sparkles size={15}/> Khám phá demo trong 60 giây <ArrowRight size={14}/></button>}

      {(notice || error) && (
        <div
          className={error ? styles.errorBanner : styles.notice}
          role={error ? "alert" : "status"}
        >
          {error ? <Info size={17} /> : <Check size={17} />}
          <span>
            {error || notice}
            {savedId && !error && (
              <>
                {" "}
                <Link href="/lookbook">
                  Mở lookbook <ArrowRight size={13} />
                </Link>
              </>
            )}
          </span>
          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={() => {
              setNotice("");
              setError("");
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}


      {restored && !loading && <AutoCultureWarning key={warningRevision} config={config} historical={historical} onFix={(patch) => update({ ...patch, accessories: { ...config.accessories, ...patch.accessories } })} />}
      <div className={styles.mobileTabs} aria-label="Các phần của phòng phối">
        <button
          type="button"
          aria-pressed={mobilePanel === "wardrobe"}
          onClick={() => setMobilePanel("wardrobe")}
        >
          <Shirt size={17} /> Tủ đồ
        </button>
        <button
          type="button"
          aria-pressed={mobilePanel === "canvas"}
          onClick={() => setMobilePanel("canvas")}
        >
          <UserRound size={17} /> Bản phối
        </button>
        <button
          type="button"
          aria-pressed={mobilePanel === "details"}
          onClick={() => setMobilePanel("details")}
        >
          <SlidersHorizontal size={17} /> Tùy chỉnh
        </button>
      </div>

      <div className={styles.workspace}>
        <aside
          className={styles.wardrobe}
          data-mobile-active={mobilePanel === "wardrobe"}
          aria-label="Tủ trang phục"
        >
          <div className={styles.panelTitle}>
            <span>
              <Shirt size={19} /> 01 · Trang phục
            </span>
            <span className={styles.count}>{String(GARMENTS.length).padStart(2, "0")}</span>
          </div>
          <div className={styles.wardrobeContent}>
            <div className={styles.mobilePreviewHeader}>
              <div className={styles.mobilePreviewThumb}>
                <OutfitFigure config={config} showBackground={false} />
              </div>
              <div className={styles.mobilePreviewInfo}>
                <span className={styles.mobilePreviewBadge}>Bản phối hiện tại</span>
                <strong>{garment.name}</strong>
                <small>{name}</small>
                <button
                  type="button"
                  className={styles.mobilePreviewBtn}
                  onClick={() => setMobilePanel("canvas")}
                >
                  Xem toàn thân <ArrowRight size={13} />
                </button>
              </div>
            </div>
            <label className={styles.selectLabel}>
              Một miền cảm hứng
              <select
                value={filters.region}
                onChange={(event) => setFilters((old) => ({ ...old, region: event.target.value }))}
              >
                {REGIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <div className={styles.garmentList}>
              {visibleGarments.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={config.garment === item.id}
                  className={styles.garmentCard}
                  onClick={() => selectGarment(item)}
                >
                  <span className={styles.garmentMini}>
                    <OutfitFigure
                      config={{
                        ...PRESETS.find((preset) => preset.config.garment === item.id)!.config,
                        avatar: config.avatar,
                      }}
                      showBackground={false}
                    />
                  </span>
                  <span className={styles.garmentCopy}>
                    <span className={styles.itemNumber}>0{GARMENTS.indexOf(item) + 1}</span>
                    <strong>{item.name}</strong>
                    <small>{item.subtitle}</small>
                  </span>
                  <span className={styles.selectionCircle}>
                    {config.garment === item.id && <Check size={11} />}
                  </span>
                </button>
              ))}
            </div>
            <details className={styles.suggestions}>
              <summary>
                <WandSparkles size={17} />
                <span>Tìm cảm hứng phối đồ</span>
                <ChevronDown size={15} />
              </summary>
              <div className={styles.suggestionContent}>
                <label className={styles.selectLabel}>
                  Bạn sắp đi đâu?
                  <select
                    value={filters.event}
                    onChange={(event) =>
                      setFilters((old) => ({ ...old, event: event.target.value }))
                    }
                  >
                    {EVENTS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.selectLabel}>
                  Chất riêng hôm nay
                  <select
                    value={filters.style}
                    onChange={(event) =>
                      setFilters((old) => ({ ...old, style: event.target.value }))
                    }
                  >
                    {STYLES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.selectLabel}>
                  Thời tiết bạn chọn
                  <select
                    value={filters.weather}
                    onChange={(event) =>
                      setFilters((old) => ({ ...old, weather: event.target.value }))
                    }
                  >
                    {WEATHERS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <p className={styles.filterHint}>Bản phối chỉ đổi khi bạn bấm áp dụng.</p>
                {suggestions.map((item) => (
                  <div className={styles.suggestionCard} key={item.id}>
                    <strong>{item.name}</strong>
                    <p>{item.tagline}</p>
                    <button
                      type="button"
                      onClick={() =>
                        apply(
                          {
                            ...item.config,
                            event: filters.event,
                            style: filters.style,
                            weather: filters.weather,
                          },
                          item.name,
                        )
                      }
                    >
                      Áp dụng gợi ý <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </details>
            <div className={styles.wardrobeFootnote}>
              <BookOpen size={17} />
              <p>
                Mỗi tà áo, một câu chuyện.
                <br />
                <button
                  type="button"
                  onClick={() => {
                    setDetailsTab("culture");
                    setMobilePanel("details");
                  }}
                >
                  Khám phá nguồn gốc <ArrowRight size={12} />
                </button>
              </p>
            </div>
          </div>
        </aside>

        <section
          className={styles.canvasPanel}
          data-mobile-active={mobilePanel === "canvas"}
          aria-label="Bản phối trực quan"
        >
          <div className={styles.canvasToolbar}>
            <span className={styles.canvasLabel}>
              <span /> {compare ? `ĐANG CHỈNH BẢN ${side.toUpperCase()}` : "GÓC NHÌN CỦA BẠN"}
            </span>
            <div className={styles.historyActions}>
              <button type="button" className={styles.zoomButton} aria-label="Phóng to bản phối" title="Phóng to bản phối" disabled={loading || !restored} onClick={() => setShowPreview(true)}><Maximize2 size={16}/><span>Phóng to</span></button>
              <span />
              <button
                type="button"
                title="Hoàn tác"
                aria-label="Hoàn tác"
                disabled={!selectedHistory.past.length}
                onClick={() => selectedDispatch({ type: "undo" })}
              >
                <Undo2 size={17} />
              </button>
              <button
                type="button"
                title="Làm lại"
                aria-label="Làm lại"
                disabled={!selectedHistory.future.length}
                onClick={() => selectedDispatch({ type: "redo" })}
              >
                <Redo2 size={17} />
              </button>
              <span />
              <button
                type="button"
                title="Đặt lại bản phối"
                aria-label="Đặt lại bản phối"
                onClick={() => apply(DEFAULT_OUTFIT, "Nắng trên vai")}
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
          <div className={`${styles.figureStage} ${compare ? styles.comparing : ""}`}>
            <div className={styles.stageFloral} aria-hidden="true">
              ✳
            </div>
            {!compare && <button type="button" className={styles.canvasZoomTarget} aria-label="Phóng to bản phối trong popup" title="Bấm để xem bản phóng to" disabled={loading || !restored} onClick={() => setShowPreview(true)}><span><Maximize2 size={14}/> Bấm để phóng to</span></button>}
            {loading && (
              <div className={styles.loadingOverlay}>
                <LoaderCircle size={24} className={styles.spin} /> Đang mở bộ phối…
              </div>
            )}
            {compare ? (
              <div className={styles.compareGrid}>
                {(["a", "b"] as const).map((item) => (
                  <div key={item} className={styles.compareFigure} data-selected={side === item}>
                    <button
                      type="button"
                      className={styles.compareLabel}
                      aria-pressed={side === item}
                      onClick={() => setSide(item)}
                    >
                      <span>{item.toUpperCase()}</span>
                      {side === item ? "Đang chỉnh" : "Chọn để chỉnh"}
                    </button>
                    <button
                      type="button"
                      className={styles.figureSelection}
                      aria-label={`Phóng to bản ${item.toUpperCase()}`}
                      title="Bấm để xem bản phóng to"
                      onClick={() => setShowPreview(true)}
                    >
                      <OutfitFigure
                        config={item === "a" ? historyA.present : history.present}
                        svgRef={side === item ? svgRef : undefined}
                        className={styles.outfitSvg}
                      />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <OutfitFigure config={config} svgRef={svgRef} className={styles.outfitSvg} />
            )}
            <div className={styles.stageCaption}>
              <span>{garment.name}</span>
              <small>
                {getPalette(config.primaryColor).name} · {getPalette(config.accentColor).name}
              </small>
            </div>
            <span className={styles.stageWatermark}>VIỆT MIXI</span>
          </div>
          {compare && <p className={styles.compareExplanation}>Hai bản độc lập · Chọn A hoặc B để chỉnh. Lưu và tải ảnh áp dụng cho bản {side.toUpperCase()} đang chọn.</p>}
          <div className={styles.canvasBottom}>
            <button
              type="button"
              className={styles.compareButton}
              aria-pressed={compare}
              disabled={loading || !restored}
              onClick={toggleCompare}
            >
              <Columns2 size={17} />
              {compare ? `Giữ bản ${side.toUpperCase()}` : "So sánh A/B"}
            </button>
            <button
              type="button"
              className={styles.downloadButton}
              disabled={exporting || loading || !restored}
              onClick={() => void exportImage()}
            >
              {exporting ? (
                <LoaderCircle size={17} className={styles.spin} />
              ) : (
                <ArrowDownToLine size={17} />
              )}
              {exporting ? "Đang tạo ảnh…" : "Tải ảnh PNG"}
            </button>
            <button type="button" className={styles.saveButton} disabled={loading || !restored} onClick={() => { setSaveName(name); setSaveError(""); setConflict(false); setShowSave(true); }}><Heart size={16}/> Lưu</button>
          </div>

        </section>

        <aside
          className={styles.detailPanel}
          data-mobile-active={mobilePanel === "details"}
          aria-label="Tùy chỉnh và thông tin văn hóa"
        >
          <div className={styles.detailTabs}>
            <button
              type="button"
              aria-pressed={detailsTab === "customize"}
              onClick={() => setDetailsTab("customize")}
            >
              <SlidersHorizontal size={16} /> Tùy chỉnh
            </button>
            <button
              type="button"
              aria-pressed={detailsTab === "culture"}
              onClick={() => { setDetailsTab("culture"); if (demoStep === 2) setDemoStep(3); }}
            >
              <BookOpen size={16} /> Chuyện áo
            </button>
          </div>
          <div className={styles.detailsContent}>
            {detailsTab === "customize" ? (
              <>
                <div className={styles.mobilePreviewHeader}>
                  <div className={styles.mobilePreviewThumb}>
                    <OutfitFigure config={config} showBackground={false} />
                  </div>
                  <div className={styles.mobilePreviewInfo}>
                    <span className={styles.mobilePreviewBadge}>Bản phối hiện tại</span>
                    <strong>{garment.name}</strong>
                    <small>{name}</small>
                    <button
                      type="button"
                      className={styles.mobilePreviewBtn}
                      onClick={() => setMobilePanel("canvas")}
                    >
                      Xem toàn thân <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
                <section className={styles.controlSection}>
                  <div className={styles.controlHeading}>
                    <h2>02 · Màu sắc</h2>
                    <Palette size={17} />
                  </div>
                  <div className={styles.colorSlotTabs}>
                    <button
                      type="button"
                      aria-pressed={colorSlot === "primaryColor"}
                      onClick={() => setColorSlot("primaryColor")}
                    >
                      <span style={{ background: getPalette(config.primaryColor).hex }} /> Màu chính
                    </button>
                    <button
                      type="button"
                      aria-pressed={colorSlot === "accentColor"}
                      onClick={() => setColorSlot("accentColor")}
                    >
                      <span style={{ background: getPalette(config.accentColor).hex }} /> Màu phối
                    </button>
                  </div>
                  <div className={styles.palette}>
                    {PALETTE.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-label={item.name}
                        title={item.name}
                        aria-pressed={config[colorSlot] === item.id}
                        style={{ "--swatch": item.hex } as CSSProperties}
                        onClick={() => { update({ [colorSlot]: item.id }); if (demoStep === 1 && config[colorSlot] !== item.id) setDemoStep(2); }}
                      >
                        {config[colorSlot] === item.id && (
                          <Check
                            size={17}
                            style={{
                              color: ["ivory", "sky", "sand", "lavender", "ochre"].includes(item.id)
                                ? "#253f4d"
                                : "#fff",
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className={styles.colorName}>
                    {getPalette(config[colorSlot]).name}
                    <span>12 sắc Việt, vô vàn cách phối</span>
                  </p>
                </section>

          <aside className={styles.cultureSnapshot} aria-label="Chuyện áo tóm tắt">
            <div><BookOpen size={17} /><strong>{garment.name} · Chuyện áo</strong></div>
            <p>{garment.details[0]}</p>
            <p><strong>Dịp đang phối:</strong> {EVENTS.find(item => item.id === config.event)?.name} · {WEATHERS.find(item => item.id === config.weather)?.name}. Gợi ý sáng tạo, không phải quy định mặc.</p>
            <div className={styles.snapshotLinks}><button type="button" onClick={() => { setDetailsTab("culture"); setMobilePanel("details"); if (demoStep === 2) setDemoStep(3); }}>Đọc chuyện áo →</button>{garment.sources[0] && <a href={garment.sources[0].url} target="_blank" rel="noopener noreferrer">Nguồn: {garment.sources[0].title} ↗</a>}</div>
          </aside>

                <section className={styles.controlSection} aria-label="Phụ kiện">
                  <div className={styles.controlHeading}><h2>03 · Phụ kiện</h2><Layers3 size={17} /></div>
                  <p className={styles.equippedSummary}><strong>Đang đeo:</strong> {equippedAccessoryNames(config).join(" · ") || "Chưa chọn phụ kiện"}</p>
                  <p className={styles.filterHint}>Mỗi vị trí giữ một món. Chọn món mới sẽ thay món cùng vị trí.</p>
                  <div className={styles.segmented} aria-label="Nguồn phụ kiện"><button type="button" aria-pressed={accessoryView === "suggested"} onClick={() => setAccessoryView("suggested")}>Gợi ý cho áo này</button><button type="button" aria-pressed={accessoryView === "all"} onClick={() => setAccessoryView("all")}>Tất cả</button></div>
                  {accessoryView === "suggested" ? (<div style={{marginTop:12}}>                  <GarmentItemsCatalog
                    currentGarment={config.garment}
                    currentConfig={config}
                    onApplyPreset={(garmentId) => {
                      const p = PRESETS.find((item) => item.config.garment === garmentId);
                      if (p) apply(p.config, p.name);
                    }}
                    onApplyItem={(patch) => {
                      update({
                        ...patch,
                        accessories: patch.accessories
                          ? { ...config.accessories, ...patch.accessories }
                          : config.accessories,
                        jewelry: patch.jewelry
                          ? { ...config.jewelry, ...patch.jewelry }
                          : config.jewelry,
                        heritageAccessories: patch.heritageAccessories ?? config.heritageAccessories,
                      });
                    }}
                    onSelectGarmentTab={(garmentId) => {
                      const targetGarment = GARMENTS.find((g) => g.id === garmentId);
                      if (targetGarment) {
                        selectGarment(targetGarment);
                      }
                    }}
                  />
</div>) : <AccessoryPicker config={config} onChange={(patch) => update({ ...patch, accessories: { ...config.accessories, ...patch.accessories } })} />}
                  <CultureDemos onApply={(next, nextName) => { apply(next, nextName); setHistorical(false); setMobilePanel("canvas"); }} />
                </section>
                <section className={styles.controlSection}>
                  <div className={styles.controlHeading}>
                    <h2>04 · Nhân vật</h2>
                    <UserRound size={17} />
                  </div>
                  <div className={styles.segmented}>
                    <button
                      type="button"
                      aria-pressed={config.avatar === "female"}
                      onClick={() => update({ avatar: "female" })}
                    >
                      Dáng nữ
                    </button>
                    <button
                      type="button"
                      aria-pressed={config.avatar === "male"}
                      onClick={() => update({ avatar: "male" })}
                    >
                      Dáng nam
                    </button>
                  </div>
                  <div className={styles.skinRow}>
                    <span>Tông da</span>
                    <div>
                      {(
                        [
                          { id: "light", name: "Sáng", hex: "#efd2b4" },
                          { id: "medium", name: "Vừa", hex: "#c58f68" },
                          { id: "deep", name: "Đậm", hex: "#875740" },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          aria-label={`Tông da ${item.name.toLowerCase()}`}
                          title={`Tông da ${item.name.toLowerCase()}`}
                          aria-pressed={config.skinTone === item.id}
                          style={{ background: item.hex }}
                          onClick={() => update({ skinTone: item.id })}
                        >
                          {config.skinTone === item.id && <Check size={12} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section className={styles.controlSection}>
                  <div className={styles.controlHeading}>
                    <h2>Thêm một nét riêng</h2>
                    <Layers3 size={17} />
                  </div>
                  <label className={styles.selectLabel}>
                    Phối bên dưới
                    <select
                      value={config.bottom}
                      onChange={(event) =>
                        update({ bottom: event.target.value as OutfitConfig["bottom"] })
                      }
                    >
                      <option value="trousers">Quần dài</option>
                      <option value="skirt">Váy dài · phối cách điệu</option>
                    </select>
                  </label>
                </section>

                <div className={styles.colorAdvice}>
                  <Sparkles size={17} />
                  <div>
                    <h3>Gợi ý từ Việt Mixi</h3>
                    {getColorAdvice(config).map((text) => (
                      <p key={text}>{text}</p>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.cultureHint}
                  onClick={() => setDetailsTab("culture")}
                >
                  <BookOpen size={18} />
                  <span>
                    Hiểu chiếc áo bạn đang mặc
                    <small>{getCulturalNotes(config).length} lời nhắn về văn hóa</small>
                  </span>
                  <ArrowRight size={15} />
                </button>
              </>
            ) : (
              <>
                <div className={styles.cultureHeading}>
                  <span className={styles.eyebrow}>SAU MỖI TÀ ÁO</span>
                  <h2>{garment.name}</h2>
                  <p>{garment.subtitle}</p>
                </div>
                <p className={styles.origin}>{garment.origin}</p>
                <div className={styles.cultureDetails}>
                  <h3>Dấu ấn nhận diện</h3>
                  {garment.details.map((detail) => (
                    <p key={detail}>
                      <span />
                      {detail}
                    </p>
                  ))}
                </div>
                <div className={styles.sources}>
                  <h3>Đọc thêm từ nguồn tham khảo</h3>
                  {garment.sources.map((source) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.title}
                      <ExternalLink size={13} />
                    </a>
                  ))}
                </div>
                <p className={styles.culturalDisclaimer}>
                  Minh họa sáng tạo, không phải bản phục dựng. Nội dung được tổng hợp từ nguồn tham
                  khảo; chưa có thẩm định chuyên gia riêng cho ứng dụng.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
      <p className={styles.aiUnavailable}><Info size={14}/> Tạo ảnh AI: chưa khả dụng trong bản demo này. Bạn vẫn có thể phối, so sánh và tải ảnh minh họa.</p>
      <div className={styles.studioFooter}>
        <span>
          <Heart size={13} /> Sáng tạo hôm nay, gìn giữ chuyện xưa.
        </span>
        <span>Minh họa lấy cảm hứng từ Việt phục</span>
      </div>

      <OutfitPreviewDialog open={showPreview} onClose={() => setShowPreview(false)} config={config} comparison={compare ? [historyA.present, history.present] : undefined} />

      {showRealLife && (
        <RealLifeDialog
          open
          onClose={() => setShowRealLife(false)}
          config={config}
          onApply={(next) => {
            const preset = PRESETS.find((item) => item.config === next);
            apply(next, preset?.name);
          }}
        />
      )}
      <Dialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Một bản phối, theo cách của bạn"
      >
        <div className={styles.helpSteps}>
          <p>
            <span>01</span>
            <span>
              <strong>Bắt đầu từ một tà áo</strong>Chọn Việt phục ở tủ đồ, hoặc tìm gợi ý theo miền,
              sự kiện và thời tiết.
            </span>
          </p>
          <p>
            <span>02</span>
            <span>
              <strong>Thêm chất riêng</strong>Chọn màu, nhân vật và phụ kiện. So sánh A/B để chỉnh
              hai bộ độc lập.
            </span>
          </p>
          <p>
            <span>03</span>
            <span>
              <strong>Giữ lại cảm hứng</strong>Tải thẻ PNG ngay, hoặc đăng nhập để lưu, xếp lookbook
              và chia sẻ liên kết.
            </span>
          </p>
          <p>
            <span>♡</span>
            <span>
              <strong>Hiểu trước khi remix</strong>Mở “Chuyện áo” để khám phá đặc trưng, nguồn gốc
              và những lưu ý văn hóa.
            </span>
          </p>
        </div>
      </Dialog>
      <Dialog
        open={showSave && !showAuth}
        onClose={() => {
          setShowSave(false);
        }}
        title={
          look && !(compare && side === "a") ? "Lưu lại chút cảm hứng" : "Đặt tên cho chất riêng"
        }
      >
        <form
          className={styles.saveForm}
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
        >
          <p className={styles.dialogIntro}>
            Lưu vào tài khoản để tổ chức trong lookbook (cần đăng nhập). Hoặc tải ảnh PNG ngay, không cần tài khoản.
          </p>
          <label className={styles.selectLabel}>
            Tên bộ phối
            <input
              autoFocus
              maxLength={80}
              value={saveName}
              onChange={(event) => setSaveName(event.target.value)}
              placeholder="Ví dụ: Một chiều xanh ngát"
              required
            />
          </label>
          {look && !(compare && side === "a") && (
            <p className={styles.filterHint}>
              Lưu thay đổi sẽ cập nhật bộ phối trong các lookbook và liên kết đang chia sẻ. Chọn
              “Lưu bản sao” để giữ bản cũ.
            </p>
          )}
          {saving && <p role="status" className={styles.savingStatus}>{saveSlow ? "Đồng bộ đang lâu hơn dự kiến. Chưa nhận được xác nhận lưu; đừng gửi lại để tránh tạo bản trùng. Bạn có thể đóng hộp này và tải PNG trong lúc chờ." : "Đang gửi bộ phối và chờ xác nhận đồng bộ. Bạn có thể đóng hộp này; bản đang phối vẫn được giữ."}</p>}
          {saveError && (
            <p role="alert" className={styles.error}>
              {saveError}
            </p>
          )}
          <div className={styles.saveActions}>
            <button type="button" className={styles.smallButton} disabled={exporting} onClick={() => { setShowSave(false); void exportImage(); }}><ArrowDownToLine size={16}/>{exporting ? "Đang tạo ảnh…" : "Tải PNG · không cần đăng nhập"}</button>
            {conflict ? (
              <>
                <button
                  type="button"
                  className={styles.smallButton}
                  disabled={saving}
                  onClick={() => void reloadConflict()}
                >
                  Xem bản mới nhất
                </button>
                <button
                  type="button"
                  className={styles.saveButton}
                  disabled={saving}
                  onClick={() => void save(true)}
                >
                  Lưu thành bản sao
                </button>
              </>
            ) : (
              <>
                {look && !(compare && side === "a") && (
                  <button
                    type="button"
                    className={styles.smallButton}
                    disabled={saving}
                    onClick={() => void save(true)}
                  >
                    Lưu bản sao
                  </button>
                )}
                <button type="submit" className={styles.saveButton} disabled={saving}>
                  {saving ? <LoaderCircle size={16} className={styles.spin} /> : <Save size={16} />}
                  {saving ? "Đang lưu…" : "Lưu bộ phối"}
                </button>
              </>
            )}
          </div>
        </form>
      </Dialog>
      <AuthDialog
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => void afterAuthentication()}
      />
    </div>
  );
}

/** Read-only, enlarged view; never changes either outfit or export SVG ref. */
function OutfitPreviewDialog({ open, onClose, config, comparison }: {
  open: boolean;
  onClose: () => void;
  config: OutfitConfig;
  comparison?: [OutfitConfig, OutfitConfig];
}) {
  return (
    <Dialog open={open} onClose={onClose} title={comparison ? "So sánh A/B · Phóng to" : "Bản phối · Phóng to"} wide>
      <div className={styles.enlargedPreview}>
        <div className={styles.enlargedStage} data-compare={!!comparison}>
          {(comparison ?? [config]).map((outfit, index) => (
            <figure className={styles.enlargedFigure} key={index}>
              {comparison && <span className={styles.enlargedBadge}>Bản {index === 0 ? "A" : "B"}</span>}
              <OutfitFigure config={outfit} className={styles.enlargedSvg}/>
              <figcaption><strong>{getGarment(outfit.garment).name}</strong><span>{getPalette(outfit.primaryColor).name} · {getPalette(outfit.accentColor).name}</span></figcaption>
            </figure>
          ))}
        </div>
        <p className={styles.previewHint}>Nhấn Esc, nút đóng hoặc bấm bên ngoài để quay lại phối đồ.</p>
      </div>
    </Dialog>
  );
}
