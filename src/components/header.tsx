"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, LogOut, UserRound, Menu, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Brand } from "./brand";
import { AuthDialog } from "./auth-dialog";
export function Header() {
  const path = usePathname();
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const links = [
    { href: "/", label: "Khám phá" },
    { href: "/phong-phoi", label: "Phòng phối" },
    { href: "/lookbook", label: "Lookbook của tôi" },
  ];
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav aria-label="Điều hướng chính" className={menu ? "main-nav nav-open" : "main-nav"}>
            {links.map((link) => (
              <Link
                onClick={() => setMenu(false)}
                className={path === link.href ? "nav-link active" : "nav-link"}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            {!isPending && session ? (
              <>
                <Link className="account-link" href="/lookbook">
                  <UserRound size={17} />
                  <span>{session.user.name.split(" ").slice(-1)[0]}</span>
                </Link>
                <button
                  className="icon-button logout-button"
                  aria-label="Đăng xuất"
                  onClick={async () => {
                    await authClient.signOut();
                    router.refresh();
                  }}
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : !isPending ? (
              <button onClick={() => setAuthOpen(true)} className="header-login">
                Đăng nhập <ArrowUpRight size={17} />
              </button>
            ) : (
              <div style={{ width: 104, height: 36 }} aria-hidden="true" />
            )}
            <button
              className="icon-button mobile-menu"
              aria-label={menu ? "Đóng điều hướng" : "Mở điều hướng"}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      <AuthDialog
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
