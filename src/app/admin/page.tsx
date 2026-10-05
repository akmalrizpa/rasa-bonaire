import Link from "next/link";
import { StatusPill } from "@/components/StatusPill";
import { card } from "@/components/ui";
import { formatDateTime, formatMoney, formatMoneyShort } from "@/lib/money";
import { getStats, listOrders } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard" };

function minutesSince(iso: string): number {
  const elapsed = (Date.now() - new Date(iso).getTime()) / 60000;
  return Math.max(0, Math.round(elapsed));
}

function Tile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className={`${card} px-4 py-3.5`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{hint}</p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [stats, orders] = await Promise.all([getStats(), listOrders()]);

  const queue = orders
    .filter((order) => order.paymentStatus === "paid")
    .filter((order) => order.status !== "completed" && order.status !== "cancelled");

  const peak = Math.max(...stats.week.map((day) => day.cents), 1);
  const openCents = queue.reduce((sum, order) => sum + order.totalCents, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Today in the kitchen</h1>
          <p className="mt-1 text-sm text-muted">
            Preorders for the next batch. Counts reset at midnight Bonaire time.
          </p>
        </div>
        <Link href="/admin/orders" className="text-sm font-semibold text-accent hover:underline">
          Open the order board
        </Link>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          label="Revenue today"
          value={formatMoney(stats.revenueTodayCents)}
          hint="Paid orders only"
        />
        <Tile label="Orders today" value={String(stats.ordersToday)} hint="Everything placed today" />
        <Tile
          label="Open in the kitchen"
          value={String(stats.openOrders)}
          hint={`${formatMoney(openCents)} still to hand over`}
        />
        <Tile
          label="Average ticket"
          value={formatMoney(stats.averageTicketCents)}
          hint="All paid orders"
        />
      </div>

      <section className={`${card} p-4`}>
        <header className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Last seven days</h2>
          <span className="text-xs text-muted">Paid revenue, by order date</span>
        </header>
        <div className="mt-5 flex h-44 items-end gap-2">
          {stats.week.map((day, index) => (
            <div
              key={`${day.label}-${index}`}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span className="text-[11px] tabular-nums text-muted">
                {day.cents ? formatMoneyShort(day.cents) : "—"}
              </span>
              <div
                className="w-full rounded-t-card bg-accent/80"
                style={{ height: `${Math.max(2, (day.cents / peak) * 100)}%` }}
              />
              <span className="text-xs font-semibold text-ink-soft">{day.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={`${card} p-4`}>
          <h2 className="text-base font-semibold">Top dishes</h2>
          <p className="mt-0.5 text-xs text-muted">Units sold across all orders</p>
          {stats.topItems.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No orders yet. Nothing to count.</p>
          ) : (
            <ol className="mt-3 divide-y divide-line">
              {stats.topItems.map((item, index) => (
                <li key={item.name} className="flex items-center gap-3 py-2.5">
                  <span className="w-4 text-xs tabular-nums text-muted">{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>
                  <span className="text-sm font-semibold tabular-nums">{item.qty}</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className={`${card} p-4`}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Live queue</h2>
            <span className="text-xs text-muted">Paid, not handed over</span>
          </div>

          {queue.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Nothing on the pass. The wok is cold.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {queue.map((order) => {
                const elapsed = minutesSince(order.createdAt);
                return (
                  <li key={order.ref}>
                    <Link
                      href="/admin/orders"
                      className="-mx-2 flex items-center gap-3 rounded-card px-2 py-2.5 transition hover:bg-sand"
                    >
                      <span className="w-20 font-semibold tabular-nums">{order.ref}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm">{order.customerName}</span>
                        <span className="block text-xs text-muted">
                          {order.slot} · {order.items.length}{" "}
                          {order.items.length === 1 ? "line" : "lines"}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block text-xs text-muted tabular-nums">
                          {formatDateTime(order.createdAt)}
                        </span>
                        <span
                          className={`block text-xs font-semibold tabular-nums ${
                            elapsed >= 30 ? "text-accent" : "text-ink-soft"
                          }`}
                        >
                          {elapsed} min
                        </span>
                      </span>
                      <StatusPill status={order.status} live />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
