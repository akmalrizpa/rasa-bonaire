"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { createDishAction, updateDishAction, type AdminState } from "@/actions/admin";
import { useCart } from "@/components/AppProviders";
import { DishArt } from "@/components/DishArt";
import { IconChevronDown, IconPlus, IconSearch, IconSpinner, IconStar } from "@/components/Icons";
import { card, field } from "@/components/ui";
import type { Category, Product } from "@/lib/types";

const saveDish = async (_prev: AdminState, formData: FormData): Promise<AdminState> =>
  updateDishAction(formData);

const addDish = async (_prev: AdminState, formData: FormData): Promise<AdminState> =>
  createDishAction(formData);

const artOptions = [
  "plate",
  "salad",
  "stew",
  "noodles",
  "soup",
  "skewer",
  "fritter",
  "pastry",
  "cheese",
  "funchi",
  "sweet",
  "drink",
  "coffee",
];

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-card bg-ink px-4 py-2 text-sm font-semibold text-sand transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <IconSpinner size={14} /> : null}
      {pending ? "Saving" : label}
    </button>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  name,
  defaultChecked,
  children,
}: {
  name: string;
  defaultChecked: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-ink-soft">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 accent-accent"
      />
      {children}
    </label>
  );
}

function DishRow({ product, categoryName }: { product: Product; categoryName: string }) {
  const [state, formAction] = useActionState(saveDish, {});
  const { notify } = useCart();

  useEffect(() => {
    if (state.error) notify({ title: "Not saved", body: state.error, tone: "warn" });
    else if (state.notice) notify({ title: state.notice, tone: "ok" });
  }, [state, notify]);

  return (
    <form action={formAction} className="px-4 py-3">
      <input type="hidden" name="id" value={product.id} />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex min-w-52 flex-1 items-center gap-3">
          <DishArt
            art={product.art}
            className="size-12 shrink-0 rounded-card border border-line"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{product.name}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
              <span>{categoryName}</span>
              <span className="inline-flex items-center gap-1">
                <IconStar size={11} className="text-accent" />
                {product.rating.toFixed(1)}
              </span>
              <span>{product.prepMinutes} min</span>
              <span>sold {product.sold}</span>
              {!product.active ? <span className="font-semibold text-warn">hidden</span> : null}
            </p>
          </div>
        </div>

        <Cell label="Price $">
          <input
            name="priceDollars"
            inputMode="decimal"
            defaultValue={(product.priceCents / 100).toFixed(2)}
            className={`${field} w-24 py-2 text-right tabular-nums`}
            aria-label={`Price for ${product.name}`}
          />
        </Cell>

        <Cell label="Prep min">
          <input
            name="prepMinutes"
            inputMode="numeric"
            defaultValue={product.prepMinutes}
            className={`${field} w-20 py-2 text-right tabular-nums`}
            aria-label={`Prep minutes for ${product.name}`}
          />
        </Cell>

        <Cell label="Badge">
          <input
            name="badge"
            defaultValue={product.badge ?? ""}
            placeholder="none"
            className={`${field} w-32 py-2`}
            aria-label={`Badge for ${product.name}`}
          />
        </Cell>

        <div className="flex flex-col gap-1.5">
          <Toggle name="soldOut" defaultChecked={product.soldOut}>
            Sold out
          </Toggle>
          <Toggle name="active" defaultChecked={product.active}>
            On the menu
          </Toggle>
        </div>

        <SaveButton label="Save" />
      </div>
    </form>
  );
}

function AddDishForm({ categories }: { categories: Category[] }) {
  const [state, formAction] = useActionState(addDish, {});
  const { notify } = useCart();

  useEffect(() => {
    if (state.error) notify({ title: "Not added", body: state.error, tone: "warn" });
    else if (state.notice) notify({ title: state.notice, tone: "ok" });
  }, [state, notify]);

  return (
    <form action={formAction} className="border-t border-line px-4 py-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Cell label="Name">
          <input name="name" required className={field} placeholder="Rendang, beef" />
        </Cell>
        <Cell label="Slug">
          <input name="slug" className={field} placeholder="rendang-beef" />
        </Cell>
        <Cell label="Category">
          <select name="categoryId" className={field} defaultValue={categories[0]?.id ?? ""}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Cell>
        <Cell label="Price $">
          <input
            name="priceDollars"
            inputMode="decimal"
            required
            className={`${field} text-right tabular-nums`}
            placeholder="16.50"
          />
        </Cell>
        <Cell label="Unit">
          <input name="unit" className={field} placeholder="per portion" />
        </Cell>
        <Cell label="Prep min">
          <input
            name="prepMinutes"
            inputMode="numeric"
            defaultValue={12}
            className={`${field} text-right tabular-nums`}
          />
        </Cell>
        <Cell label="Art">
          <select name="art" className={field} defaultValue="plate">
            {artOptions.map((art) => (
              <option key={art} value={art}>
                {art}
              </option>
            ))}
          </select>
        </Cell>
        <div className="sm:col-span-2 lg:col-span-2">
          <Cell label="Description">
            <input name="description" className={field} placeholder="What is on the plate" />
          </Cell>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">
          New dishes start with no options. Variants can be edited in src/data/catalog.ts before the
          first run.
        </p>
        <SaveButton label="Add the dish" />
      </div>
    </form>
  );
}

export function MenuEditor({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [categoryId, setCategoryId] = useState("all");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);

  const categoryName = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products
      .filter((product) => (categoryId === "all" ? true : product.categoryId === categoryId))
      .filter((product) =>
        needle
          ? `${product.name} ${product.description} ${product.slug}`.toLowerCase().includes(needle)
          : true,
      );
  }, [products, categoryId, query]);

  return (
    <div className="space-y-4">
      <div className={`${card} p-3`}>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryId("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              categoryId === "all" ? "bg-ink text-sand" : "bg-sand text-ink-soft hover:bg-line/60"
            }`}
          >
            All {products.length}
          </button>
          {categories.map((category) => {
            const count = products.filter((product) => product.categoryId === category.id).length;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setCategoryId(category.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  categoryId === category.id
                    ? "bg-ink text-sand"
                    : "bg-sand text-ink-soft hover:bg-line/60"
                }`}
              >
                {category.name}
                <span className="tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="relative mt-3">
          <IconSearch size={16} className="pointer-events-none absolute left-3.5 top-3 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the menu by name or slug"
            className={`${field} pl-9`}
            aria-label="Search dishes"
          />
        </div>
      </div>

      <div className={`${card} overflow-hidden`}>
        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">
            Nothing under that filter. Clear the search or pick another category.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {visible.map((product) => (
              <li key={product.id}>
                <DishRow
                  product={product}
                  categoryName={categoryName.get(product.categoryId) ?? "Uncategorised"}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={card}>
        <button
          type="button"
          onClick={() => setAdding((open) => !open)}
          aria-expanded={adding}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <IconPlus size={16} className="text-accent" />
            Add a dish
          </span>
          <IconChevronDown
            size={16}
            className={`text-muted transition ${adding ? "rotate-180" : ""}`}
          />
        </button>

        {adding ? <AddDishForm categories={categories} /> : null}
      </div>
    </div>
  );
}
