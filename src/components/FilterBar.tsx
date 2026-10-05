"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IconSearch, IconSliders } from "@/components/Icons";
import { field } from "@/components/ui";
import type { Category } from "@/lib/types";

const sorts = [
  { id: "popular", label: "Most preordered" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "quick", label: "Fastest to cook" },
];

export function FilterBar({
  categories,
  activeCategory,
  activeSort,
  query,
}: {
  categories: Category[];
  activeCategory: string;
  activeSort: string;
  query: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(query);

  useEffect(() => {
    setSearch(query);
  }, [query]);

  const push = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    const queryString = next.toString();
    router.push(queryString ? `/menu?${queryString}` : "/menu", { scroll: false });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== query) push({ q: search || null });
    }, 320);
    return () => clearTimeout(timer);
  }, [search, query, params, router]);

  return (
    <div className="rounded-card border border-line bg-shell p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <IconSearch size={17} className="pointer-events-none absolute left-3.5 top-3 text-muted" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search rendang, pastechi, iced tea…"
            className={`${field} pl-10`}
            aria-label="Search the menu"
          />
        </div>

        <div className="flex items-center gap-3">
          <IconSliders size={17} className="hidden text-muted sm:block" />
          <select
            value={activeSort}
            onChange={(event) => push({ sort: event.target.value })}
            className={`${field} sm:w-56`}
            aria-label="Sort dishes"
          >
            {sorts.map((sort) => (
              <option key={sort.id} value={sort.id}>
                {sort.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => push({ category: null })}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
            !activeCategory ? "bg-ink text-sand" : "bg-sand text-ink-soft hover:bg-line/60"
          }`}
        >
          Everything
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => push({ category: category.id })}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeCategory === category.id
                ? "bg-ink text-sand"
                : "bg-sand text-ink-soft hover:bg-line/60"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
