"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { setOrderStatusAction, type AdminState } from "@/actions/admin";
import { useCart } from "@/components/AppProviders";
import {
  IconChevronDown,
  IconClock,
  IconInfo,
  IconMail,
  IconPhone,
  IconPin,
  IconSearch,
  IconSpinner,
} from "@/components/Icons";
import { PaymentPill, StatusPill } from "@/components/StatusPill";
import { card, field } from "@/components/ui";
import { formatDateTime, formatMoney } from "@/lib/money";
import { ORDER_STATUS_FLOW, type Order, type OrderStatus } from "@/lib/types";

const statusAction = async (_prev: AdminState, formData: FormData): Promise<AdminState> =>
  setOrderStatusAction(formData);

const tabs: { id: string; label: string; keep: (order: Order) => boolean }[] = [
  { id: "all", label: "All", keep: () => true },
  { id: "pending", label: "Unpaid", keep: (order) => order.status === "pending" },
  { id: "confirmed", label: "In the queue", keep: (order) => order.status === "confirmed" },
  { id: "cooking", label: "Cooking", keep: (order) => order.status === "cooking" },
  { id: "ready", label: "Ready", keep: (order) => order.status === "ready" },
  { id: "completed", label: "Handed over", keep: (order) => order.status === "completed" },
  { id: "cancelled", label: "Cancelled", keep: (order) => order.status === "cancelled" },
];

const actionLabel: Record<OrderStatus, string> = {
  pending: "Send back to unpaid",
  confirmed: "Put in the queue",
  cooking: "Start cooking",
  ready: "Ready on the counter",
  completed: "Handed over",
  cancelled: "Cancel the order",
};

const paymentLabel: Record<Order["paymentMethod"], string> = {
  qris: "QRIS",
  bank_transfer: "Bank transfer",
  ewallet: "E-wallet",
  cash: "Cash at the counter",
};

const statusBtn =
  "inline-flex items-center gap-1.5 rounded-card border border-line bg-shell px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-ink/30 hover:bg-sand disabled:cursor-not-allowed disabled:opacity-60";

function nextStatuses(status: OrderStatus): OrderStatus[] {
  if (status === "completed" || status === "cancelled") return [];
  const index = ORDER_STATUS_FLOW.indexOf(status);
  const out: OrderStatus[] = [];
  if (index >= 0 && index < ORDER_STATUS_FLOW.length - 1) out.push(ORDER_STATUS_FLOW[index + 1]);
  out.push("cancelled");
  return out;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={statusBtn} disabled={pending}>
      {pending ? <IconSpinner size={13} /> : null}
      {pending ? "Working" : label}
    </button>
  );
}

function StatusButton({ orderRef, status }: { orderRef: string; status: OrderStatus }) {
  const [state, formAction] = useActionState(statusAction, {});
  const { notify } = useCart();

  useEffect(() => {
    if (state.error) notify({ title: "Not changed", body: state.error, tone: "warn" });
    else if (state.notice) notify({ title: state.notice, tone: "ok" });
  }, [state, notify]);

  return (
    <form action={formAction}>
      <input type="hidden" name="ref" value={orderRef} />
      <input type="hidden" name="status" value={status} />
      <SubmitButton label={actionLabel[status]} />
    </form>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-right text-sm tabular-nums">{value}</span>
    </div>
  );
}

export function OrdersBoard({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [openRef, setOpenRef] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 20000);
    return () => clearInterval(timer);
  }, [router]);

  const counts = useMemo(
    () => new Map(tabs.map((entry) => [entry.id, orders.filter(entry.keep).length])),
    [orders],
  );

  const visible = useMemo(() => {
    const active = tabs.find((entry) => entry.id === tab) ?? tabs[0];
    const needle = query.trim().toLowerCase();
    return orders
      .filter(active.keep)
      .filter((order) =>
        needle
          ? `${order.ref} ${order.customerName} ${order.customerPhone}`.toLowerCase().includes(needle)
          : true,
      );
  }, [orders, tab, query]);

  return (
    <div className="space-y-4">
      <div className={`${card} p-3`}>
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setTab(entry.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                tab === entry.id ? "bg-ink text-sand" : "bg-sand text-ink-soft hover:bg-line/60"
              }`}
            >
              {entry.label}
              <span className="tabular-nums opacity-70">{counts.get(entry.id) ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch size={16} className="pointer-events-none absolute left-3.5 top-3 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ref, name or phone"
              className={`${field} pl-9`}
              aria-label="Search orders"
            />
          </div>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center justify-center gap-2 rounded-card border border-line bg-shell px-4 py-2.5 text-sm font-semibold transition hover:border-ink/30 hover:bg-sand"
          >
            Refresh
          </button>
          <span className="hidden text-xs text-muted sm:block">Auto-refresh every 20s</span>
        </div>
      </div>

      <div className={`${card} overflow-hidden`}>
        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            No orders match that. Change the tab or clear the search.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((order) => {
              const open = openRef === order.ref;
              const units = order.items.reduce((sum, item) => sum + item.qty, 0);
              return (
                <li key={order.ref}>
                  <button
                    type="button"
                    onClick={() => setOpenRef(open ? null : order.ref)}
                    aria-expanded={open}
                    className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-left transition hover:bg-sand/50"
                  >
                    <span className="w-20 font-semibold tabular-nums">{order.ref}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">
                        {order.customerName}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {order.customerPhone || "No phone on the order"}
                      </span>
                    </span>
                    <span className="inline-flex w-28 items-center gap-1.5 text-xs text-muted tabular-nums">
                      <IconClock size={13} />
                      {order.slot}
                    </span>
                    <span className="w-16 text-right text-xs tabular-nums text-ink-soft">
                      {units} {units === 1 ? "item" : "items"}
                    </span>
                    <span className="w-20 text-right text-sm font-semibold tabular-nums">
                      {formatMoney(order.totalCents)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <StatusPill status={order.status} live />
                      <PaymentPill status={order.paymentStatus} />
                    </span>
                    <span className="w-28 text-right text-xs text-muted tabular-nums">
                      {formatDateTime(order.createdAt)}
                    </span>
                    <IconChevronDown
                      size={16}
                      className={`text-muted transition ${open ? "rotate-180" : ""}`}
                    />
                  </button>

                  {open ? (
                    <div className="animate-rise border-t border-line bg-sand/40 px-4 py-4">
                      <div className="grid gap-5 lg:grid-cols-2">
                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                            What is cooking
                          </h3>
                          <ul className="mt-2 divide-y divide-line">
                            {order.items.map((item, index) => (
                              <li key={`${item.productId}-${index}`} className="flex gap-3 py-2">
                                <span className="w-8 shrink-0 text-sm font-semibold tabular-nums">
                                  {item.qty}×
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm">{item.name}</span>
                                  <span className="block text-xs text-muted">
                                    {item.optionLabels.length
                                      ? item.optionLabels.join(" · ")
                                      : "No options"}
                                  </span>
                                  {item.note ? (
                                    <span className="mt-1 block text-xs text-ink-soft">
                                      Note: {item.note}
                                    </span>
                                  ) : null}
                                </span>
                                <span className="shrink-0 text-sm tabular-nums">
                                  {formatMoney(item.unitPriceCents * item.qty)}
                                </span>
                              </li>
                            ))}
                          </ul>

                          <div className="mt-3 border-t border-line pt-2">
                            <Line label="Subtotal" value={formatMoney(order.subtotalCents)} />
                            {order.deliveryCents ? (
                              <Line label="Delivery" value={formatMoney(order.deliveryCents)} />
                            ) : null}
                            {order.discountCents ? (
                              <Line
                                label={order.promoCode ? `Promo ${order.promoCode}` : "Discount"}
                                value={`−${formatMoney(order.discountCents)}`}
                              />
                            ) : null}
                            <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-line pt-2">
                              <span className="text-sm font-semibold">Total</span>
                              <span className="text-sm font-semibold tabular-nums">
                                {formatMoney(order.totalCents)}
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs text-muted">
                              {paymentLabel[order.paymentMethod]} ·{" "}
                              {order.invoiceNo ? `Invoice ${order.invoiceNo}` : "No invoice yet"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                            Where it goes
                          </h3>
                          <div className="mt-2 space-y-1.5 text-sm">
                            {order.fulfilment === "delivery" ? (
                              <p className="flex items-start gap-2">
                                <IconPin size={15} className="mt-0.5 shrink-0 text-muted" />
                                <span>
                                  {order.address}
                                  <span className="block text-xs text-muted">
                                    Zone: {order.zone || "not set"}
                                  </span>
                                </span>
                              </p>
                            ) : (
                              <p className="flex items-center gap-2">
                                <IconPin size={15} className="shrink-0 text-muted" />
                                Pickup at the counter
                              </p>
                            )}
                            <p className="flex items-center gap-2">
                              <IconPhone size={15} className="shrink-0 text-muted" />
                              {order.customerPhone || "No phone"}
                            </p>
                            <p className="flex items-center gap-2">
                              <IconMail size={15} className="shrink-0 text-muted" />
                              {order.customerEmail || "No email"}
                            </p>
                            {order.note ? (
                              <p className="flex items-start gap-2">
                                <IconInfo size={15} className="mt-0.5 shrink-0 text-muted" />
                                <span>{order.note}</span>
                              </p>
                            ) : null}
                          </div>

                          <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                            Log
                          </h3>
                          <ol className="mt-2 space-y-2">
                            {order.events.map((event, index) => (
                              <li key={`${event.at}-${index}`} className="flex gap-3 text-xs">
                                <span className="w-28 shrink-0 tabular-nums text-muted">
                                  {formatDateTime(event.at)}
                                </span>
                                <span className="min-w-0 flex-1 text-ink-soft">{event.label}</span>
                              </li>
                            ))}
                          </ol>

                          <div className="mt-5 flex flex-wrap gap-2">
                            {nextStatuses(order.status).length === 0 ? (
                              <p className="text-xs text-muted">
                                Closed. Nothing left to move on this order.
                              </p>
                            ) : (
                              nextStatuses(order.status).map((status) => (
                                <StatusButton key={status} orderRef={order.ref} status={status} />
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
