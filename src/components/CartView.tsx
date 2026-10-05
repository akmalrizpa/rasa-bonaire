"use client";

import Link from "next/link";
import { useCart } from "@/components/AppProviders";
import { DishArt } from "@/components/DishArt";
import { IconArrowRight, IconMinus, IconPlus, IconTrash } from "@/components/Icons";
import { btnOutline, btnPrimary, card } from "@/components/ui";
import { shop } from "@/data/shop";
import { formatMoney } from "@/lib/money";
import { promos } from "@/lib/pricing";

const centre = shop.serviceZones[0];

export function CartView({ freeDeliveryFromCents }: { freeDeliveryFromCents: number }) {
  const { items, count, subtotalCents, ready, setQty, remove } = useCart();

  if (!ready) return <CartSkeleton />;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-start gap-5 py-14">
        <DishArt art="noodles" className="h-28 w-28 rounded-card" />
        <div>
          <h1 className="font-display text-3xl">Nothing in the cart yet</h1>
          <p className="mt-2 max-w-md text-sm text-muted">
            Empty cart, empty warmer. The rendang needs two hours, so it is better to pick your
            dishes now and choose a slot at checkout.
          </p>
        </div>
        <Link href="/menu" className={btnPrimary}>
          Open the menu <IconArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <section>
        <header className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
          <h1 className="font-display text-3xl">Your preorder</h1>
          <span className="text-sm text-muted">
            {count} {count === 1 ? "dish" : "dishes"}
          </span>
        </header>

        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.key} className="flex gap-4 py-5">
              <DishArt art={item.art} className="h-24 w-24 shrink-0 rounded-card" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/menu/${item.slug}`}
                      className="text-base font-semibold hover:text-accent"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted">{item.unit}</p>
                    {item.optionLabels.length > 0 ? (
                      <p className="mt-1 text-xs text-muted">{item.optionLabels.join(" · ")}</p>
                    ) : null}
                    {item.note ? (
                      <p className="mt-1 text-xs italic text-muted">
                        Kitchen note: “{item.note}”
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(item.key)}
                    className="rounded-full p-1.5 text-muted transition hover:bg-sand hover:text-accent"
                    aria-label={`Remove ${item.name}`}
                  >
                    <IconTrash size={16} />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1 rounded-card border border-line bg-shell p-1">
                    <button
                      type="button"
                      onClick={() => setQty(item.key, item.qty - 1)}
                      className="grid size-8 place-items-center rounded-[8px] transition hover:bg-sand"
                      aria-label="One less"
                    >
                      <IconMinus size={15} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(item.key, item.qty + 1)}
                      className="grid size-8 place-items-center rounded-[8px] transition hover:bg-sand"
                      aria-label="One more"
                    >
                      <IconPlus size={15} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatMoney(item.priceCents * item.qty)}
                    </p>
                    <p className="text-[11px] text-muted">
                      {formatMoney(item.priceCents)} each
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-line pt-5">
          <Link href="/menu" className={btnOutline}>
            Add more dishes
          </Link>
        </div>
      </section>

      <aside className={`${card} h-fit p-5 lg:sticky lg:top-32`}>
        <h2 className="font-display text-xl">Before you pay</h2>

        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex items-baseline justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-semibold tabular-nums">{formatMoney(subtotalCents)}</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-muted">Delivery</dt>
            <dd className="text-right text-xs text-muted">Calculated at checkout per zone</dd>
          </div>
        </dl>

        <p className="mt-4 rounded-card bg-sand px-3.5 py-3 text-xs text-ink-soft">
          Delivery in Kralendijk {formatMoney(centre.feeCents)}, free over{" "}
          {formatMoney(freeDeliveryFromCents)}. Nikiboko, Tera Kora, Hato, Sabadeco and Rincon
          cost a little more.
        </p>

        <div className="mt-5 border-t border-line pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Promo codes
          </p>
          <p className="mt-2 text-xs text-muted">
            Enter the code on the checkout page, just above the pay button.
          </p>
          <ul className="mt-3 space-y-2 text-xs">
            {promos.map((promo) => (
              <li key={promo.code} className="flex items-baseline gap-2">
                <span className="rounded-card border border-line bg-sand px-2 py-0.5 font-semibold tracking-wide">
                  {promo.code}
                </span>
                <span className="text-muted">
                  {promo.label}
                  {promo.minSubtotalCents > 0
                    ? `, from ${formatMoney(promo.minSubtotalCents)}`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-muted">
            One code per order, and the subtotal has to clear the minimum before the discount lands.
          </p>
        </div>

        <div className="mt-6 space-y-2">
          <Link href="/checkout" className={`${btnPrimary} w-full py-3`}>
            Continue to checkout <IconArrowRight size={16} />
          </Link>
          <Link href="/menu" className={`${btnOutline} w-full`}>
            Add more dishes
          </Link>
        </div>

        <p className="mt-3 text-[11px] text-muted">
          We cook only what was ordered, so nothing is charged until the last step.
        </p>
      </aside>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
      <section>
        <div className="skeleton h-8 w-48 rounded-card" />
        <ul className="mt-5 space-y-5">
          {[0, 1, 2].map((row) => (
            <li key={row} className="flex gap-4">
              <div className="skeleton h-24 w-24 shrink-0 rounded-card" />
              <div className="flex-1 space-y-3">
                <div className="skeleton h-4 w-1/3 rounded-card" />
                <div className="skeleton h-3 w-1/2 rounded-card" />
                <div className="skeleton h-8 w-32 rounded-card" />
              </div>
            </li>
          ))}
        </ul>
      </section>
      <aside className={`${card} h-fit p-5`}>
        <div className="skeleton h-5 w-32 rounded-card" />
        <div className="mt-5 space-y-3">
          <div className="skeleton h-4 w-full rounded-card" />
          <div className="skeleton h-4 w-2/3 rounded-card" />
          <div className="skeleton h-20 w-full rounded-card" />
          <div className="skeleton h-11 w-full rounded-card" />
        </div>
      </aside>
    </div>
  );
}
