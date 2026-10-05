"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBox,
  IconChart,
  IconReceipt,
  IconSliders,
  IconUsers,
} from "@/components/Icons";

const links = [
  { href: "/admin", label: "Dashboard", Icon: IconChart },
  { href: "/admin/orders", label: "Orders", Icon: IconReceipt },
  { href: "/admin/menu", label: "Menu", Icon: IconBox },
  { href: "/admin/customers", label: "Customers", Icon: IconUsers },
  { href: "/admin/settings", label: "Settings", Icon: IconSliders },
];

export function AdminNav({ variant = "list" }: { variant?: "list" | "strip" }) {
  const pathname = usePathname();

  return (
    <nav
      className={
        variant === "strip"
          ? "-mx-4 flex items-center gap-1 overflow-x-auto px-4 pb-1 lg:hidden"
          : "mt-6 hidden flex-col gap-0.5 lg:flex"
      }
      aria-label="Admin sections"
    >
      {links.map((link) => {
        const active =
          pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex shrink-0 items-center gap-2.5 rounded-card px-3 py-2 text-sm font-semibold transition ${
              active ? "bg-shell text-accent" : "text-ink-soft hover:bg-shell hover:text-ink"
            }`}
          >
            <link.Icon size={17} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
