"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/actions/auth";
import { useCart } from "@/components/AppProviders";
import { CartDrawer } from "@/components/CartDrawer";
import { Countdown } from "@/components/Countdown";
import {
  IconBag,
  IconChevronDown,
  IconClose,
  IconFlame,
  IconLogout,
  IconMenuBars,
  IconReceipt,
  IconSearch,
  IconShield,
  IconUser,
} from "@/components/Icons";
import { Logo } from "@/components/Logo";
import type { PublicUser, Settings } from "@/lib/types";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "How it works" },
  { href: "/orders", label: "Track preorder" },
];

export function Header({
  user,
  settings,
  closesAtIso,
}: {
  user: PublicUser | null;
  settings: Settings;
  closesAtIso: string;
}) {
  const pathname = usePathname();
  const { count, ready, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-ink text-sand">
        <div className="mx-auto flex h-9 w-full max-w-6xl items-center gap-4 px-5 text-[11px]">
          <span className="hidden shrink-0 items-center gap-1.5 font-semibold uppercase tracking-[0.16em] text-sand/60 sm:flex">
            <IconFlame size={13} />
            Batch closes 15:00
          </span>
          <p className="min-w-0 flex-1 truncate text-sand/85">
            {settings.storeOpen
              ? settings.announcement
              : "The kitchen is closed for today. Preorders for the next batch open again tomorrow."}
          </p>
          <Countdown
            closesAt={closesAtIso}
            compact
            className="hidden shrink-0 font-semibold tabular-nums text-sand/85 sm:inline"
          />
        </div>
      </div>

      <div className="border-b border-line bg-sand/90 backdrop-blur">
        <div className="mx-auto flex h-[68px] w-full max-w-6xl items-center gap-3 px-5">
          <Logo size={32} />

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-card px-3 py-2 text-sm font-semibold transition ${
                    active ? "bg-shell text-accent" : "text-ink-soft hover:bg-shell hover:text-ink"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              href="/menu"
              className="grid size-10 place-items-center rounded-card border border-line bg-shell text-ink-soft transition hover:text-ink"
              aria-label="Search the menu"
            >
              <IconSearch size={18} />
            </Link>

            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserOpen((open) => !open)}
                  className="flex h-10 items-center gap-2 rounded-card border border-line bg-shell px-3 text-sm font-semibold transition hover:border-ink/25"
                  aria-expanded={userOpen}
                >
                  <span className="grid size-6 place-items-center rounded-full bg-accent text-[11px] font-bold text-white">
                    {user.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden max-w-24 truncate sm:inline">{user.username}</span>
                  <IconChevronDown size={14} />
                </button>

                {userOpen ? (
                  <div className="animate-rise absolute right-0 top-12 w-60 overflow-hidden rounded-card border border-line bg-shell shadow-pop">
                    <div className="border-b border-line px-4 py-3">
                      <p className="truncate text-sm font-semibold">{user.name}</p>
                      <p className="truncate text-xs text-muted">
                        {user.role === "admin" ? "Kitchen admin" : "Customer"}
                      </p>
                    </div>
                    <Link
                      href="/orders"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition hover:bg-sand"
                    >
                      <IconReceipt size={16} /> My preorders
                    </Link>
                    <Link
                      href="/account"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition hover:bg-sand"
                    >
                      <IconUser size={16} /> Account details
                    </Link>
                    {user.role === "admin" ? (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition hover:bg-sand"
                      >
                        <IconShield size={16} /> Kitchen dashboard
                      </Link>
                    ) : null}
                    <form action={logoutAction} className="border-t border-line">
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-accent transition hover:bg-accent-soft"
                      >
                        <IconLogout size={16} /> Sign out
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden h-10 items-center gap-2 rounded-card border border-line bg-shell px-3 text-sm font-semibold transition hover:border-ink/25 sm:flex"
              >
                <IconUser size={16} /> Sign in
              </Link>
            )}

            <button
              type="button"
              id="cart-button"
              onClick={openDrawer}
              className="relative flex h-10 items-center gap-2 rounded-card bg-accent px-3.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
            >
              <IconBag size={18} />
              <span className="hidden sm:inline">Cart</span>
              {ready && count > 0 ? (
                <span className="animate-pop absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-ink text-[11px] font-bold text-sand">
                  {count}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="grid size-10 place-items-center rounded-card border border-line bg-shell md:hidden"
              aria-label="Open navigation"
            >
              {mobileOpen ? <IconClose size={18} /> : <IconMenuBars size={18} />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="animate-rise border-t border-line bg-sand px-5 py-4 md:hidden">
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-card px-3 py-3 text-sm font-semibold transition hover:bg-shell"
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="rounded-card px-3 py-3 text-sm font-semibold transition hover:bg-shell"
                  >
                    Account details
                  </Link>
                  {user.role === "admin" ? (
                    <Link
                      href="/admin"
                      className="rounded-card px-3 py-3 text-sm font-semibold transition hover:bg-shell"
                    >
                      Kitchen dashboard
                    </Link>
                  ) : null}
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="w-full rounded-card px-3 py-3 text-left text-sm font-semibold text-accent"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-card px-3 py-3 text-sm font-semibold text-accent"
                >
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        ) : null}
      </div>

      <CartDrawer />
    </header>
  );
}
