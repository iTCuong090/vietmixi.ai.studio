import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { getDb } from "./db";
import { getAuthEnvironment, getTrustedProxies } from "./env";
import * as schema from "./schema";

function createAuth() {
  const { secret, baseURL } = getAuthEnvironment();
  const trustedProxies = getTrustedProxies();
  return betterAuth({
    appName: "Việt Mixi",
    baseURL,
    secret,
    trustedOrigins: [baseURL],
    database: drizzleAdapter(getDb(), { provider: "pg", schema, transaction: true }),
    logger: { disabled: true },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: { enabled: false },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 10, max: 3 },
        "/sign-up/email": { window: 60, max: 5 },
      },
    },
    advanced: {
      ipAddress: {
        ipAddressHeaders: trustedProxies.length ? ["x-forwarded-for"] : ["x-real-ip"],
        ...(trustedProxies.length ? { trustedProxies } : {}),
      },
    },
  });
}

type Auth = ReturnType<typeof createAuth>;
const shared = globalThis as typeof globalThis & { vietmixiAuth?: Auth };
export function getAuth(): Auth {
  return (shared.vietmixiAuth ??= createAuth());
}
