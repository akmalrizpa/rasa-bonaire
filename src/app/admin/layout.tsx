import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { IconArrowRight, IconLogout } from "@/components/Icons";
import { LogoMark } from "@/components/Logo";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:py-8">
      <AdminNav variant="strip" />

      <div className="mt-3 lg:mt-0 lg:grid lg:grid-cols-[14rem_1fr] lg:gap-8">
        <aside className="hidden lg:sticky lg:top-8 lg:block lg:self-start">
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoMark size={28} />
            <span className="font-display text-lg leading-none">Kitchen desk</span>
          </Link>

          <div className="mt-4 rounded-card border border-line bg-shell px-3.5 py-3">
            <p className="truncate text-sm font-semibold">{admin.name}</p>
            <p className="mt-0.5 text-xs text-muted">
              @{admin.username} · {admin.role === "admin" ? "Kitchen admin" : "Customer"}
            </p>
          </div>

          <AdminNav />

          <div className="mt-5 border-t border-line pt-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-card px-3 py-2 text-sm font-semibold text-ink-soft transition hover:bg-shell hover:text-ink"
            >
              <IconArrowRight size={16} />
              Back to the shop
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-card px-3 py-2 text-left text-sm font-semibold text-accent transition hover:bg-accent-soft"
              >
                <IconLogout size={16} />
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <main className="mt-3 min-w-0 lg:mt-0">{children}</main>
      </div>
    </div>
  );
}
