"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Dialog } from "./dialog";

export function AuthDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  async function handleGoogle() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await authClient.signIn.google();
      if (result.error) {
        setError(result.error.message || "Chưa thể đăng nhập bằng Google.");
      } else {
        onClose();
        onSuccess?.();
      }
    } catch {
      setError("Chưa thể kết nối dịch vụ đăng nhập. Hãy thử lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const email = String(data.get("email")).trim();
      const password = String(data.get("password"));
      const name = data.get("name") ? String(data.get("name")).trim() : undefined;

      if (!email || !password) {
        setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
        setBusy(false);
        return;
      }

      const result =
        mode === "register"
          ? await authClient.signUp.email({ email, password, name })
          : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(
          result.error.message ||
            (mode === "register"
              ? "Chưa thể tạo tài khoản lúc này. Hãy thử lại sau nhé."
              : "Tên đăng nhập hoặc mật khẩu chưa đúng. Vui lòng kiểm tra lại."),
        );
      } else {
        onClose();
        onSuccess?.();
      }
    } catch {
      setError("Chưa thể kết nối máy chủ. Hãy thử lại sau nhé.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={mode === "login" ? "Mừng bạn trở lại với Việt Mixi" : "Một góc riêng cho gu của bạn"}
    >
      <p className="text-muted auth-intro" style={{ marginBottom: "1.2rem" }}>
        {mode === "login"
          ? "Đăng nhập để lưu những bộ phối bạn yêu thích, sắp xếp lookbook và chia sẻ gu Việt."
          : "Tạo tài khoản Việt Mixi để quản lý tủ đồ cá nhân, lưu giữ câu chuyện và mở khóa lookbook."}
      </p>

      {/* Segmented Mode Selector */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--line)",
          marginBottom: "1.4rem",
          gap: "10px",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
          }}
          style={{
            flex: 1,
            padding: "9px 0",
            background: "transparent",
            border: "0",
            borderBottom: mode === "login" ? "2px solid var(--ink)" : "2px solid transparent",
            color: mode === "login" ? "var(--ink)" : "var(--muted)",
            fontWeight: mode === "login" ? 600 : 400,
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError("");
          }}
          style={{
            flex: 1,
            padding: "9px 0",
            background: "transparent",
            border: "0",
            borderBottom: mode === "register" ? "2px solid var(--ink)" : "2px solid transparent",
            color: mode === "register" ? "var(--ink)" : "var(--muted)",
            fontWeight: mode === "register" ? 600 : 400,
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Tạo tài khoản mới
        </button>
      </div>

      <form onSubmit={submit} className="form-stack">
        {mode === "register" && (
          <label className="field">
            Tên hiển thị của bạn
            <input
              name="name"
              autoComplete="name"
              required
              minLength={1}
              maxLength={60}
              placeholder="Ví dụ: Tuấn Anh, Thu Hà…"
            />
          </label>
        )}
        <label className="field">
          Tên đăng nhập hoặc Email
          <input
            name="email"
            type="text"
            autoComplete="username"
            required
            maxLength={254}
            placeholder="Ví dụ: vietan hoặc ban@example.com"
          />
        </label>
        <label className="field">
          Mật khẩu
          <div className="password-field">
            <input
              name="password"
              type={visible ? "text" : "password"}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={1}
              maxLength={128}
              placeholder="Mật khẩu của bạn"
            />
            <button
              type="button"
              aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              onClick={() => setVisible(!visible)}
            >
              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>

        {error && (
          <p className="notice notice-error" role="alert" style={{ margin: "0.5rem 0" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className="button button-primary full-width"
          disabled={busy}
          style={{ marginTop: "0.5rem" }}
        >
          {busy ? (
            <LoaderCircle className="spin" size={18} />
          ) : (
            <>
              {mode === "login" ? "Đăng nhập ngay" : "Tạo tài khoản ngay"}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div
        style={{
          textAlign: "center",
          margin: "1.2rem 0 0.9rem",
          fontSize: "11px",
          color: "var(--muted)",
          position: "relative",
        }}
      >
        <span>— hoặc —</span>
      </div>

      <button
        type="button"
        className="button button-secondary full-width"
        onClick={handleGoogle}
        disabled={busy}
        style={{ marginBottom: "0.8rem" }}
      >
        <Sparkles size={16} /> Tiếp tục bằng tài khoản Google
      </button>

      <p className="fine-print" style={{ textAlign: "center", marginTop: "0.8rem" }}>
        Tài khoản được lưu an toàn và tự động duy trì trên thiết bị này.
      </p>
    </Dialog>
  );
}
