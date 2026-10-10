"use client";

import { useState, useSyncExternalStore } from "react";
import { Check, Copy, ExternalLink, Globe2, Link2, LoaderCircle, LockKeyhole } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { slugify } from "@/lib/slug";
import { AuthDialog } from "./auth-dialog";
import { Dialog } from "./dialog";

function subscribeOrigin() {
  return () => {};
}

function getClientOrigin() {
  return typeof window !== "undefined" ? window.location.origin : "";
}

function getServerOrigin() {
  return "";
}

interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  kind: "look" | "lookbook";
  targetId: string;
  name: string;
  initialToken?: string | null;
  onChanged?: (token: string | null) => void;
}

export function ShareDialog(props: ShareDialogProps) {
  if (!props.open) return null;
  return <SharingControls key={`${props.kind}-${props.targetId}`} {...props} />;
}

function SharingControls({
  open,
  onClose,
  kind,
  targetId,
  name,
  initialToken,
  onChanged,
}: ShareDialogProps) {
  const [token, setToken] = useState(initialToken ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const origin = useSyncExternalStore(subscribeOrigin, getClientOrigin, getServerOrigin);

  const slug = slugify(name);
  const url = token && origin ? `${origin}/lookbook/${slug}/${token}` : "";

  async function change(enabled: boolean) {
    if (busy) return;
    setBusy(true);
    setError("");
    setCopied(false);
    try {
      const result = await api<{ token: string | null }>("/api/shares", {
        method: "POST",
        body: JSON.stringify({ kind, targetId, enabled }),
      });
      setToken(result.token);
      setConfirmRevoke(false);
      onChanged?.(result.token);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Chưa thể cập nhật chia sẻ. Hãy thử lại.");
      if (cause instanceof ApiError && cause.status === 401) setAuthOpen(true);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    setError("");
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError("Chưa thể sao chép tự động. Bạn có thể chọn và sao chép đường dẫn bên dưới.");
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={() => {
          if (!busy) onClose();
        }}
        title="Gửi một chút gu Việt."
      >
        <div className="form-stack">
          <p className="text-muted" style={{ fontSize: 12 }}>
            Chia sẻ {kind === "look" ? "bộ phối" : "lookbook"}{" "}
            <strong style={{ color: "var(--ink)", fontWeight: 500 }}>{name}</strong> với những người
            bạn muốn.
          </p>
          <div className="notice notice-info row" aria-live="polite">
            {token ? (
              <Globe2 size={21} style={{ flexShrink: 0 }} />
            ) : (
              <LockKeyhole size={21} style={{ flexShrink: 0 }} />
            )}
            <span>
              {token
                ? "Đang chia sẻ · Ai có đường dẫn đều xem được."
                : kind === "look"
                  ? "Link riêng đang tắt · Kiểm tra cả các lookbook chứa bộ phối này."
                  : "Riêng tư · Chỉ bạn xem được lookbook này."}
            </span>
          </div>
          <p style={{ fontSize: 11 }}>
            {kind === "lookbook"
              ? "Bật link sẽ cho người xem thấy tất cả bộ phối trong lookbook, kể cả bộ đang tắt link riêng. Thêm hoặc sửa bộ phối sẽ cập nhật nội dung qua link này."
              : "Tắt link riêng không ẩn bộ phối khỏi một lookbook đang chia sẻ. Muốn ngừng mọi quyền xem qua link, hãy gỡ bộ khỏi lookbook đó hoặc tắt link của lookbook."}
          </p>
          <p className="text-muted" style={{ fontSize: 11 }}>
            Người xem có thể remix thành bản sao riêng. Sửa bản gốc cập nhật link đang chia sẻ; bản
            sao người khác đã lưu vẫn thuộc về họ.
          </p>
          {token ? (
            <>
              <label className="field">
                Đường dẫn chia sẻ
                <div className="share-url" style={{ marginTop: 0 }}>
                  <input
                    value={url}
                    readOnly
                    onFocus={(event) => event.currentTarget.select()}
                    aria-label="Đường dẫn chia sẻ"
                  />
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={copy}
                    aria-label={copied ? "Đã sao chép" : "Sao chép đường dẫn"}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </label>
              <a className="text-link" href={url} target="_blank" rel="noreferrer">
                Xem trang đã chia sẻ <ExternalLink size={14} />
              </a>
              {confirmRevoke ? (
                <div className="notice stack">
                  <p>
                    Đường dẫn hiện tại sẽ hết hiệu lực. Bật lại chia sẻ sẽ tạo một đường dẫn mới.
                  </p>
                  <div className="row wrap">
                    <button
                      className="button button-danger button-small"
                      disabled={busy}
                      onClick={() => change(false)}
                    >
                      {busy && <LoaderCircle size={14} className="spin" />}Tắt đường dẫn này
                    </button>
                    <button
                      className="button button-ghost button-small"
                      disabled={busy}
                      onClick={() => setConfirmRevoke(false)}
                    >
                      Giữ chia sẻ
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="button button-secondary"
                  onClick={() => setConfirmRevoke(true)}
                  disabled={busy}
                >
                  <LockKeyhole size={16} />
                  Tắt link chia sẻ
                </button>
              )}
            </>
          ) : (
            <button className="button button-primary" disabled={busy} onClick={() => change(true)}>
              {busy ? <LoaderCircle size={17} className="spin" /> : <Link2 size={17} />}Tạo link
              chia sẻ
            </button>
          )}
          {copied && (
            <p role="status" className="notice">
              Đã sao chép đường dẫn.
            </p>
          )}
          {error && (
            <p className="notice notice-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </Dialog>
      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          setError("Đã đăng nhập. Bạn có thể tiếp tục thao tác chia sẻ.");
        }}
      />
    </>
  );
}
