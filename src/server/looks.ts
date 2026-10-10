import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import type { OutfitConfig, SavedLook } from "@/lib/types";
import { getDb } from "./db";
import { notFound } from "./errors";
import { assertRevision, toLookDto } from "./policies";
import { looks, shares } from "./schema";

export async function listLooks(ownerId: string): Promise<SavedLook[]> {
  const rows = await getDb()
    .select({ look: looks, shareToken: shares.token })
    .from(looks)
    .leftJoin(shares, eq(shares.lookId, looks.id))
    .where(eq(looks.ownerId, ownerId))
    .orderBy(desc(looks.updatedAt));
  return rows.map(({ look, shareToken }) => toLookDto(look, shareToken));
}

export async function getLook(ownerId: string, id: string): Promise<SavedLook> {
  const [row] = await getDb()
    .select({ look: looks, shareToken: shares.token })
    .from(looks)
    .leftJoin(shares, eq(shares.lookId, looks.id))
    .where(and(eq(looks.id, id), eq(looks.ownerId, ownerId)));
  if (!row) notFound();
  return toLookDto(row.look, row.shareToken);
}

export async function createLook(
  ownerId: string,
  input: { name: string; config: OutfitConfig },
): Promise<SavedLook> {
  const [look] = await getDb()
    .insert(looks)
    .values({ ownerId, ...input })
    .returning();
  return toLookDto(look, null);
}

export async function updateLook(
  ownerId: string,
  id: string,
  input: { name: string; config: OutfitConfig; revision: number },
): Promise<SavedLook> {
  return getDb().transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(looks)
      .where(and(eq(looks.id, id), eq(looks.ownerId, ownerId)))
      .for("update");
    if (!current) notFound();
    assertRevision(current.revision, input.revision);
    const [look] = await tx
      .update(looks)
      .set({
        name: input.name,
        config: input.config,
        revision: sql`${looks.revision} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(looks.id, id), eq(looks.ownerId, ownerId), eq(looks.revision, input.revision)))
      .returning();
    const [share] = await tx
      .select({ token: shares.token })
      .from(shares)
      .where(eq(shares.lookId, id));
    return toLookDto(look, share?.token ?? null);
  });
}

export async function deleteLook(ownerId: string, id: string): Promise<void> {
  const removed = await getDb()
    .delete(looks)
    .where(and(eq(looks.id, id), eq(looks.ownerId, ownerId)))
    .returning({ id: looks.id });
  if (!removed.length) notFound();
}
