import { z } from "zod";
import { ACCESSORIES, EVENTS, GARMENTS, PALETTE, STYLES, WEATHERS } from "@/lib/catalog";
import type { OutfitConfig } from "@/lib/types";

const catalogId = (entries: readonly { id: string }[]) =>
  z.string().refine((id) => entries.some((entry) => entry.id === id), "Lựa chọn không hợp lệ.");
const accessory = (slot: "head" | "hand" | "shoes") =>
  z
    .string()
    .refine(
      (id) =>
        (id === "none" && slot !== "shoes") ||
        ACCESSORIES.some((item) => item.id === id && item.slot === slot),
      "Phụ kiện không đúng vị trí.",
    );

export const outfitSchema = z
  .object({
    version: z.literal(1),
    avatar: z.enum(["female", "male"]),
    skinTone: z.enum(["light", "medium", "deep"]),
    garment: catalogId(GARMENTS),
    primaryColor: catalogId(PALETTE),
    accentColor: catalogId(PALETTE),
    bottom: z.enum(["trousers", "skirt"]),
    accessories: z
      .object({ head: accessory("head"), hand: accessory("hand"), shoes: accessory("shoes") })
      .strict(),
    jewelry: z
      .object({
        kieng: z.boolean().optional(),
        xatich: z.boolean().optional(),
        bangles: z.boolean().optional(),
      })
      .optional(),
    heritageAccessories: z.array(z.string()).max(20).optional(),
    event: catalogId(EVENTS),
    weather: catalogId(WEATHERS),
    style: catalogId(STYLES),
  })
  .strict() as z.ZodType<OutfitConfig>;

export const idSchema = z.uuid();
const name = z.string().trim().min(1, "Hãy đặt tên cho bộ sưu tập của bạn.").max(100);
export const createLookSchema = z.object({ name, config: outfitSchema }).strict();
export const updateLookSchema = createLookSchema
  .extend({ revision: z.number().int().min(1).max(2147483646) })
  .strict();
export const createLookbookSchema = z
  .object({ name, description: z.string().trim().max(500).default("") })
  .strict();
export const updateLookbookSchema = z
  .object({
    name: name.optional(),
    description: z.string().trim().max(500).optional(),
    coverLookId: idSchema.nullable().optional(),
    lookIds: z.array(idSchema).max(100).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Chưa có thay đổi để lưu.");
export const shareSchema = z
  .object({ kind: z.enum(["look", "lookbook"]), targetId: idSchema, enabled: z.boolean() })
  .strict();

// Bound fields accepted by Better Auth before its handler buffers the JSON body.
// Remaining endpoint-specific fields are validated by Better Auth itself.
export const authRequestSchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    email: z.string().trim().max(254).email().optional(),
    password: z.string().min(1).max(128).optional(),
    currentPassword: z.string().min(1).max(128).optional(),
    newPassword: z.string().min(8).max(128).optional(),
    image: z.url().max(2048).nullable().optional(),
    callbackURL: z.string().max(2048).optional(),
  })
  .passthrough();
