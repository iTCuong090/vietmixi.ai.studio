import type { OutfitConfig, SavedLook } from "@/lib/types";
import { HttpError } from "./errors";

export function assertOrigin(origin: string | null, expectedOrigin: string): void {
  if (!origin || origin !== expectedOrigin)
    throw new HttpError(403, "Yêu cầu không đến từ Việt Mixi.", "INVALID_ORIGIN");
}

export function planLookbookMembers(
  currentIds: string[],
  currentCover: string | null,
  nextIds?: string[],
  requestedCover?: string | null,
) {
  const ids = nextIds ?? currentIds;
  if (new Set(ids).size !== ids.length)
    throw new HttpError(400, "Một bộ đồ chỉ xuất hiện một lần trong lookbook.", "DUPLICATE_LOOK");
  if (requestedCover && !ids.includes(requestedCover))
    throw new HttpError(400, "Ảnh bìa phải thuộc lookbook này.", "INVALID_COVER");
  let coverLookId = currentCover;
  if (requestedCover !== undefined) coverLookId = requestedCover;
  else if ((currentCover && !ids.includes(currentCover)) || currentIds.length === 0)
    coverLookId = ids[0] ?? null;
  return { ids, coverLookId };
}

export function assertOwnedLookIds(requested: string[], owned: string[]): void {
  const allowed = new Set(owned);
  if (requested.some((id) => !allowed.has(id)))
    throw new HttpError(
      404,
      "Một bộ đồ không còn tồn tại hoặc không thuộc tủ đồ của bạn.",
      "LOOK_NOT_FOUND",
    );
}

export function assertRevision(actual: number, expected: number): void {
  if (actual !== expected)
    throw new HttpError(
      409,
      "Bộ đồ đã được thay đổi ở nơi khác. Hãy tải bản mới trước khi lưu.",
      "REVISION_CONFLICT",
    );
}

interface LookRecord {
  id: string;
  name: string;
  config: OutfitConfig;
  revision: number;
  createdAt: Date;
  updatedAt: Date;
}

function publicOutfit(config: OutfitConfig): OutfitConfig {
  return {
    version: config.version,
    avatar: config.avatar,
    skinTone: config.skinTone,
    garment: config.garment,
    primaryColor: config.primaryColor,
    accentColor: config.accentColor,
    bottom: config.bottom,
    accessories: {
      head: config.accessories.head,
      hand: config.accessories.hand,
      shoes: config.accessories.shoes,
    },
    event: config.event,
    weather: config.weather,
    style: config.style,
  };
}

export function toLookDto(row: LookRecord, shareToken?: string | null): SavedLook {
  return {
    id: row.id,
    name: row.name,
    config: publicOutfit(row.config),
    revision: row.revision,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...(shareToken !== undefined ? { shareToken } : {}),
  };
}

// Build public objects field-by-field; never spread a private look or DB row.
export function toPublicLook(row: LookRecord): SavedLook {
  return toLookDto(row);
}
