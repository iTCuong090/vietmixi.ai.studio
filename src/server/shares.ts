import "server-only";
import { randomBytes } from "node:crypto";
import { unstable_noStore as noStore } from "next/cache";
import { and, asc, eq } from "drizzle-orm";
import type { PublicShare } from "@/lib/types";
import firebaseConfig from "../../firebase-applet-config.json";
import { getDb } from "./db";
import { notFound } from "./errors";
import { toPublicLook } from "./policies";
import { lookbookItems, lookbooks, looks, shares, user } from "./schema";

function decodeFirestoreValue(val: unknown): unknown {
  if (!val || typeof val !== "object") return val;
  const obj = val as Record<string, unknown>;
  if ("stringValue" in obj) return obj.stringValue;
  if ("integerValue" in obj) return Number(obj.integerValue);
  if ("doubleValue" in obj) return Number(obj.doubleValue);
  if ("booleanValue" in obj) return Boolean(obj.booleanValue);
  if ("timestampValue" in obj) return obj.timestampValue;
  if ("nullValue" in obj) return null;
  if ("mapValue" in obj) {
    const res: Record<string, unknown> = {};
    const mapVal = obj.mapValue as { fields?: Record<string, unknown> } | undefined;
    const fields = mapVal?.fields || {};
    for (const key of Object.keys(fields)) {
      res[key] = decodeFirestoreValue(fields[key]);
    }
    return res;
  }
  if ("arrayValue" in obj) {
    const arrVal = obj.arrayValue as { values?: unknown[] } | undefined;
    const values = arrVal?.values || [];
    return values.map(decodeFirestoreValue);
  }
  return val;
}

export async function setSharing(
  ownerId: string,
  input: { kind: "look" | "lookbook"; targetId: string; enabled: boolean },
): Promise<string | null> {
  return getDb().transaction(async (tx) => {
    // Lock the target so simultaneous enable/revoke requests cannot revive old tokens.
    if (input.kind === "look") {
      const [target] = await tx
        .select({ id: looks.id })
        .from(looks)
        .where(and(eq(looks.id, input.targetId), eq(looks.ownerId, ownerId)))
        .for("update");
      if (!target) notFound();
    } else {
      const [target] = await tx
        .select({ id: lookbooks.id })
        .from(lookbooks)
        .where(and(eq(lookbooks.id, input.targetId), eq(lookbooks.ownerId, ownerId)))
        .for("update");
      if (!target) notFound();
    }
    const targetCondition =
      input.kind === "look"
        ? eq(shares.lookId, input.targetId)
        : eq(shares.lookbookId, input.targetId);
    const condition = and(targetCondition, eq(shares.ownerId, ownerId));
    if (!input.enabled) {
      await tx.delete(shares).where(condition);
      return null;
    }
    const [existing] = await tx.select({ token: shares.token }).from(shares).where(condition);
    if (existing) return existing.token;
    const token = randomBytes(32).toString("base64url");
    await tx.insert(shares).values({
      ownerId,
      token,
      lookId: input.kind === "look" ? input.targetId : null,
      lookbookId: input.kind === "lookbook" ? input.targetId : null,
    });
    return token;
  });
}

export async function getPublicShare(token: string): Promise<PublicShare | null> {
  noStore();
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(token)) return null;

  // First query Firestore REST API
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firebaseConfig.firestoreDatabaseId}/documents/shares/${encodeURIComponent(token)}?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const doc = await res.json();
      const payload = decodeFirestoreValue(doc.fields?.payload);
      if (payload) return payload as PublicShare;
    }
  } catch {
    // Fall back to database query below
  }

  try {
    const [entry] = await getDb()
      .select({ share: shares, author: user.name })
      .from(shares)
      .innerJoin(user, eq(shares.ownerId, user.id))
      .where(eq(shares.token, token));
    if (!entry) return null;
    if (entry.share.lookId) {
      const [look] = await getDb()
        .select({ look: looks })
        .from(looks)
        .innerJoin(shares, eq(shares.lookId, looks.id))
        .where(and(eq(shares.token, token), eq(looks.ownerId, shares.ownerId)));
      if (!look) return null;
      return {
        kind: "look",
        name: look.look.name,
        description: "",
        author: entry.author,
        looks: [toPublicLook(look.look)],
      };
    }
    const rows = await getDb()
      .select({ book: lookbooks, look: looks })
      .from(shares)
      .innerJoin(
        lookbooks,
        and(eq(shares.lookbookId, lookbooks.id), eq(shares.ownerId, lookbooks.ownerId)),
      )
      .leftJoin(lookbookItems, eq(lookbookItems.lookbookId, lookbooks.id))
      .leftJoin(looks, and(eq(looks.id, lookbookItems.lookId), eq(looks.ownerId, lookbooks.ownerId)))
      .where(eq(shares.token, token))
      .orderBy(asc(lookbookItems.position));
    if (!rows.length) return null;
    return {
      kind: "lookbook",
      name: rows[0].book.name,
      description: rows[0].book.description,
      author: entry.author,
      looks: rows.flatMap(({ look }) => (look ? [toPublicLook(look)] : [])),
    };
  } catch (error) {
    console.warn("[AI Studio] Database unavailable for getPublicShare:", error);
    return null;
  }
}
