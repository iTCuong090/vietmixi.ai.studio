import "server-only";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import type { Lookbook } from "@/lib/types";
import { getDb } from "./db";
import { notFound } from "./errors";
import { assertOwnedLookIds, planLookbookMembers, toLookDto } from "./policies";
import { lookbookItems, lookbooks, looks, shares } from "./schema";

export async function listLookbooks(ownerId: string): Promise<Lookbook[]> {
  const books = await getDb()
    .select({ book: lookbooks, shareToken: shares.token })
    .from(lookbooks)
    .leftJoin(shares, eq(shares.lookbookId, lookbooks.id))
    .where(eq(lookbooks.ownerId, ownerId))
    .orderBy(desc(lookbooks.updatedAt));
  if (!books.length) return [];
  const items = await getDb()
    .select({ bookId: lookbookItems.lookbookId, look: looks, shareToken: shares.token })
    .from(lookbookItems)
    .innerJoin(looks, eq(looks.id, lookbookItems.lookId))
    .leftJoin(shares, eq(shares.lookId, looks.id))
    .where(
      and(
        inArray(
          lookbookItems.lookbookId,
          books.map(({ book }) => book.id),
        ),
        eq(looks.ownerId, ownerId),
      ),
    )
    .orderBy(asc(lookbookItems.position));
  return books.map(({ book, shareToken }) => ({
    id: book.id,
    name: book.name,
    description: book.description,
    coverLookId: book.coverLookId,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
    shareToken,
    looks: items
      .filter((item) => item.bookId === book.id)
      .map((item) => toLookDto(item.look, item.shareToken)),
  }));
}

export async function createLookbook(
  ownerId: string,
  input: { name: string; description: string },
): Promise<Lookbook> {
  const [book] = await getDb()
    .insert(lookbooks)
    .values({ ownerId, ...input })
    .returning();
  return {
    id: book.id,
    name: book.name,
    description: book.description,
    coverLookId: null,
    createdAt: book.createdAt.toISOString(),
    updatedAt: book.updatedAt.toISOString(),
    looks: [],
    shareToken: null,
  };
}

export interface LookbookPatch {
  name?: string;
  description?: string;
  coverLookId?: string | null;
  lookIds?: string[];
}

export async function updateLookbook(
  ownerId: string,
  id: string,
  input: LookbookPatch,
): Promise<Lookbook> {
  return getDb().transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(lookbooks)
      .where(and(eq(lookbooks.id, id), eq(lookbooks.ownerId, ownerId)))
      .for("update");
    if (!current) notFound();
    const currentItems = await tx
      .select({ lookId: lookbookItems.lookId })
      .from(lookbookItems)
      .where(eq(lookbookItems.lookbookId, id))
      .orderBy(asc(lookbookItems.position));
    const plan = planLookbookMembers(
      currentItems.map((item) => item.lookId),
      current.coverLookId,
      input.lookIds,
      input.coverLookId,
    );
    const owned = plan.ids.length
      ? await tx
          .select()
          .from(looks)
          .where(and(inArray(looks.id, plan.ids), eq(looks.ownerId, ownerId)))
          .for("key share")
      : [];
    assertOwnedLookIds(
      plan.ids,
      owned.map((look) => look.id),
    );
    if (input.lookIds !== undefined) {
      await tx.delete(lookbookItems).where(eq(lookbookItems.lookbookId, id));
      if (plan.ids.length)
        await tx
          .insert(lookbookItems)
          .values(plan.ids.map((lookId, position) => ({ lookbookId: id, lookId, position })));
    }
    const [book] = await tx
      .update(lookbooks)
      .set({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        coverLookId: plan.coverLookId,
        updatedAt: new Date(),
      })
      .where(and(eq(lookbooks.id, id), eq(lookbooks.ownerId, ownerId)))
      .returning();
    const [share] = await tx
      .select({ token: shares.token })
      .from(shares)
      .where(eq(shares.lookbookId, id));
    return {
      id: book.id,
      name: book.name,
      description: book.description,
      coverLookId: book.coverLookId,
      createdAt: book.createdAt.toISOString(),
      updatedAt: book.updatedAt.toISOString(),
      shareToken: share?.token ?? null,
      looks: plan.ids.map((lookId) => toLookDto(owned.find((look) => look.id === lookId)!)),
    };
  });
}

export async function deleteLookbook(ownerId: string, id: string): Promise<void> {
  const removed = await getDb()
    .delete(lookbooks)
    .where(and(eq(lookbooks.id, id), eq(lookbooks.ownerId, ownerId)))
    .returning({ id: lookbooks.id });
  if (!removed.length) notFound();
}
