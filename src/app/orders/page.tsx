import type { Metadata } from "next";
import Link from "next/link";
import { DishArt } from "@/components/DishArt";
import { IconArrowRight, IconChevronRight, IconReceipt } from "@/components/Icons";
import { PaymentPill, StatusPill } from "@/components/StatusPill";
import { btnPrimary, card, pageShell } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatDateTime, formatMoney } from "@/lib/money";
import { listOrders } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My preorders",
  description: "Every preorder on this account, with the batch slot and what is still to pay.",
};

export default async function OrdersPage() {
  const user = await requireUser("/orders");
  const orders = await listOrders({ userId: user.id });

  return (
    <div className={`${pageShell} py-10`}>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <h1 className="font-display text-4xl">My preorders</h1>
          <p className="mt-2 text-sm text-muted">
            Signed in as {user.name}. The kitchen keeps the last 30 days here, older receipts are in
            your email.
          </p>
        </div>
        <Link href="/menu" className={btnPrimary}>
          Order something else <IconArrowRight size={16} />
        </Link>
      </header>

      {orders.length === 0 ? (
        <div className="mt-10 max-w-xl">
          <DishArt art="skewer" className="h-28 w-28 rounded-card" />
          <h2 className="mt-4 font-display text-2xl">No preorders on this account yet</h2>
          <p className="mt-2 text-sm text-muted">
            Nothing has been cooked for you so far. Pick a dish, choose a slot, and the order shows
            up here with a live status. The kitchen keeps the last 30 days of orders.
          </p>
          <Link href="/menu" className={`${btnPrimary} mt-5`}>
            Open the menu <IconArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
            return (
              <li key={order.ref}>
                <Link
                  href={`/orders/${order.ref}`}
                  className={`${card} flex flex-wrap items-center gap-5 p-5 transition hover:border-ink/25`}
                >
                  <DishArt art="plate" className="hidden h-16 w-16 shrink-0 rounded-card sm:block" />

                  <div className="min-w-[190px] flex-1">
                    <div className="flex items-center gap-2">
                      <IconReceipt size={15} className="text-muted" />
                      <span className="font-display text-lg tracking-tight">{order.ref}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">{formatDateTime(order.createdAt)}</p>
                  </div>

                  <div className="min-w-[160px] flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                      {order.fulfilment === "pickup" ? "Pickup slot" : "Delivery slot"}
                    </p>
                    <p className="mt-1 text-sm font-medium">{order.slot}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusPill status={order.status} />
                    <PaymentPill status={order.paymentStatus} />
                  </div>

                  <div className="flex items-center gap-4 sm:min-w-[150px] sm:justify-end">
                    <div className="text-right">
                      <p className="font-display text-xl tabular-nums">
                        {formatMoney(order.totalCents)}
                      </p>
                      <p className="text-xs text-muted">
                        {itemCount} {itemCount === 1 ? "dish" : "dishes"}
                      </p>
                    </div>
                    <IconChevronRight size={18} className="text-muted" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
