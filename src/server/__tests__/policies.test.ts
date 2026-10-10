import { describe, expect, it } from "vitest";
import type { OutfitConfig } from "@/lib/types";
import {
  assertOrigin,
  assertOwnedLookIds,
  assertRevision,
  planLookbookMembers,
  toPublicLook,
} from "../policies";

describe("quyền sở hữu và cập nhật", () => {
  it("không cho chèn bộ đồ của người khác hoặc đã bị xóa", () => {
    expect(() => assertOwnedLookIds(["mine", "foreign"], ["mine"])).toThrow();
    expect(() => assertOwnedLookIds(["gone"], [])).toThrow();
    expect(() => assertOwnedLookIds(["mine"], ["mine"])).not.toThrow();
  });
  it("từ chối lưu một revision cũ", () => {
    expect(() => assertRevision(3, 2)).toThrow(
      expect.objectContaining({ status: 409, code: "REVISION_CONFLICT" }),
    );
    expect(() => assertRevision(3, 3)).not.toThrow();
  });
});

describe("thành viên lookbook", () => {
  it("giữ thứ tự được yêu cầu và chuyển bìa khi ảnh cũ bị gỡ", () => {
    expect(planLookbookMembers(["a", "b", "c"], "a", ["c", "b"])).toEqual({
      ids: ["c", "b"],
      coverLookId: "c",
    });
  });
  it("không nhận bộ trùng hoặc bìa ngoài lookbook", () => {
    expect(() => planLookbookMembers([], null, ["a", "a"])).toThrow();
    expect(() => planLookbookMembers(["a"], "a", undefined, "b")).toThrow();
  });
  it("cho phép lookbook rỗng và gỡ bìa rõ ràng", () => {
    expect(planLookbookMembers(["a"], "a", [])).toEqual({ ids: [], coverLookId: null });
    expect(planLookbookMembers(["a"], "a", undefined, null)).toEqual({
      ids: ["a"],
      coverLookId: null,
    });
    expect(planLookbookMembers(["a"], null)).toEqual({ ids: ["a"], coverLookId: null });
  });
});

describe("chống request từ origin khác", () => {
  it.each([null, "null", "https://evil.example", "https://vietmixi.example.evil.example"])(
    "từ chối %s",
    (origin) => {
      expect(() => assertOrigin(origin, "https://vietmixi.example")).toThrow();
    },
  );
  it("chấp nhận đúng origin", () =>
    expect(() =>
      assertOrigin("https://vietmixi.example", "https://vietmixi.example"),
    ).not.toThrow());
});

describe("dữ liệu chia sẻ công khai", () => {
  it("bỏ owner ID và token riêng dù hàng database có chứa các trường này", () => {
    const config = {
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
    } satisfies OutfitConfig;
    const row = {
      id: "look",
      ownerId: "private-user",
      shareToken: "secret-token",
      name: "Ngày Tết",
      revision: 1,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-02T00:00:00Z"),
      config: {
        ...config,
        privatePhoto: "private-photo",
        accessories: { ...config.accessories, privateField: "secret" },
      },
    };
    const result = toPublicLook(row);
    expect(result).not.toHaveProperty("ownerId");
    expect(result).not.toHaveProperty("shareToken");
    expect(result.config).not.toHaveProperty("privatePhoto");
    expect(result.config.accessories).not.toHaveProperty("privateField");
    expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
  });
});
