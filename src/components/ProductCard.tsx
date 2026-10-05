"use client";

import Link from "next/link";
import { useRef } from "react";
import { useCart } from "@/components/AppProviders";
import { DishArt } from "@/components/DishArt";
import { IconClock, IconPlus, IconStar } from "@/components/Icons";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

export function defaultOptionIds(product: Product): string[] {
  const ids: string[] = [];
  for (const group of product.optionGroups) {
    if (group.kind === "single" && group.required) {
      const fallback = group.defaultOptionId ?? group.options[0]?.id;
      if (fallback) ids.push(fallback);
    }
  }
  return ids;
}

export function ProductCard({ product, categoryName }: { product: Product; categoryName?: string }) {
  const { add } = useCart();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const quickAdd = () => {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        unit: product.unit,
        priceCents: product.priceCents,
        optionIds: defaultOptionIds(product),
        optionLabels: product.optionGroups
          .filter((group) => group.kind === "single" && group.required)
          .map((group) => {
            const id = group.defaultOptionId ?? group.options[0]?.id;
            return group.options.find((option) => option.id === id)?.label ?? "";
          })
          .filter(Boolean),
        art: product.art,
      },
      { flyFrom: buttonRef.current },
    );
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-line bg-shell transition duration-300 hover:border-ink/20 hover:shadow-lift">
      <Link href={`/menu/${product.slug}`} className="relative block overflow-hidden">
        <DishArt
          art={product.art}
          className="aspect-[4/3] w-full transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.badge ? (
            <span className="rounded-full bg-shell/95 px-2.5 py-1 text-[11px] font-semibold text-ink">
              {product.badge}
            </span>
          ) : null}
          {product.soldOut ? (
            <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-sand">
              Sold out today
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-3 text-[11px] font-medium text-muted">
          <span className="inline-flex items-center gap-1">
            <IconStar size={12} className="text-accent" />
            <span className="tabular-nums text-ink-soft">{product.rating.toFixed(1)}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <IconClock size={12} />
            {product.prepMinutes} min
          </span>
          <span className="tabular-nums">{product.sold} preordered</span>
          {categoryName ? <span className="hidden sm:inline">{categoryName}</span> : null}
        </div>

        <h3 className="mt-2.5 font-display text-lg leading-snug">
          <Link href={`/menu/${product.slug}`} className="hover:text-accent">
            {product.name}
          </Link>
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{product.description}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="font-display text-xl tabular-nums">{formatMoney(product.priceCents)}</p>
            <p className="text-[11px] text-muted">{product.unit}</p>
          </div>
          <button
            ref={buttonRef}
            type="button"
            disabled={product.soldOut}
            onClick={quickAdd}
            className="inline-flex items-center gap-1.5 rounded-card bg-accent px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
          >
            <IconPlus size={15} />
            {product.soldOut ? "Sold out" : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}
