"use client";

import Link from "next/link";
import { useCart } from "@/components/AppProviders";
import { DishArt } from "@/components/DishArt";
import { IconArrowRight, IconClose, IconMinus, IconPlus, IconTrash } from "@/components/Icons";
import { btnOutline, btnPrimary } from "@/components/ui";
import { formatMoney } from "@/lib/money";

export function CartDrawer() {
  const { items, drawerOpen, closeDrawer, setQty, remove, subtotalCents } = useCart();

  if (!drawerOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeDrawer}
        className="animate-scrim fixed inset-0 z-[60] cursor-default bg-ink/40 backdrop-blur-[2px]"
      />
      <aside className="animate-drawer fixed inset-y-0 right-0 z-[61] flex w-full max-w-md flex-col border-l border-line bg-sand shadow-pop">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-xl">Your preorder</h2>
            <p className="text-xs text-muted">
              {items.length === 0
                ? "Nothing in here yet"
                : `${items.length} ${items.length === 1 ? "line" : "lines"} · paid at checkout`}
            </p>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="rounded-full border border-line p-2 transition hover:bg-shell"
            aria-label="Close"
          >
            <IconClose size={16} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <DishArt art="plate" className="h-28 w-28 rounded-card" />
            <p className="text-sm text-muted">
              An empty cart on Bonaire is a wasted afternoon. Start with the rendang, it never
              disappoints.
            </p>
            <Link href="/menu" onClick={closeDrawer} className={btnPrimary}>
              Open the menu
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3 py-4">
                  <DishArt art={item.art} className="h-16 w-16 shrink-0 rounded-card" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.name}</p>
                        {item.optionLabels.length > 0 ? (
                          <p className="mt-0.5 text-xs text-muted">{item.optionLabels.join(" · ")}</p>
                        ) : null}
                        {item.note ? (
                          <p className="mt-0.5 text-xs italic text-muted">“{item.note}”</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.key)}
                        className="rounded-full p-1.5 text-muted transition hover:bg-shell hover:text-accent"
                        aria-label={`Remove ${item.name}`}
                      >
                        <IconTrash size={15} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-card border border-line bg-shell p-1">
                        <button
                          type="button"
                          onClick={() => setQty(item.key, item.qty - 1)}
                          className="grid size-7 place-items-center rounded-[8px] transition hover:bg-sand"
                          aria-label="One less"
                        >
                          <IconMinus size={14} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(item.key, item.qty + 1)}
                          className="grid size-7 place-items-center rounded-[8px] transition hover:bg-sand"
                          aria-label="One more"
                        >
                          <IconPlus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">
                        {formatMoney(item.priceCents * item.qty)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line bg-shell px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-display text-xl tabular-nums">{formatMoney(subtotalCents)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Delivery fee and promo code are handled at checkout.
              </p>
              <div className="mt-4 flex gap-2">
                <Link href="/cart" onClick={closeDrawer} className={`${btnOutline} flex-1`}>
                  Review cart
                </Link>
                <Link href="/checkout" onClick={closeDrawer} className={`${btnPrimary} flex-1`}>
                  Checkout <IconArrowRight size={16} />
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
