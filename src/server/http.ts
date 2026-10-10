import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { z } from "zod";
import { getAuth } from "./auth";
import { getDb } from "./db";
import { getAppOrigin } from "./env";
import { HttpError } from "./errors";
import { assertOrigin } from "./policies";
import { rateLimit } from "./schema";

export async function readBody<T>(
  request: Request,
  validator: z.ZodType<T>,
  maxBytes = 64 * 1024,
): Promise<T> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new HttpError(415, "Vui lòng gửi dữ liệu JSON.");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Chưa có dữ liệu gửi lên.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) {
        await reader.cancel();
        throw new HttpError(413, "Dữ liệu gửi lên quá lớn.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const data = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    data.set(chunk, offset);
    offset += chunk.length;
  }
  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder().decode(data));
  } catch {
    throw new HttpError(400, "Dữ liệu JSON không hợp lệ.");
  }
  return validator.parse(body);
}

export function protectOrigin(request: Request): void {
  assertOrigin(request.headers.get("origin"), getAppOrigin());
}

export async function requireUser(request: Request, mutation = false) {
  if (mutation) protectOrigin(request);
  const current = await getAuth().api.getSession({ headers: request.headers });
  if (!current)
    throw new HttpError(401, "Đăng nhập để lưu và quản lý tủ đồ của bạn.", "UNAUTHORIZED");
  if (mutation) await limitWrites(current.user.id);
  return { id: current.user.id, name: current.user.name };
}

async function limitWrites(userId: string) {
  const now = Date.now();
  const cutoff = now - 60_000;
  const [bucket] = await getDb()
    .insert(rateLimit)
    .values({
      id: randomUUID(),
      key: `vietmixi-write:${userId}`,
      count: 1,
      lastRequest: now,
    })
    .onConflictDoUpdate({
      target: rateLimit.key,
      set: {
        count: sql`CASE WHEN ${rateLimit.lastRequest} < ${cutoff} THEN 1 ELSE ${rateLimit.count} + 1 END`,
        lastRequest: sql`CASE WHEN ${rateLimit.lastRequest} < ${cutoff} THEN ${now} ELSE ${rateLimit.lastRequest} END`,
      },
    })
    .returning({ count: rateLimit.count });
  if (bucket.count > 60)
    throw new HttpError(429, "Bạn thao tác hơi nhanh. Hãy thử lại sau một phút.", "RATE_LIMITED");
}

function errorResponse(error: unknown): Response {
  if (error instanceof HttpError)
    return Response.json(
      { error: error.message, ...(error.code ? { code: error.code } : {}) },
      { status: error.status },
    );
  if (error instanceof z.ZodError)
    return Response.json(
      {
        error: "Dữ liệu chưa hợp lệ. Hãy kiểm tra tên và các lựa chọn phối đồ.",
        code: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  let cause = error;
  let code = "";
  for (let depth = 0; depth < 4 && cause && typeof cause === "object"; depth++) {
    if ("code" in cause && typeof cause.code === "string") code = cause.code;
    cause = "cause" in cause ? cause.cause : null;
  }
  if (["23505", "23503", "40001", "40P01"].includes(code)) {
    return Response.json(
      { error: "Nội dung vừa thay đổi. Hãy tải lại và thử lưu lần nữa.", code: "CONFLICT" },
      { status: 409 },
    );
  }
  const unavailable =
    /^(08|53|57)/.test(code) ||
    [
      "42P01",
      "3F000",
      "ENOTFOUND",
      "ECONNREFUSED",
      "ECONNRESET",
      "CONNECT_TIMEOUT",
      "ETIMEDOUT",
    ].includes(code) ||
    (error instanceof Error &&
      /(?:Missing|Invalid) server configuration|BETTER_AUTH_SECRET/.test(error.message));
  // Never send SQL, connection strings, authentication secrets or raw exceptions.
  return Response.json(
    {
      error: unavailable
        ? "Chưa thể kết nối dịch vụ lưu trữ. Bộ phối hiện tại của bạn vẫn ở đây; hãy thử lại sau."
        : "Chưa thể hoàn tất thao tác. Hãy thử lại sau nhé.",
      code: unavailable ? "SERVICE_UNAVAILABLE" : "INTERNAL_ERROR",
    },
    { status: unavailable ? 503 : 500 },
  );
}

export async function handleApi(
  action: () => Promise<unknown>,
  successStatus = 200,
): Promise<Response> {
  let response: Response;
  try {
    const result = await action();
    response =
      result instanceof Response ? result : Response.json(result, { status: successStatus });
  } catch (error) {
    response = errorResponse(error);
  }
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Vary", "Cookie, Origin");
  if (response.status === 429 && !response.headers.has("Retry-After"))
    response.headers.set("Retry-After", "60");
  return response;
}
