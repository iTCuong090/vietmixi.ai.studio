import { describe, expect, it } from "vitest";
import { slugify } from "../slug";

describe("slugify", () => {
  it("converts Vietnamese accented strings to clean slugs", () => {
    expect(slugify("Áo Dài Dáng Xưa")).toBe("ao-dai-dang-xua");
    expect(slugify("Nhật Bình Cung Đình")).toBe("nhat-binh-cung-dinh");
    expect(slugify("Áo ngũ thân tay chẽn")).toBe("ao-ngu-than-tay-chen");
    expect(slugify("Đồng dao")).toBe("dong-dao");
  });

  it("handles special characters and punctuation", () => {
    expect(slugify("Bộ phối: Nét Huế & Hà Nội!")).toBe("bo-phoi-net-hue-ha-noi");
    expect(slugify("Áo bà ba (Màu ngọc bích)")).toBe("ao-ba-ba-mau-ngoc-bich");
  });

  it("handles empty or whitespace strings gracefully", () => {
    expect(slugify("")).toBe("bo-phoi");
    expect(slugify("   ")).toBe("bo-phoi");
    expect(slugify("---")).toBe("bo-phoi");
  });
});
