"use client";

import { auth } from "./firebase";
import { authClient } from "./auth-client";
import * as firestoreStore from "./firestore-store";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const parsedUrl = new URL(url, "http://localhost:3000");
  const pathname = parsedUrl.pathname;
  const session = await authClient.getSession();
  const userId = auth.currentUser?.uid || session?.user?.id;

  // Intercept looks and lookbooks API routes to use Firebase Firestore
  if (pathname === "/api/looks" || pathname.startsWith("/api/looks/")) {
    if (!userId) {
      throw new ApiError("Đăng nhập để lưu và quản lý tủ đồ của bạn.", 401, "UNAUTHORIZED");
    }
    const id = pathname === "/api/looks" ? null : decodeURIComponent(pathname.replace("/api/looks/", ""));
    const body = options.body ? JSON.parse(options.body as string) : {};

    try {
      if (!id) {
        if (method === "GET") {
          const looks = await firestoreStore.listLooks(userId);
          return { looks } as T;
        }
        if (method === "POST") {
          const look = await firestoreStore.createLook(userId, body);
          return { look } as T;
        }
      } else {
        if (method === "GET") {
          const look = await firestoreStore.getLook(userId, id);
          return { look } as T;
        }
        if (method === "PATCH" || method === "PUT") {
          const look = await firestoreStore.updateLook(userId, id, body);
          return { look } as T;
        }
        if (method === "DELETE") {
          await firestoreStore.deleteLook(userId, id);
          return { ok: true } as T;
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể thực hiện thao tác trên Firestore.";
      throw new ApiError(message, 500);
    }
  }

  if (pathname === "/api/lookbooks" || pathname.startsWith("/api/lookbooks/")) {
    if (!userId) {
      throw new ApiError("Đăng nhập để lưu và quản lý tủ đồ của bạn.", 401, "UNAUTHORIZED");
    }
    const id = pathname === "/api/lookbooks" ? null : decodeURIComponent(pathname.replace("/api/lookbooks/", ""));
    const body = options.body ? JSON.parse(options.body as string) : {};

    try {
      if (!id) {
        if (method === "GET") {
          const lookbooks = await firestoreStore.listLookbooks(userId);
          return { lookbooks } as T;
        }
        if (method === "POST") {
          const lookbook = await firestoreStore.createLookbook(userId, body);
          return { lookbook } as T;
        }
      } else {
        if (method === "GET") {
          const lookbook = await firestoreStore.getLookbook(userId, id);
          return { lookbook } as T;
        }
        if (method === "PATCH" || method === "PUT") {
          const lookbook = await firestoreStore.updateLookbook(userId, id, body);
          return { lookbook } as T;
        }
        if (method === "DELETE") {
          await firestoreStore.deleteLookbook(userId, id);
          return { ok: true } as T;
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể thực hiện thao tác trên Firestore.";
      throw new ApiError(message, 500);
    }
  }

  if (pathname === "/api/shares") {
    if (!userId) {
      throw new ApiError("Đăng nhập để chia sẻ bộ phối hoặc lookbook.", 401, "UNAUTHORIZED");
    }
    const body = options.body ? JSON.parse(options.body as string) : {};
    try {
      const token = await firestoreStore.setSharing(userId, body);
      return { token } as T;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể cập nhật liên kết chia sẻ.";
      throw new ApiError(message, 500);
    }
  }

  // Fallback to network fetch for any other route
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new ApiError("Không thể kết nối. Bộ phối của bạn vẫn được giữ lại, hãy thử lại nhé.", 0);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok)
    throw new ApiError(
      data?.error || "Chưa thể hoàn thành thao tác. Vui lòng thử lại.",
      response.status,
      data?.code,
    );
  return data as T;
}
