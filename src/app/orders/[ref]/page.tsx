import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { IconCheck, IconPin, IconReceipt } from "@/components/Icons";
import { OrderTracker } from "@/components/OrderTracker";
import { PaymentPill, StatusPill } from "@/components/StatusPill";
import { btnOutline, card, pageShell } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { formatDateTime, formatMoney } from "@/lib/money";
import { getOrderByRef, getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order status",
  description: "Live kitchen status for one preorder, plus the receipt for the batch.",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const { ref } = await params;
  const { paid } = await searchParams;
  const order = await getOrderByRef(ref);
  if (!order) notFound();

  const user = await currentUser();
  if (order.userId && order.userId !== user?.id && user?.role !== "admin") {
    redirect(`/login?next=/orders/${ref}`);
  }

  const settings = await getSettings();
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className={`${pageShell} py-10`}>
      {paid === "1" ? (
        <div className="mb-6 flex items-start gap-3 rounded-card bg-ok-soft px-4 py-3.5">
          <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-ok text-white">
            <IconCheck size={14} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ok">Payment received, {order.customerName}</p>
            <p className="text-xs text-ok/85">
              The kitchen has your order in the queue. Keep this page open, the status below updates
              itself.
            </p>
          </div>
        </div>
      ) : null}

      <header className={`${card} p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Preorder
            </p>
            <h1 className="mt-1 font-display text-3xl tracking-tight">{order.ref}</h1>
            <p className="mt-1 text-xs text-muted">Placed {formatDateTime(order.createdAt)}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={order.status} live />
            <PaymentPill status={order.paymentStatus} />
          </div>

          <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {order.fulfilment === "pickup" ? "Pickup slot" : "Delivery slot"}
              </dt>
              <dd className="mt-0.5 font-medium">{order.slot}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {order.fulfilment === "pickup" ? "Collect at" : "Deliver to"}
              </dt>
              <dd className="mt-0.5 max-w-64 font-medium">
                {order.fulfilment === "pickup" ? settings.pickupAddress : order.address}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Total</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{formatMoney(order.totalCents)}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="mt-8">
        <OrderTracker order={order} />
      </div>

      <section className={`${card} mt-8`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl">What is in the bag</h2>
          <span className="text-xs text-muted">
            {itemCount} {itemCount === 1 ? "dish" : "dishes"}
          </span>
        </div>

        <ul className="divide-y divide-line px-5">
          {order.items.map((item, index) => (
            <li key={`${item.productId}-${index}`} className="flex items-start gap-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  <span className="text-muted">{item.qty}× </span>
                  {item.name}
                </p>
                {item.optionLabels.length > 0 ? (
                  <p className="mt-0.5 text-xs text-muted">{item.optionLabels.join(" · ")}</p>
                ) : null}
                {item.note ? (
                  <p className="mt-0.5 text-xs italic text-muted">Note: “{item.note}”</p>
                ) : null}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums">
                  {formatMoney(item.unitPriceCents * item.qty)}
                </p>
                <p className="text-[11px] text-muted">{formatMoney(item.unitPriceCents)} each</p>
              </div>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-line px-5 py-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="tabular-nums">{formatMoney(order.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Delivery</dt>
            <dd className="tabular-nums">
              {order.fulfilment === "delivery" ? formatMoney(order.deliveryCents) : "Pickup"}
            </dd>
          </div>
          {order.discountCents > 0 ? (
            <div className="flex justify-between text-ok">
              <dt>Discount {order.promoCode ? `(${order.promoCode})` : ""}</dt>
              <dd className="tabular-nums">−{formatMoney(order.discountCents)}</dd>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between border-t border-line pt-2.5">
            <dt className="text-muted">Total</dt>
            <dd className="font-display text-2xl tabular-nums">{formatMoney(order.totalCents)}</dd>
          </div>
        </dl>

        {order.note ? (
          <p className="border-t border-line px-5 py-4 text-xs text-muted">
            Note for the kitchen: “{order.note}”
          </p>
        ) : null}
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link href={`/orders/${order.ref}/invoice`} className={btnOutline}>
          <IconReceipt size={16} /> Invoice and receipt
        </Link>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <IconPin size={14} /> {settings.pickupAddress}
        </p>
      </div>
      <p className="mt-3 max-w-2xl text-xs text-muted">{settings.prepNote}</p>
    </div>
  );
}
