import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/server/auth";
import { handleApi, protectOrigin, readBody } from "@/server/http";
import { authRequestSchema } from "@/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authResponse(response: Response): Promise<Response> {
  if (response.status < 400) return response;
  const body = (await response.json().catch(() => ({}))) as { code?: string };
  const messages: Record<string, string> = {
    INVALID_EMAIL_OR_PASSWORD: "Email hoặc mật khẩu chưa đúng.",
    USER_ALREADY_EXISTS: "Email này đã được đăng ký. Bạn hãy đăng nhập nhé.",
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Email này đã được đăng ký. Bạn hãy đăng nhập nhé.",
    INVALID_EMAIL: "Địa chỉ email chưa hợp lệ.",
    PASSWORD_TOO_SHORT: "Mật khẩu cần ít nhất 8 ký tự.",
    PASSWORD_TOO_LONG: "Mật khẩu không được vượt quá 128 ký tự.",
  };
  const message =
    response.status === 429
      ? "Bạn thao tác hơi nhanh. Hãy đợi một chút rồi thử lại."
      : (messages[body.code ?? ""] ??
        "Chưa thể hoàn tất đăng nhập. Hãy kiểm tra thông tin và thử lại.");
  // Keep Better Auth's message/code contract while also exposing the app error field.
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  return Response.json(
    { error: message, message, ...(body.code ? { code: body.code } : {}) },
    { status: response.status, headers },
  );
}

export async function GET(request: Request) {
  return handleApi(async () => authResponse(await toNextJsHandler(getAuth()).GET(request)));
}

export async function POST(request: Request) {
  return handleApi(async () => {
    protectOrigin(request);
    const body = await readBody(request, authRequestSchema, 8 * 1024);
    const headers = new Headers(request.headers);
    headers.delete("content-length");
    const boundedRequest = new Request(request.url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: request.signal,
    });
    return authResponse(await toNextJsHandler(getAuth()).POST(boundedRequest));
  });
}
