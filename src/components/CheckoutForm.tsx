"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { placeOrderAction, type CheckoutState } from "@/actions/orders";
import { useCart } from "@/components/AppProviders";
import { DishArt } from "@/components/DishArt";
import {
  IconArrowRight,
  IconBike,
  IconBox,
  IconCheck,
  IconBank,
  IconQr,
  IconSpinner,
  IconWallet,
} from "@/components/Icons";
import { btnOutline, btnPrimary, card, field, label, pill } from "@/components/ui";
import { useNearBottom } from "@/components/useNearBottom";
import { shop } from "@/data/shop";
import { formatDay, formatMoney } from "@/lib/money";
import { deliveryFeeCents, resolvePromo } from "@/lib/pricing";
import type { PaymentMethod, PublicUser, Settings } from "@/lib/types";
import type { Slot } from "@/lib/slots";

const paymentOptions: { id: PaymentMethod; title: string; blurb: string; icon: typeof IconQr }[] = [
  {
    id: "qris",
    title: "QRIS",
    blurb: "Scan the code on the next screen. It is a test code, no money moves.",
    icon: IconQr,
  },
  {
    id: "bank_transfer",
    title: "Bank transfer",
    blurb: "We show a virtual account and the exact amount. Transfers are checked by hand.",
    icon: IconBank,
  },
  {
    id: "ewallet",
    title: "Rasa Pay wallet",
    blurb: "A stand-in wallet with a fake balance. Nothing leaves your real account.",
    icon: IconWallet,
  },
  {
    id: "cash",
    title: "Cash at the counter",
    blurb: "Pay when you collect at Kaya Grandi 24. The slot is held either way.",
    icon: IconBox,
  },
];

const initial: CheckoutState = {};

export function CheckoutForm({
  user,
  settings,
  slots,
}: {
  user: PublicUser | null;
  settings: Settings;
  slots: Slot[];
}) {
  const { items, ready } = useCart();
  const nearBottom = useNearBottom();
  const [state, formAction] = useActionState(placeOrderAction, initial);

  const [fulfilment, setFulfilment] = useState<"pickup" | "delivery">("pickup");
  const [zone, setZone] = useState(shop.serviceZones[0].id);
  const [slotId, setSlotId] = useState("");
  const [promo, setPromo] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qris");

  const catering =
    fulfilment === "delivery" ? slots.filter((s) => s.kind === "delivery") : slots.filter((s) => s.kind === "pickup");
  const firstSlot = catering[0]?.id ?? "";
  const chosenSlot = catering.find((slot) => slot.id === slotId) ?? catering[0];

  const lines = useMemo(
    () => items.map((item) => ({ productId: item.productId, qty: item.qty, optionIds: item.optionIds, note: item.note })),
    [items],
  );

  const priced = useMemo(
    () =>
      items.map((item) => ({
        item,
        lineTotalCents: item.priceCents * item.qty,
        unitPriceCents: item.priceCents,
      })),
    [items],
  );

  const totals = useMemo(() => {
    const subtotal = priced.reduce((sum, line) => sum + line.lineTotalCents, 0);
    const deliveryCents =
      fulfilment === "delivery" && subtotal > 0 ? deliveryFeeCents(zone, settings, subtotal) : 0;
    const resolved = resolvePromo(promo, subtotal);
    return {
      subtotalCents: subtotal,
      deliveryCents,
      discountCents: resolved.discountCents,
      totalCents: Math.max(0, subtotal + deliveryCents - resolved.discountCents),
      message: resolved.message,
    };
  }, [fulfilment, priced, promo, settings, zone]);

  if (!ready) {
    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="skeleton h-96 rounded-card" />
        <div className="skeleton h-72 rounded-card" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`${card} max-w-xl p-7`}>
        <DishArt art="stew" className="h-24 w-24 rounded-card" />
        <h2 className="mt-4 font-display text-2xl">There is nothing to check out</h2>
        <p className="mt-2 text-sm text-muted">
          Your cart is empty, so there is no slot to lock. Pick a few dishes first and come back.
        </p>
        <Link href="/menu" className={`${btnPrimary} mt-5`}>
          Open the menu <IconArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const cartJson = JSON.stringify(lines);
  const deliveryLabel = fulfilment === "delivery" ? "Delivery" : "Pickup";

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <input type="hidden" name="cart" value={cartJson} />

      <div className="space-y-8">
        {state.error ? (
          <p className="rounded-card bg-warn-soft px-4 py-3 text-sm font-medium text-warn" role="alert">
            {state.error}
          </p>
        ) : null}

        <section className={card}>
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-xl">Who is collecting</h2>
            <p className="text-xs text-muted">We call this number when the batch is packed.</p>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label} htmlFor="customerName">
                Full name
              </label>
              <input
                id="customerName"
                name="customerName"
                required
                defaultValue={user?.name ?? ""}
                placeholder="Marisol Croes"
                className={`${field} mt-2`}
              />
            </div>
            <div>
              <label className={label} htmlFor="customerPhone">
                Phone
              </label>
              <input
                id="customerPhone"
                name="customerPhone"
                required
                inputMode="tel"
                defaultValue={user?.phone ?? ""}
                placeholder="+599 780 1122"
                className={`${field} mt-2`}
              />
            </div>
            <div>
              <label className={label} htmlFor="customerEmail">
                Email <span className="normal-case tracking-normal text-muted">(optional)</span>
              </label>
              <input
                id="customerEmail"
                name="customerEmail"
                type="email"
                defaultValue={user?.email ?? ""}
                placeholder="you@example.com"
                className={`${field} mt-2`}
              />
            </div>
          </div>
        </section>

        <section className={card}>
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-xl">Pickup or delivery</h2>
            <p className="text-xs text-muted">
              Delivery runs across Kralendijk, Nikiboko, Hato, Sabadeco and Rincon.
            </p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {(["pickup", "delivery"] as const).map((option) => {
              const active = fulfilment === option;
              const Icon = option === "pickup" ? IconBox : IconBike;
              return (
                <label
                  key={option}
                  className={`flex cursor-pointer gap-3 rounded-card border p-4 transition ${
                    active ? "border-accent bg-accent-soft" : "border-line hover:border-ink/25"
                  }`}
                >
                  <input
                    type="radio"
                    name="fulfilment"
                    value={option}
                    checked={active}
                    onChange={() => setFulfilment(option)}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-card ${
                      active ? "bg-accent text-white" : "bg-sand text-ink-soft"
                    }`}
                  >
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold capitalize">{option}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {option === "pickup"
                        ? "Collect at Kaya Grandi 24 inside your slot."
                        : "We ride it over warm, extra fee by zone."}
                    </span>
                  </span>
                  {active ? <IconCheck size={16} className="ml-auto text-accent" /> : null}
                </label>
              );
            })}
          </div>

          {fulfilment === "delivery" ? (
            <div className="grid gap-4 border-t border-line p-5 sm:grid-cols-2">
              <div>
                <label className={label} htmlFor="zone">
                  Delivery zone
                </label>
                <select
                  id="zone"
                  name="zone"
                  value={zone}
                  onChange={(event) => setZone(event.target.value)}
                  className={`${field} mt-2`}
                >
                  {shop.serviceZones.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name} — {formatMoney(entry.feeCents)}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-[11px] text-muted">
                  Free over {formatMoney(settings.freeDeliveryFromCents)} of food.
                </p>
              </div>
              <div>
                <label className={label} htmlFor="address">
                  Street and house number
                </label>
                <input
                  id="address"
                  name="address"
                  required
                  placeholder="Kaya Nikiboko Noord 12"
                  className={`${field} mt-2`}
                />
              </div>
            </div>
          ) : null}
        </section>

        <section className={card}>
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-xl">Batch slot</h2>
            <p className="text-xs text-muted">
              {catering[0]
                ? `${formatDay(`${catering[0].serviceDate}T12:00:00Z`)}, thirty minute windows.`
                : "No slots are open for this option right now."}
            </p>
          </div>
          <div className="p-5">
            <label className={label} htmlFor="slot">
              {fulfilment === "pickup" ? "Pickup window" : "Delivery window"}
            </label>
            <select
              key={fulfilment}
              id="slot"
              name="slot"
              required
              disabled={!firstSlot}
              defaultValue={firstSlot}
              onChange={(event) => setSlotId(event.target.value)}
              className={`${field} mt-2 disabled:opacity-60`}
            >
              {catering.length === 0 ? (
                <option value="">Preorder for this option is closed today</option>
              ) : null}
              {catering.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {fulfilment === "pickup" ? "Pickup " : "Delivery "}
                  {slot.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[11px] text-muted">
              Miss the window by more than 30 minutes and the food goes to the staff table.
            </p>
          </div>
        </section>

        <section className={card}>
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-xl">Note for the kitchen</h2>
            <p className="text-xs text-muted">
              Allergies, no shrimp paste, cutlery, a birthday plate — we read all of it.
            </p>
          </div>
          <div className="p-5">
            <label className={label} htmlFor="note">
              Anything we should know
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              maxLength={400}
              placeholder="No sambal on the sate, two extra krupuk…"
              className={`${field} mt-2 resize-none`}
            />
          </div>
        </section>

        <section className={card}>
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-xl">How you pay</h2>
            <p className="text-xs text-muted">
              This is a demo shop. Every method below is simulated and no money moves.
            </p>
          </div>
          <div className="grid gap-3 p-5">
            {paymentOptions.map((option) => {
              const active = paymentMethod === option.id;
              const Icon = option.icon;
              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-card border p-4 transition ${
                    active ? "border-accent bg-accent-soft" : "border-line hover:border-ink/25"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.id}
                    checked={active}
                    onChange={() => setPaymentMethod(option.id)}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-card ${
                      active ? "bg-accent text-white" : "bg-sand text-ink-soft"
                    }`}
                  >
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{option.title}</span>
                    <span className="mt-0.5 block text-xs text-muted">{option.blurb}</span>
                  </span>
                </label>
              );
            })}
          </div>

          <div className="border-t border-line p-5">
            <label className={label} htmlFor="promoCode">
              Promo code
            </label>
            <input
              id="promoCode"
              name="promoCode"
              value={promo}
              onChange={(event) => setPromo(event.target.value.toUpperCase().slice(0, 16))}
              placeholder="RASA10"
              className={`${field} mt-2 uppercase`}
            />
            {totals.message ? (
              <p
                className={`mt-2 text-xs font-medium ${
                  totals.discountCents > 0 ? "text-ok" : "text-warn"
                }`}
              >
                {totals.message}
              </p>
            ) : (
              <p className="mt-2 text-[11px] text-muted">
                RASA10 takes 10% off from $20. PICKUP5 takes $5 off from $30.
              </p>
            )}
          </div>
        </section>
      </div>

      <aside className="space-y-4 pb-28 lg:sticky lg:top-32 lg:h-fit lg:pb-0">
        <div className={`${card} p-5`}>
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl">Your order</h2>
            <span className={`${pill} bg-sand text-ink-soft`}>{deliveryLabel}</span>
          </div>

          <ul className="mt-4 space-y-3 border-t border-line pt-4">
            {priced.map(({ item }) => (
              <li key={item.key} className="flex items-start gap-3">
                <DishArt art={item.art} className="h-12 w-12 shrink-0 rounded-card" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    <span className="text-muted">{item.qty}× </span>
                    {item.name}
                  </p>
                  {item.optionLabels.length > 0 ? (
                    <p className="truncate text-[11px] text-muted">{item.optionLabels.join(" · ")}</p>
                  ) : null}
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {formatMoney(item.priceCents * item.qty)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(totals.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{deliveryLabel}</dt>
              <dd className="tabular-nums">
                {fulfilment === "delivery"
                  ? totals.deliveryCents === 0
                    ? "Free"
                    : formatMoney(totals.deliveryCents)
                  : formatMoney(0)}
              </dd>
            </div>
            {totals.discountCents > 0 ? (
              <div className="flex justify-between text-ok">
                <dt>Discount</dt>
                <dd className="tabular-nums">−{formatMoney(totals.discountCents)}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-sm text-muted">Total</span>
            <span className="font-display text-2xl tabular-nums">{formatMoney(totals.totalCents)}</span>
          </div>

          <p className="mt-3 text-[11px] text-muted">
            Vendors only get line ids and quantities. The kitchen recalculates every price on the
            server before the order is written.
          </p>
        </div>

        <div className={`${card} p-5`}>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Slot</p>
          <p className="mt-1.5 text-sm font-semibold">
            {fulfilment === "pickup" ? "Pickup at Kaya Grandi 24" : "Delivery to your street"}
          </p>
          <p className="text-xs text-muted">
            {chosenSlot ? chosenSlot.label : "No window open for this option today."}
          </p>
          <p className="mt-3 text-[11px] text-muted">
            Preorder closes at 15:00 for the same evening batch.
          </p>
        </div>

        {/* Follows the thumb on a phone, sits in the sidebar from lg up. */}
        <div
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-sand/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-200 lg:static lg:translate-y-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none ${
            nearBottom ? "translate-y-full" : ""
          }`}
        >
          <SubmitButton total={totals.totalCents} disabled={!firstSlot} />
        </div>

        <Link href="/cart" className={`${btnOutline} hidden w-full lg:inline-flex`}>
          Back to the cart
        </Link>
      </aside>
    </form>
  );
}

function SubmitButton({ total, disabled }: { total: number; disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <div>
      <button type="submit" disabled={pending || disabled} className={`${btnPrimary} w-full py-3.5`}>
        {pending ? (
          <>
            <IconSpinner size={16} /> Sending it to the kitchen…
          </>
        ) : (
          `Pay ${formatMoney(total)} and lock the slot`
        )}
      </button>
      <p className="mt-2 text-center text-[11px] text-muted">
        The next screen shows the payment. Nothing is charged for real.
      </p>
    </div>
  );
}
