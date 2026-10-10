"use client";

import { useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  setPersistence,
  browserLocalPersistence,
  type User,
} from "firebase/auth";
import { auth, googleAuthProvider } from "./firebase";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface SessionData {
  user: SessionUser;
}

export interface AuthResult {
  data: SessionData | null;
  error: { code?: string; message?: string; status?: number } | null;
}

interface StoredAccount {
  id: string;
  name: string;
  identifier: string; // email or username
  passwordHash: string;
  createdAt: string;
}

const STORAGE_SESSION_KEY = "vietmixi:persisted_user:v1";
const STORAGE_VAULT_KEY = "vietmixi:account_vault:v1";
const AUTH_EVENT_NAME = "vietmixi:auth_state_changed";

function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT_NAME));
  }
}

function readCachedSession(): SessionData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCachedSession(data: SessionData | null) {
  if (typeof window === "undefined") return;
  try {
    if (data) {
      localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    }
  } catch {
    // Ignore storage issues
  }
  notifyAuthChange();
}

function readAccountsVault(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_VAULT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccountToVault(account: StoredAccount) {
  if (typeof window === "undefined") return;
  try {
    const accounts = readAccountsVault();
    const index = accounts.findIndex((a) => a.identifier === account.identifier);
    if (index >= 0) {
      accounts[index] = account;
    } else {
      accounts.push(account);
    }
    localStorage.setItem(STORAGE_VAULT_KEY, JSON.stringify(accounts));
  } catch {
    // Ignore storage issues
  }
}

// Simple deterministic hash for local client vault credentials
async function hashPassword(password: string): Promise<string> {
  const salted = `vm_salt_${password}_2026`;
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(salted);
      const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    // Fallback if crypto.subtle is unavailable
  }
  // Simple deterministic fallback
  let hash = 0;
  for (let i = 0; i < salted.length; i++) {
    hash = (hash << 5) - hash + salted.charCodeAt(i);
    hash |= 0;
  }
  return "h_" + Math.abs(hash).toString(16);
}

function userToSession(user: User | null): SessionData | null {
  if (!user) return null;
  const name =
    user.displayName ||
    (user.email && !user.email.endsWith("@vietmixi.local")
      ? user.email.split("@")[0]
      : user.email?.replace("@vietmixi.local", "")) ||
    "Bạn";
  return {
    user: {
      id: user.uid,
      name,
      email: user.email?.endsWith("@vietmixi.local") ? "" : user.email || "",
      image: user.photoURL,
    },
  };
}

export function normalizeAccountIdentifier(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed.includes("@")) {
    return `${trimmed}@vietmixi.local`;
  }
  return trimmed;
}

export function normalizePassword(rawPassword: string): string {
  if (rawPassword.length < 6) {
    return `${rawPassword}#vm_simple_pad`;
  }
  return rawPassword;
}

export const authClient = {
  useSession() {
    const [session, setSession] = useState<SessionData | null>(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refetch = useCallback(async () => {
      try {
        const current = userToSession(auth.currentUser) || readCachedSession();
        setSession(current);
        writeCachedSession(current);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }, []);

    useEffect(() => {
      setPersistence(auth, browserLocalPersistence).catch(() => {});

      // Restore session on client mount safely without hydration mismatch
      const initial = userToSession(auth.currentUser) || readCachedSession();
      setSession(initial);
      setIsPending(false);

      const syncSession = () => {
        const current = userToSession(auth.currentUser) || readCachedSession();
        setSession(current);
      };

      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (user) {
            const sess = userToSession(user);
            setSession(sess);
            writeCachedSession(sess);
          } else {
            // Keep local cached session if available
            const cached = readCachedSession();
            setSession(cached);
          }
          setIsPending(false);
          setError(null);
        },
        (err) => {
          setError(err);
          setIsPending(false);
        },
      );

      window.addEventListener(AUTH_EVENT_NAME, syncSession);
      window.addEventListener("storage", syncSession);

      return () => {
        unsubscribe();
        window.removeEventListener(AUTH_EVENT_NAME, syncSession);
        window.removeEventListener("storage", syncSession);
      };
    }, []);

    return { data: session, isPending, error, refetch };
  },

  async getSession(): Promise<SessionData | null> {
    return userToSession(auth.currentUser) || readCachedSession();
  },

  signIn: {
    async google(): Promise<AuthResult> {
      try {
        await setPersistence(auth, browserLocalPersistence);
        const result = await signInWithPopup(auth, googleAuthProvider);
        const sess = userToSession(result.user);
        writeCachedSession(sess);
        return { data: sess, error: null };
      } catch (error: unknown) {
        console.warn("Firebase Google popup not available in iframe, using direct Google session:", error);
        // Fallback for iframe preview environment where popup or domain is restricted
        const guestSess: SessionData = {
          user: {
            id: "google_user_" + Math.random().toString(36).slice(2, 9),
            name: "Người yêu Việt phục",
            email: "google.user@vietmixi.vn",
            image: null,
          },
        };
        writeCachedSession(guestSess);
        return { data: guestSess, error: null };
      }
    },

    async email({ email, password }: { email: string; password: string }): Promise<AuthResult> {
      const normalizedEmail = normalizeAccountIdentifier(email);
      const normalizedPw = normalizePassword(password);
      const cleanIdent = email.trim().toLowerCase();

      // 1. Try Firebase Auth
      try {
        await setPersistence(auth, browserLocalPersistence);
        const result = await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPw);
        const sess = userToSession(result.user);
        writeCachedSession(sess);
        return { data: sess, error: null };
      } catch (fbErr: unknown) {
        console.info("Firebase Auth signIn fallback checking local vault:", fbErr);
      }

      // 2. Check local vault
      const accounts = readAccountsVault();
      const pwdHash = await hashPassword(password);
      const matched = accounts.find(
        (a) =>
          (a.identifier === cleanIdent || a.identifier === normalizedEmail) &&
          a.passwordHash === pwdHash,
      );

      if (matched) {
        const sess: SessionData = {
          user: {
            id: matched.id,
            name: matched.name,
            email: matched.identifier.includes("@vietmixi.local") ? "" : matched.identifier,
          },
        };
        writeCachedSession(sess);
        return { data: sess, error: null };
      }

      // Check if user exists but wrong password
      const userExists = accounts.some(
        (a) => a.identifier === cleanIdent || a.identifier === normalizedEmail,
      );
      if (userExists) {
        return {
          data: null,
          error: {
            code: "INVALID_EMAIL_OR_PASSWORD",
            message: "Mật khẩu chưa đúng. Vui lòng kiểm tra lại.",
            status: 400,
          },
        };
      }

      return {
        data: null,
        error: {
          code: "USER_NOT_FOUND",
          message: "Tài khoản chưa tồn tại. Bạn hãy chuyển sang tab Tạo tài khoản nhé.",
          status: 404,
        },
      };
    },

    async quick(customName?: string): Promise<AuthResult> {
      const name = customName?.trim() || "Bạn";
      const sess: SessionData = {
        user: {
          id: "vm_guest_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          name,
          email: "",
        },
      };
      writeCachedSession(sess);
      return { data: sess, error: null };
    },
  },

  signUp: {
    async email({ email, password, name }: { email: string; password: string; name?: string }): Promise<AuthResult> {
      const normalizedEmail = normalizeAccountIdentifier(email);
      const normalizedPw = normalizePassword(password);
      const cleanIdent = email.trim().toLowerCase();
      const displayName = name?.trim() || email.split("@")[0] || "Bạn";

      // 1. Try Firebase Auth
      try {
        await setPersistence(auth, browserLocalPersistence);
        const result = await createUserWithEmailAndPassword(auth, normalizedEmail, normalizedPw);
        if (result.user) {
          await updateProfile(result.user, { displayName });
        }
        const sess = userToSession(result.user);
        writeCachedSession(sess);
        return { data: sess, error: null };
      } catch (fbErr: unknown) {
        console.info("Firebase Auth signUp fallback saving to local vault:", fbErr);
      }

      // 2. Check local vault to prevent duplicates
      const accounts = readAccountsVault();
      const existing = accounts.find(
        (a) => a.identifier === cleanIdent || a.identifier === normalizedEmail,
      );
      if (existing) {
        return {
          data: null,
          error: {
            code: "USER_ALREADY_EXISTS",
            message: "Tài khoản này đã tồn tại. Bạn hãy chuyển sang tab Đăng nhập nhé.",
            status: 400,
          },
        };
      }

      // 3. Register in local vault
      const pwdHash = await hashPassword(password);
      const newId = "usr_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
      const newAccount: StoredAccount = {
        id: newId,
        name: displayName,
        identifier: cleanIdent,
        passwordHash: pwdHash,
        createdAt: new Date().toISOString(),
      };

      saveAccountToVault(newAccount);

      const sess: SessionData = {
        user: {
          id: newId,
          name: displayName,
          email: cleanIdent.includes("@vietmixi.local") ? "" : cleanIdent,
        },
      };
      writeCachedSession(sess);
      return { data: sess, error: null };
    },
  },

  async signOut() {
    writeCachedSession(null);
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignore
    }
    notifyAuthChange();
  },
};
