import { describe, expect, it } from "vitest";
import {
  authRequestSchema,
  createLookSchema,
  outfitSchema,
  updateLookbookSchema,
} from "../validation";

const outfit = {
  version: 1,
  avatar: "female",
  skinTone: "medium",
  garment: "ao-dai",
  primaryColor: "indigo",
  accentColor: "ivory",
  bottom: "trousers",
  accessories: { head: "none", hand: "fan", shoes: "flats" },
  event: "tet",
  weather: "cool",
  style: "elegant",
};

describe("dữ liệu phối đồ gửi từ trình duyệt", () => {
  it("chấp nhận mã catalog hợp lệ", () =>
    expect(outfitSchema.safeParse(outfit).success).toBe(true));
  it("không nhận hex tùy ý, áo lạ hoặc phụ kiện sai vị trí", () => {
    expect(outfitSchema.safeParse({ ...outfit, primaryColor: "#112233" }).success).toBe(false);
    expect(outfitSchema.safeParse({ ...outfit, garment: "unknown" }).success).toBe(false);
    expect(
      outfitSchema.safeParse({ ...outfit, accessories: { ...outfit.accessories, shoes: "fan" } })
        .success,
    ).toBe(false);
  });
  it("không cho client gán owner hoặc gửi ảnh cá nhân trong config", () => {
    expect(
      createLookSchema.safeParse({ name: "Tết", config: outfit, ownerId: "someone" }).success,
    ).toBe(false);
    expect(outfitSchema.safeParse({ ...outfit, photo: "data:image/jpeg;base64,..." }).success).toBe(
      false,
    );
  });
  it("không nhận tên trắng và lookbook quá 100 bộ", () => {
    expect(createLookSchema.safeParse({ name: "  ", config: outfit }).success).toBe(false);
    expect(
      updateLookbookSchema.safeParse({
        lookIds: Array(101).fill("aaaabbbb-cccc-4ddd-8eee-ffffffffffff"),
      }).success,
    ).toBe(false);
  });
});

describe("giới hạn dữ liệu tài khoản", () => {
  it("không nhận tên, email hoặc mật khẩu quá dài", () => {
    expect(authRequestSchema.safeParse({ name: "a".repeat(61) }).success).toBe(false);
    expect(authRequestSchema.safeParse({ email: `${"a".repeat(250)}@example.com` }).success).toBe(
      false,
    );
    expect(authRequestSchema.safeParse({ password: "p".repeat(129) }).success).toBe(false);
    expect(authRequestSchema.safeParse({ currentPassword: "p".repeat(129) }).success).toBe(false);
  });
  it("cho phép payload đăng xuất rỗng và chuẩn hóa tên", () => {
    expect(authRequestSchema.parse({})).toEqual({});
    expect(authRequestSchema.parse({ name: "  Linh Nguyễn  " }).name).toBe("Linh Nguyễn");
  });
});
