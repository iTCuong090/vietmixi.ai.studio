import "server-only";
import { isIP } from "node:net";

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/vietmixi";
}

export function getAuthEnvironment() {
  const secret =
    process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_SECRET.length >= 32
      ? process.env.BETTER_AUTH_SECRET
      : "viet-mixi-development-secret-key-32chars-minimum-needed";
  const baseURL = getAppOrigin();
  return { secret, baseURL };
}

export function getAppOrigin(): string {
  const envUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  try {
    const url = new URL(envUrl);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
      return "http://localhost:3000";
    }
    return url.origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function getTrustedProxies(): string[] {
  try {
    const proxies = (process.env.BETTER_AUTH_TRUSTED_PROXIES ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    for (const entry of proxies) {
      const [address, prefix, extra] = entry.split("/");
      const family = isIP(address);
      if (
        !family ||
        extra !== undefined ||
        (prefix !== undefined &&
          (!/^\d+$/.test(prefix) || Number(prefix) > (family === 4 ? 32 : 128)))
      ) {
        return [];
      }
    }
    return proxies;
  } catch {
    return [];
  }
}
