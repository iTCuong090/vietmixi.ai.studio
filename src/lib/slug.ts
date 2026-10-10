/**
 * Utility to convert Vietnamese and arbitrary text into a URL-friendly slug
 */
export function slugify(text: string): string {
  if (!text) return "bo-phoi";
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // strip diacritics
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric chars with hyphen
      .replace(/^-+|-+$/g, "") // trim hyphens
    || "bo-phoi"
  );
}
