"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconCheck, IconClock, IconFlame, IconInfo, IconReceipt } from "@/components/Icons";
import { btnPrimary, card } from "@/components/ui";
import { formatDateTime } from "@/lib/money";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL, type Order, type OrderEvent, type OrderStatus, type PaymentStatus } from "@/lib/types";

type Snapshot = {
  ref: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  updatedAt: string;
  slot: string;
  events: OrderEvent[];
};

const POLL_MS = 5000;

export function OrderTracker({ order }: { order: Order }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.paymentStatus);
  const [slot, setSlot] = useState(order.slot);
  const [events, setEvents] = useState<OrderEvent[]>(order.events);
  const [checkedAt, setCheckedAt] = useState(order.updatedAt);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
      try {
        const response = await fetch(`/api/orders/${order.ref}/status`, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as Snapshot;
        if (!alive) return;
        setStatus(data.status);
        setPaymentStatus(data.paymentStatus);
        setSlot(data.slot || order.slot);
        setEvents(data.events ?? []);
        setCheckedAt(data.updatedAt);
      } catch {
        /* a dropped poll should not wipe the timeline the guest is reading */
      }
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    const start = () => {
      stop();
      timer = setInterval(poll, POLL_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void poll();
        start();
      } else {
        stop();
      }
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      alive = false;
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [order.ref, order.slot]);

  if (status === "cancelled") {
    return (
      <section className={`${card} p-6`}>
        <h2 className="flex items-center gap-2 font-display text-xl text-warn">
          <IconInfo size={18} /> This preorder was cancelled
        </h2>
        <p className="mt-3 max-w-xl text-sm text-ink-soft">
          Order {order.ref} is off the board, so the kitchen is not cooking it. Nothing was handed
          over at the counter and no refund is pending.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/menu" className={btnPrimary}>
            <IconReceipt size={16} /> Start a new preorder
          </Link>
          <Link
            href={`/orders/${order.ref}/invoice`}
            className="inline-flex items-center gap-2 rounded-card border border-line bg-shell px-4 py-2.5 text-sm font-semibold"
          >
            See the invoice
          </Link>
        </div>
      </section>
    );
  }

  const currentIndex = Math.max(0, ORDER_STATUS_FLOW.indexOf(status));
  const current = ORDER_STATUS_FLOW[currentIndex];
  const ready = status === "ready" || status === "completed";
  const live = status === "cooking";
  const lastEvent = events[events.length - 1];

  return (
    <section className={`${card} p-6`}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-xl">In the kitchen</h2>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <IconClock size={13} /> checked {formatDateTime(checkedAt)}
            </span>
          </div>

          <p className="mt-2 text-sm text-ink-soft">
            {live
              ? "Rasa is on it. The wok is going and the sambal was ground this morning."
              : ORDER_STATUS_LABEL[current]}
          </p>

          <ol className="mt-6">
            {ORDER_STATUS_FLOW.map((step, index) => {
              const done = index < currentIndex;
              const isCurrent = index === currentIndex;
              const isLast = index === ORDER_STATUS_FLOW.length - 1;
              return (
                <li key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-full border text-[11px] font-bold ${
                        done
                          ? "border-ok bg-ok text-white"
                          : isCurrent
                            ? "animate-ring border-accent bg-accent text-white"
                            : "border-line bg-shell text-muted"
                      }`}
                    >
                      {done ? <IconCheck size={14} /> : index + 1}
                    </span>
                    {!isLast ? (
                      <span
                        className={`my-1 w-px flex-1 ${done ? "bg-ok/40" : "bg-line"}`}
                        aria-hidden="true"
                      />
                    ) : null}
                  </div>
                  <div className={isLast ? "pb-0" : "pb-6"}>
                    <p
                      className={`text-sm ${isCurrent ? "font-semibold text-accent" : done ? "font-medium" : "text-muted"}`}
                    >
                      {ORDER_STATUS_LABEL[step]}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {step === "pending"
                        ? "We wait for the payment before the dish enters the batch."
                        : step === "confirmed"
                          ? "Your dish is written on the batch sheet."
                          : step === "cooking"
                            ? "Wok on, roughly 20 to 30 minutes depending on the dish."
                            : step === "ready"
                              ? "Packed and waiting for you under the warmer."
                              : "Handed over at the counter. Terima kasih."}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="space-y-4">
          <div className="rounded-card bg-sand px-4 py-3.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {ready ? <IconCheck size={13} /> : <IconFlame size={13} />}
              {ready ? "Ready" : "Batch slot"}
            </p>
            <p className="mt-1 text-sm font-medium">{slot}</p>
            <p className="mt-1 text-xs text-muted">
              {status === "completed"
                ? "This order left the counter."
                : ready
                  ? "Come to Kaya Grandi 24 and give the ref at the counter."
                  : "We aim to have it packed at the start of that window."}
            </p>
          </div>

          <div className="rounded-card border border-line">
            <p className="border-b border-line px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Kitchen log
            </p>
            <ol className="max-h-64 space-y-3 overflow-y-auto px-4 py-3.5">
              {events.map((event, index) => (
                <li key={`${event.at}-${index}`} className="flex gap-3">
                  <span
                    className={`mt-1.5 size-1.5 shrink-0 rounded-full ${
                      event.kind === "payment"
                        ? "bg-ok"
                        : event.kind === "note"
                          ? "bg-warn"
                          : "bg-accent"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium">{event.label}</p>
                    <p className="text-[11px] text-muted">{formatDateTime(event.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="border-t border-line px-4 py-2.5 text-[11px] text-muted">
              Last update: {lastEvent ? lastEvent.label : "nothing yet"}
            </p>
          </div>

          {paymentStatus === "unpaid" ? (
            <div className="rounded-card bg-warn-soft px-4 py-3.5">
              <p className="text-sm font-semibold text-warn">This order is not paid yet</p>
              <p className="mt-1 text-xs text-warn/90">
                The kitchen holds the slot for 15 minutes after the order was placed.
              </p>
              <Link href={`/pay/${order.ref}`} className={`${btnPrimary} mt-3`}>
                Pay now
              </Link>
            </div>
          ) : null}

          {paymentStatus === "failed" ? (
            <p className="rounded-card bg-accent-soft px-4 py-3.5 text-xs font-medium text-accent">
              The last payment attempt failed. Try the payment page again and the kitchen will pick
              the order up as soon as it lands.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
