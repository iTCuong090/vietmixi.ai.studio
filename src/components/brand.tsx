import Link from "next/link";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Việt Mixi — Trang chủ"
    >
      <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path
          d="M20 4C26 11 26 16 20 22C14 16 14 11 20 4ZM4 18C13 14 18 17 20 24C12 27 7 25 4 18ZM36 18C27 14 22 17 20 24C28 27 33 25 36 18Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M9 31C16 31 19 28 20 24C21 28 24 31 31 31M20 24V36"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
      <span>
        Việt<span className="brand-italic">Mixi</span>
        <span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
