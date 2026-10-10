"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db, auth } from "./firebase";
import type { Lookbook, OutfitConfig, PublicShare, SavedLook } from "./types";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
}

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let token = "";
  for (let i = 0; i < 43; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function getLocalLooks(ownerId: string): SavedLook[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`vietmixi:looks:${ownerId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalLooks(ownerId: string, looks: SavedLook[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`vietmixi:looks:${ownerId}`, JSON.stringify(looks));
  } catch {
    // Ignore storage quota
  }
}

export async function listLooks(ownerId: string): Promise<SavedLook[]> {
  const path = "looks";
  try {
    const q = query(collection(db, path), where("ownerId", "==", ownerId));
    const snap = await getDocs(q);
    const looks: SavedLook[] = [];
    snap.forEach((d) => {
      const data = d.data() as SavedLook;
      looks.push({ ...data, id: d.id });
    });
    looks.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setLocalLooks(ownerId, looks);
    return looks;
  } catch (err) {
    console.warn("Firestore listLooks checking local cache:", err);
    const cached = getLocalLooks(ownerId);
    if (cached.length > 0) return cached;
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function getLook(ownerId: string, id: string): Promise<SavedLook> {
  const path = `looks/${id}`;
  try {
    const ref = doc(db, "looks", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error("Không tìm thấy bộ phối.");
    }
    const data = snap.data() as SavedLook & { ownerId?: string };
    if (data.ownerId !== ownerId) {
      throw new Error("Bạn không có quyền xem bộ phối này.");
    }
    return { ...data, id: snap.id };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function createLook(
  ownerId: string,
  input: { name: string; config: OutfitConfig },
): Promise<SavedLook> {
  const id = generateId();
  const now = new Date().toISOString();
  const look: SavedLook = {
    id,
    name: input.name,
    config: input.config,
    revision: 1,
    createdAt: now,
    updatedAt: now,
    shareToken: null,
  };
  try {
    await setDoc(doc(db, "looks", id), { ...look, ownerId });
  } catch (err) {
    console.warn("Firestore createLook caching locally:", err);
  }
  const current = getLocalLooks(ownerId);
  setLocalLooks(ownerId, [look, ...current.filter((l) => l.id !== id)]);
  return look;
}

export async function updateLook(
  ownerId: string,
  id: string,
  input: { name: string; config: OutfitConfig; revision?: number },
): Promise<SavedLook> {
  const now = new Date().toISOString();
  let currentLook = getLocalLooks(ownerId).find((l) => l.id === id);

  try {
    const ref = doc(db, "looks", id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as SavedLook & { ownerId: string };
      if (data.ownerId === ownerId) {
        currentLook = data;
      }
    }
    const updated: SavedLook = {
      ...(currentLook || { id, shareToken: null, createdAt: now }),
      name: input.name,
      config: input.config,
      revision: (currentLook?.revision || 1) + 1,
      updatedAt: now,
    };
    await updateDoc(ref, {
      name: updated.name,
      config: updated.config,
      revision: updated.revision,
      updatedAt: updated.updatedAt,
    });
    const current = getLocalLooks(ownerId);
    setLocalLooks(ownerId, current.map((l) => (l.id === id ? updated : l)));
    return updated;
  } catch (err) {
    console.warn("Firestore updateLook caching locally:", err);
    const updated: SavedLook = {
      ...(currentLook || { id, shareToken: null, createdAt: now }),
      name: input.name,
      config: input.config,
      revision: ((currentLook?.revision || 1) + 1),
      updatedAt: now,
    };
    const current = getLocalLooks(ownerId);
    setLocalLooks(ownerId, current.map((l) => (l.id === id ? updated : l)));
    return updated;
  }
}

export async function deleteLook(ownerId: string, id: string): Promise<void> {
  try {
    const ref = doc(db, "looks", id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      if (data.ownerId === ownerId) {
        if (data.shareToken) {
          try {
            await deleteDoc(doc(db, "shares", data.shareToken));
          } catch {
            // Ignore cascade share deletion failure
          }
        }
        await deleteDoc(ref);
      }
    }
  } catch (err) {
    console.warn("Firestore deleteLook updating local cache:", err);
  }
  const current = getLocalLooks(ownerId);
  setLocalLooks(ownerId, current.filter((l) => l.id !== id));
}

function getLocalLookbooks(ownerId: string): Lookbook[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`vietmixi:lookbooks:${ownerId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalLookbooks(ownerId: string, books: Lookbook[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`vietmixi:lookbooks:${ownerId}`, JSON.stringify(books));
  } catch {
    // Ignore storage quota
  }
}

export async function listLookbooks(ownerId: string): Promise<Lookbook[]> {
  const path = "lookbooks";
  try {
    const q = query(collection(db, path), where("ownerId", "==", ownerId));
    const snap = await getDocs(q);
    const books: (Lookbook & { lookIds?: string[] })[] = [];
    snap.forEach((d) => {
      const data = d.data();
      books.push({
        id: d.id,
        name: data.name,
        description: data.description || "",
        coverLookId: data.coverLookId || null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        shareToken: data.shareToken || null,
        looks: [],
        lookIds: data.lookIds || [],
      });
    });

    const allLooks = await listLooks(ownerId);
    const looksMap = new Map<string, SavedLook>(allLooks.map((l) => [l.id, l]));

    const result: Lookbook[] = books.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      coverLookId: b.coverLookId,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      shareToken: b.shareToken,
      looks: (b.lookIds || []).map((id) => looksMap.get(id)).filter(Boolean) as SavedLook[],
    }));

    result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    setLocalLookbooks(ownerId, result);
    return result;
  } catch (err) {
    console.warn("Firestore listLookbooks checking local cache:", err);
    const cached = getLocalLookbooks(ownerId);
    if (cached.length > 0) return cached;
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function getLookbook(ownerId: string, id: string): Promise<Lookbook> {
  const path = `lookbooks/${id}`;
  try {
    const ref = doc(db, "lookbooks", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      throw new Error("Không tìm thấy lookbook.");
    }
    const data = snap.data();
    if (data.ownerId !== ownerId) {
      throw new Error("Bạn không có quyền xem lookbook này.");
    }
    const allLooks = await listLooks(ownerId);
    const looksMap = new Map<string, SavedLook>(allLooks.map((l) => [l.id, l]));
    return {
      id: snap.id,
      name: data.name,
      description: data.description || "",
      coverLookId: data.coverLookId || null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      shareToken: data.shareToken || null,
      looks: (data.lookIds || []).map((lId: string) => looksMap.get(lId)).filter(Boolean) as SavedLook[],
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function createLookbook(
  ownerId: string,
  input: { name: string; description: string },
): Promise<Lookbook> {
  const id = generateId();
  const now = new Date().toISOString();
  const book: Lookbook = {
    id,
    name: input.name,
    description: input.description,
    coverLookId: null,
    createdAt: now,
    updatedAt: now,
    looks: [],
    shareToken: null,
  };
  try {
    await setDoc(doc(db, "lookbooks", id), {
      ...book,
      lookIds: [],
      ownerId,
    });
  } catch (err) {
    console.warn("Firestore createLookbook saving to local cache:", err);
  }
  const current = getLocalLookbooks(ownerId);
  setLocalLookbooks(ownerId, [book, ...current.filter((b) => b.id !== id)]);
  return book;
}

export async function updateLookbook(
  ownerId: string,
  id: string,
  patch: {
    name?: string;
    description?: string;
    coverLookId?: string | null;
    lookIds?: string[];
  },
): Promise<Lookbook> {
  const now = new Date().toISOString();
  let currentBook = getLocalLookbooks(ownerId).find((b) => b.id === id);

  try {
    const ref = doc(db, "lookbooks", id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      if (data.ownerId === ownerId) {
        currentBook = {
          id: snap.id,
          name: data.name,
          description: data.description || "",
          coverLookId: data.coverLookId || null,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          shareToken: data.shareToken || null,
          looks: [],
        };
      }
    }
    const updateData: Record<string, unknown> = { updatedAt: now };
    if (patch.name !== undefined) updateData.name = patch.name;
    if (patch.description !== undefined) updateData.description = patch.description;
    if (patch.coverLookId !== undefined) updateData.coverLookId = patch.coverLookId;
    if (patch.lookIds !== undefined) updateData.lookIds = patch.lookIds;

    await updateDoc(ref, updateData);
    return getLookbook(ownerId, id);
  } catch (err) {
    console.warn("Firestore updateLookbook caching locally:", err);
    if (!currentBook) throw new Error("Không tìm thấy lookbook để cập nhật.");
    const updated: Lookbook = {
      ...currentBook,
      name: patch.name !== undefined ? patch.name : currentBook.name,
      description: patch.description !== undefined ? patch.description : currentBook.description,
      coverLookId: patch.coverLookId !== undefined ? patch.coverLookId : currentBook.coverLookId,
      updatedAt: now,
    };
    const current = getLocalLookbooks(ownerId);
    setLocalLookbooks(ownerId, current.map((b) => (b.id === id ? updated : b)));
    return updated;
  }
}

export async function deleteLookbook(ownerId: string, id: string): Promise<void> {
  try {
    const ref = doc(db, "lookbooks", id);
    await deleteDoc(ref);
  } catch (err) {
    console.warn("Firestore deleteLookbook updating local cache:", err);
  }
  const current = getLocalLookbooks(ownerId);
  setLocalLookbooks(ownerId, current.filter((b) => b.id !== id));
}

export async function setSharing(
  ownerId: string,
  input: { kind: "look" | "lookbook"; targetId: string; enabled: boolean },
): Promise<string | null> {
  const collectionName = input.kind === "look" ? "looks" : "lookbooks";
  const targetRef = doc(db, collectionName, input.targetId);
  const snap = await getDoc(targetRef);
  if (!snap.exists()) throw new Error("Không tìm thấy nội dung để chia sẻ.");
  const data = snap.data();
  if (data.ownerId !== ownerId) throw new Error("Bạn không có quyền chia sẻ nội dung này.");

  if (!input.enabled) {
    if (data.shareToken) {
      try {
        await deleteDoc(doc(db, "shares", data.shareToken));
      } catch {
        // Ignore
      }
      await updateDoc(targetRef, { shareToken: null });
    }
    return null;
  }

  if (data.shareToken) {
    return data.shareToken;
  }

  const token = generateToken();
  const authorName = auth.currentUser?.displayName || "Bạn";
  let sharePayload: PublicShare;

  if (input.kind === "look") {
    sharePayload = {
      kind: "look",
      name: data.name,
      description: "",
      author: authorName,
      looks: [{ ...data, id: input.targetId } as SavedLook],
    };
  } else {
    const allLooks = await listLooks(ownerId);
    const looksMap = new Map<string, SavedLook>(allLooks.map((l) => [l.id, l]));
    const looks = (data.lookIds || [])
      .map((id: string) => looksMap.get(id))
      .filter(Boolean) as SavedLook[];
    sharePayload = {
      kind: "lookbook",
      name: data.name,
      description: data.description || "",
      author: authorName,
      looks,
    };
  }

  await setDoc(doc(db, "shares", token), {
    token,
    ownerId,
    authorName,
    kind: input.kind,
    targetId: input.targetId,
    name: sharePayload.name,
    description: sharePayload.description,
    payload: sharePayload,
    createdAt: new Date().toISOString(),
  });

  await updateDoc(targetRef, { shareToken: token });
  return token;
}

export async function getPublicShareFromFirestore(token: string): Promise<PublicShare | null> {
  const path = `shares/${token}`;
  try {
    const ref = doc(db, "shares", token);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return (data.payload as PublicShare) || null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}
