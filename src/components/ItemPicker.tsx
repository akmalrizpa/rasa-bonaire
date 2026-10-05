"use client";

import { useMemo, useRef, useState } from "react";
import { useCart } from "@/components/AppProviders";
import { IconCheck, IconMinus, IconPlus } from "@/components/Icons";
import { btnPrimary, field, label as labelClass } from "@/components/ui";
import { useNearBottom } from "@/components/useNearBottom";
import { formatMoney } from "@/lib/money";
import { priceLine } from "@/lib/pricing";
import type { Product } from "@/lib/types";

export function ItemPicker({ product }: { product: Product }) {
  const { add, openDrawer } = useCart();
  const nearBottom = useNearBottom();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [selection, setSelection] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    for (const group of product.optionGroups) {
      initial[group.id] =
        group.kind === "single" && group.required
          ? [group.defaultOptionId ?? group.options[0]?.id].filter(Boolean)
          : [];
    }
    return initial;
  });

  const flatIds = useMemo(() => Object.values(selection).flat(), [selection]);
  const pricing = useMemo(() => priceLine(product, flatIds, qty), [product, flatIds, qty]);
  const unitPrice = pricing.ok ? pricing.unitPriceCents : product.priceCents;
  const total = unitPrice * qty;

  const toggle = (groupId: string, optionId: string, kind: "single" | "multi") => {
    setSelection((current) => {
      const chosen = current[groupId] ?? [];
      if (kind === "single") return { ...current, [groupId]: [optionId] };
      return {
        ...current,
        [groupId]: chosen.includes(optionId)
          ? chosen.filter((id) => id !== optionId)
          : [...chosen, optionId],
      };
    });
  };

  const addToCart = (from?: HTMLElement | null) => {
    if (!pricing.ok) return;
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unit: product.unit,
        priceCents: unitPrice,
        qty,
        optionIds: flatIds,
        optionLabels: pricing.optionLabels,
        note: note.trim() || undefined,
        art: product.art,
      },
      { flyFrom: from ?? buttonRef.current },
    );
    openDrawer();
  };

  return (
    <div className="rounded-card border border-line bg-shell p-5 lg:sticky lg:top-32">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Build your plate
          </p>
          <p className="font-display text-3xl tabular-nums">{formatMoney(unitPrice)}</p>
        </div>
        <span className="text-xs text-muted">{product.unit}</span>
      </div>

      <div className="mt-5 space-y-5">
        {product.optionGroups.map((group) => {
          const chosen = selection[group.id] ?? [];
          return (
            <fieldset key={group.id}>
              <legend className="flex w-full items-baseline justify-between gap-2">
                <span className="text-sm font-semibold">{group.label}</span>
                <span className="text-[11px] uppercase tracking-wider text-muted">
                  {group.kind === "multi"
                    ? group.max
                      ? `up to ${group.max}`
                      : "optional"
                    : group.required
                      ? "required"
                      : "optional"}
                </span>
              </legend>
              {group.help ? <p className="mt-1 text-xs text-muted">{group.help}</p> : null}
              <div className="mt-2.5 grid gap-2">
                {group.options.map((option) => {
                  const active = chosen.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggle(group.id, option.id, group.kind)}
                      className={`flex items-center gap-3 rounded-card border px-3.5 py-2.5 text-left text-sm transition ${
                        active
                          ? "border-accent bg-accent-soft text-ink"
                          : "border-line bg-sand/40 hover:border-ink/25"
                      }`}
                      aria-pressed={active}
                    >
                      <span
                        className={`grid size-5 shrink-0 place-items-center border transition ${
                          group.kind === "single" ? "rounded-full" : "rounded-[6px]"
                        } ${active ? "border-accent bg-accent text-white" : "border-line bg-shell"}`}
                      >
                        {active ? <IconCheck size={12} /> : null}
                      </span>
                      <span className="flex-1">{option.label}</span>
                      {option.extraCents > 0 ? (
                        <span className="text-xs font-semibold tabular-nums text-muted">
                          +{formatMoney(option.extraCents)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted">included</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        <div>
          <label className={labelClass} htmlFor="note">
            Note for the kitchen
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, 200))}
            rows={2}
            placeholder="No coriander, extra krupuk, cutlery for two…"
            className={`${field} mt-2 resize-none`}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">How many</span>
          <div className="flex items-center gap-1 rounded-card border border-line p-1">
            <button
              type="button"
              onClick={() => setQty((value) => Math.max(1, value - 1))}
              className="grid size-8 place-items-center rounded-[8px] transition hover:bg-sand"
              aria-label="One less"
            >
              <IconMinus size={15} />
            </button>
            <span className="w-8 text-center text-sm font-semibold tabular-nums">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((value) => Math.min(20, value + 1))}
              className="grid size-8 place-items-center rounded-[8px] transition hover:bg-sand"
              aria-label="One more"
            >
              <IconPlus size={15} />
            </button>
          </div>
        </div>
      </div>

      {!pricing.ok ? (
        <p className="mt-4 rounded-card bg-warn-soft px-3.5 py-2.5 text-xs font-medium text-warn">
          {pricing.error}
        </p>
      ) : null}

      <div className="mt-5 flex items-center justify-between border-t border-line pt-5">
        <span className="text-sm text-muted">Total</span>
        <span className="font-display text-2xl tabular-nums">{formatMoney(total)}</span>
      </div>

      <button
        ref={buttonRef}
        type="button"
        disabled={product.soldOut || !pricing.ok}
        onClick={() => addToCart()}
        className={`${btnPrimary} mt-4 hidden w-full py-3 lg:inline-flex`}
      >
        {product.soldOut ? "Sold out today" : "Add to preorder"}
      </button>
      <p className="mt-2.5 hidden text-center text-[11px] text-muted lg:block">
        Nothing is charged yet. You pick the batch slot at checkout.
      </p>

      {/* On a phone the option list is long, so the price and the button follow the
          thumb instead of waiting at the bottom of the card. */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-sand/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-200 lg:hidden ${
          nearBottom ? "translate-y-full" : ""
        }`}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {pricing.ok ? `${qty} × ${formatMoney(unitPrice)}` : "Pick the required options"}
          </p>
          <p className="font-display text-xl tabular-nums">
            {pricing.ok ? formatMoney(total) : formatMoney(product.priceCents)}
          </p>
        </div>
        <button
          ref={mobileButtonRef}
          type="button"
          disabled={product.soldOut || !pricing.ok}
          onClick={() => addToCart(mobileButtonRef.current)}
          className={`${btnPrimary} shrink-0 px-4 py-3`}
        >
          {product.soldOut ? "Sold out" : "Add to preorder"}
        </button>
      </div>
    </div>
  );
}
