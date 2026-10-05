import type { Metadata } from "next";
import Link from "next/link";
import { ProfileForm } from "@/components/AuthForms";
import { logoutAction } from "@/actions/auth";
import {
  IconArrowRight,
  IconBag,
  IconCheck,
  IconInfo,
  IconLogout,
  IconReceipt,
  IconShield,
  IconUser,
} from "@/components/Icons";
import { StatusPill } from "@/components/StatusPill";
import { btnOutline, btnQuiet, card, pageShell, pill } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDay, formatMoney } from "@/lib/money";
import { listOrders } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const [params, user] = await Promise.all([searchParams, requireUser("/account")]);
  const orders = await listOrders({ userId: user.id });
  const recent = orders.slice(0, 5);
  const paid = orders.filter((order) => order.paymentStatus === "paid");
  const spentCents = paid.reduce((sum, order) => sum + order.totalCents, 0);

  return (
    <div className={`${pageShell} py-10 lg:py-14`}>
      {params.denied === "1" ? (
        <p className="mb-8 flex items-start gap-2.5 rounded-card bg-warn-soft px-4 py-3.5 text-sm text-warn">
          <IconInfo size={17} className="mt-0.5 shrink-0" />
          <span>
            The kitchen dashboard is admin-only. Your account stays a customer account — ask Yanti at
            the counter if you need the order queue.
          </span>
        </p>
      ) : null}

      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-7">
        <div>
          <p className={`${pill} bg-accent-soft text-accent`}>
            <IconUser size={13} />
            {user.role === "admin" ? "Kitchen admin" : "Customer"}
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl">{user.name}</h1>
          <p className="mt-1.5 text-sm text-muted">
            Signed in as <span className="font-semibold text-ink-soft">{user.username}</span>
          </p>
        </div>

        <form action={logoutAction}>
          <button type="submit" className={btnQuiet}>
            <IconLogout size={16} />
            Sign out
          </button>
        </form>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10">
        <div>
          <ProfileForm user={user} />
        </div>

        <div className="space-y-6">
          <section className={`${card} p-6`}>
            <h2 className="font-display text-xl">Your numbers here</h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Preorders placed
                </dt>
                <dd className="mt-1.5 font-display text-3xl tabular-nums">{orders.length}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Paid so far
                </dt>
                <dd className="mt-1.5 font-display text-3xl tabular-nums">
                  {formatMoney(spentCents)}
                </dd>
              </div>
              <div className="col-span-2 border-t border-line pt-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Member since
                </dt>
                <dd className="mt-1.5 text-sm font-semibold">{formatDay(user.createdAt)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted">
              Paid so far counts only orders the counter or the payment page marked as paid. Cash on
              pickup is marked at the counter.
            </p>
          </section>

          <section className={`${card} p-6`}>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-xl">Recent preorders</h2>
              <Link
                href="/orders"
                className="text-sm font-semibold text-accent hover:underline"
              >
                All orders
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="mt-4">
                <p className="text-sm text-ink-soft">
                  Nothing ordered yet. The current batch closes at 15:00 and the wok goes on at
                  16:30.
                </p>
                <Link href="/menu" className={`${btnOutline} mt-4`}>
                  <IconBag size={16} />
                  Open the menu
                </Link>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {recent.map((order) => (
                  <li key={order.ref} className="py-3.5 first:pt-0 last:pb-0">
                    <Link href={`/orders/${order.ref}`} className="group flex items-center gap-4">
                      <IconReceipt size={18} className="shrink-0 text-muted" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold tabular-nums">{order.ref}</span>
                          <StatusPill status={order.status} />
                        </div>
                        <p className="mt-1 truncate text-xs text-muted">
                          {formatDay(order.createdAt)} · {order.items.length}{" "}
                          {order.items.length === 1 ? "dish" : "dishes"}
                          {order.invoiceNo ? ` · invoice ${order.invoiceNo}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold tabular-nums">
                        {formatMoney(order.totalCents)}
                      </span>
                      <IconArrowRight
                        size={16}
                        className="shrink-0 text-muted transition group-hover:text-accent"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={`${card} p-6`}>
            <h2 className="font-display text-xl">Quick links</h2>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link href="/orders" className={btnOutline}>
                <IconReceipt size={16} />
                My preorders
              </Link>
              <Link href="/menu" className={btnOutline}>
                <IconBag size={16} />
                Menu
              </Link>
              {user.role === "admin" ? (
                <Link href="/admin" className={btnOutline}>
                  <IconShield size={16} />
                  Kitchen dashboard
                </Link>
              ) : null}
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs text-muted">
              <IconCheck size={14} className="mt-0.5 shrink-0 text-ok" />
              <span>
                Waiting on a pickup? The number on this account is what the kitchen calls if a slot
                runs late.
              </span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
