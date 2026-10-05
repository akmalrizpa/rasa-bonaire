import Link from "next/link";
import { FilterBar } from "@/components/FilterBar";
import { IconClock } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import { btnOutline, pageShell, sectionTitle } from "@/components/ui";
import { shop } from "@/data/shop";
import { formatDay } from "@/lib/money";
import { closesAt, serviceDate } from "@/lib/slots";
import { listCategories, listProducts } from "@/lib/store";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

const sortIds = ["popular", "price-asc", "price-desc", "quick"] as const;
type SortId = (typeof sortIds)[number];

function read(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function compare(a: Product, b: Product, sort: SortId): number {
  if (a.soldOut !== b.soldOut) return a.soldOut ? 1 : -1;
  switch (sort) {
    case "price-asc":
      return a.priceCents - b.priceCents || a.name.localeCompare(b.name);
    case "price-desc":
      return b.priceCents - a.priceCents || a.name.localeCompare(b.name);
    case "quick":
      return a.prepMinutes - b.prepMinutes || a.name.localeCompare(b.name);
    default:
      return b.sold - a.sold || a.name.localeCompare(b.name);
  }
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [categories, products] = await Promise.all([listCategories(), listProducts()]);

  const requestedCategory = read(params.category);
  const query = read(params.q).trim();
  const rawSort = read(params.sort);
  const sort: SortId = (sortIds as readonly string[]).includes(rawSort)
    ? (rawSort as SortId)
    : "popular";

  const activeCategory = categories.find((category) => category.id === requestedCategory);
  const needle = query.toLowerCase();

  const results = products
    .filter((product) => product.active)
    .filter((product) => (activeCategory ? product.categoryId === activeCategory.id : true))
    .filter((product) =>
      needle
        ? product.name.toLowerCase().includes(needle) ||
          product.description.toLowerCase().includes(needle) ||
          product.unit.toLowerCase().includes(needle)
        : true,
    )
    .sort((a, b) => compare(a, b, sort));

  const soldOutCount = results.filter((product) => product.soldOut).length;
  const closeClock = `${String(shop.preorderClosesAt).padStart(2, "0")}:00`;

  const headline = [
    `${results.length} ${results.length === 1 ? "dish" : "dishes"}`,
    query ? `for \u201c${query}\u201d` : "",
    activeCategory ? `in ${activeCategory.name}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`${pageShell} py-12 sm:py-14`}>
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h1 className={sectionTitle}>Tonight&rsquo;s menu</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {products.filter((product) => product.active).length} dishes, cooked in one run on{" "}
            {formatDay(serviceDate())}. Preorder closes at {closeClock} — after that the list is
            shut and we cook exactly what was ordered.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-card bg-accent-soft px-3.5 py-2.5 text-xs font-semibold text-accent">
          <IconClock size={15} />
          Batch for {formatDay(closesAt())}, {closeClock}
        </div>
      </div>

      <div className="mt-8">
        <FilterBar
          categories={categories}
          activeCategory={activeCategory?.id ?? ""}
          activeSort={sort}
          query={query}
        />
      </div>

      <div className="mt-7 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-sm font-semibold">
          {headline}
          {soldOutCount > 0 ? (
            <span className="ml-2 font-normal text-muted">
              · {soldOutCount} sold out and pushed to the bottom
            </span>
          ) : null}
        </p>
        {activeCategory ? (
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>{activeCategory.blurb}</span>
            <Link
              href="/menu"
              className="underline decoration-line underline-offset-4 hover:text-ink"
            >
              Show everything
            </Link>
          </div>
        ) : (
          <p className="text-xs text-muted">Tap a dish for sambal level, portion and extras.</p>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-shell px-7 py-14 text-center">
          <h2 className="font-display text-2xl">
            {query ? `Nothing matches \u201c${query}\u201d.` : "Nothing left in this corner."}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            {query
              ? "Try \u201csate\u201d or \u201cpastechi\u201d, or clear the filters. A dish can also be off today if it sold out on the last batch."
              : "This category is empty for tonight. The full menu still has rice plates, noodles and sweets on it."}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/menu" className={btnOutline}>
              Clear the filters
            </Link>
            <Link href="/about" className={btnOutline}>
              Ask us what is left
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={
                categories.find((category) => category.id === product.categoryId)?.name
              }
            />
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-muted">
        Sold-out dishes stay on the page so you can see what the next batch is missing.
      </p>
    </div>
  );
}
