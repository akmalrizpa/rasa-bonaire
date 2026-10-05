import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { IconArrowRight } from "@/components/Icons";
import { LogoMark } from "@/components/Logo";
import { PrintButton } from "@/components/PrintButton";
import { PaymentPill } from "@/components/StatusPill";
import { pageShell } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { formatDateTime, formatMoney } from "@/lib/money";
import { getOrderByRef, getSettings } from "@/lib/store";
import type { PaymentMethod } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoice",
  description: "Printable receipt for one Rasa Bonaire preorder.",
};

const methodLabel: Record<PaymentMethod, string> = {
  qris: "QRIS",
  bank_transfer: "Bank transfer",
  ewallet: "Rasa Pay wallet",
  cash: "Cash at the counter",
};

export default async function InvoicePage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const order = await getOrderByRef(ref);
  if (!order) notFound();

  const user = await currentUser();
  if (order.userId && order.userId !== user?.id && user?.role !== "admin") {
    redirect(`/login?next=/orders/${ref}/invoice`);
  }

  const settings = await getSettings();
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className={`${pageShell} py-10`}>
      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/orders/${order.ref}`}
          className="text-sm font-semibold text-muted transition hover:text-ink"
        >
          ← Back to the order
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-3xl rounded-card border border-line bg-shell p-8 print:border-0 print:p-0">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-6">
          <div className="flex items-start gap-3">
            <LogoMark size={40} />
            <div>
              <p className="font-display text-xl leading-tight">Rasa Bonaire B.V.</p>
              <p className="mt-1 text-xs text-muted">
                Kaya Grandi 24, Kralendijk, Bonaire
                <br />
                Caribbean Netherlands · +599 717 0240
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Invoice</p>
            <p className="mt-1 font-display text-lg tracking-tight">
              {order.invoiceNo ?? "Not issued yet"}
            </p>
            <p className="mt-1 text-xs text-muted">Order {order.ref}</p>
            <p className="text-xs text-muted">Placed {formatDateTime(order.createdAt)}</p>
          </div>
        </header>

        <section className="grid gap-6 border-b border-line py-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Billed to</p>
            <p className="mt-2 text-sm font-semibold">{order.customerName}</p>
            <p className="text-xs text-muted">{order.customerPhone}</p>
            {order.customerEmail ? (
              <p className="text-xs text-muted">{order.customerEmail}</p>
            ) : null}
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              {order.fulfilment === "pickup" ? "Pickup at" : "Delivered to"}
            </p>
            <p className="mt-2 text-sm font-semibold">
              {order.fulfilment === "pickup" ? settings.pickupAddress : order.address}
            </p>
            <p className="text-xs text-muted">
              {order.fulfilment === "pickup" ? "Pickup" : "Delivery"} slot {order.slot}
            </p>
            {order.fulfilment === "delivery" && order.zone ? (
              <p className="text-xs text-muted">Zone: {order.zone}</p>
            ) : null}
          </div>
        </section>

        <section className="py-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-[0.14em] text-muted">
                <th className="pb-2 font-semibold">Dish</th>
                <th className="pb-2 text-right font-semibold">Unit</th>
                <th className="pb-2 text-right font-semibold">Qty</th>
                <th className="pb-2 text-right font-semibold">Line</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {order.items.map((item, index) => (
                <tr key={`${item.productId}-${index}`}>
                  <td className="py-3 pr-4 align-top">
                    <span className="font-medium">{item.name}</span>
                    {item.optionLabels.length > 0 ? (
                      <span className="mt-0.5 block text-xs text-muted">
                        {item.optionLabels.join(" · ")}
                      </span>
                    ) : null}
                    {item.note ? (
                      <span className="mt-0.5 block text-xs italic text-muted">“{item.note}”</span>
                    ) : null}
                  </td>
                  <td className="py-3 text-right align-top tabular-nums">
                    {formatMoney(item.unitPriceCents)}
                  </td>
                  <td className="py-3 text-right align-top tabular-nums">{item.qty}</td>
                  <td className="py-3 text-right align-top font-medium tabular-nums">
                    {formatMoney(item.unitPriceCents * item.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </section>

        <section className="grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
          <div className="order-2 sm:order-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Payment</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium">
              {methodLabel[order.paymentMethod]} <PaymentPill status={order.paymentStatus} />
            </p>
            <p className="mt-1 text-xs text-muted">
              {order.paidAt
                ? `Marked paid ${formatDateTime(order.paidAt)}.`
                : order.paymentMethod === "cash"
                  ? "Cash is taken at the counter when you collect."
                  : "Waiting for the payment to land."}
            </p>
            <p className="mt-4 text-xs text-muted">
              Batch {order.serviceDate} · {itemCount} {itemCount === 1 ? "dish" : "dishes"}
            </p>
          </div>

          <dl className="order-1 space-y-2 text-sm sm:order-2">
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
        </section>

        <footer className="mt-8 border-t border-line pt-5">
          <p className="text-xs text-muted">
            This is a demo receipt from a test shop. No payment provider was involved, no card was
            charged, and nothing here is a valid tax document.
          </p>
          <p className="mt-2 text-xs text-muted">
            Questions about this batch: {settings.pickupAddress}. {settings.prepNote}
          </p>
          <Link
            href="/menu"
            className="no-print mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent"
          >
            Order again <IconArrowRight size={15} />
          </Link>
        </footer>
      </article>
    </div>
  );
}
