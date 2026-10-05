import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DishArt } from "@/components/DishArt";
import { IconChevronRight, IconClock, IconFlame, IconStar } from "@/components/Icons";
import { ItemPicker } from "@/components/ItemPicker";
import { pageShell } from "@/components/ui";
import { shop } from "@/data/shop";
import { formatMoney } from "@/lib/money";
import { getProductBySlug, listCategories, listProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "That dish is not on tonight" };
  }
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} · Rasa Bonaire`,
      description: product.description,
      type: "website",
    },
  };
}

export default async function DishPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [products, categories] = await Promise.all([listProducts(), listCategories()]);
  const category = categories.find((entry) => entry.id === product.categoryId);
  const companions = products
    .filter(
      (entry) =>
        entry.active && entry.categoryId === product.categoryId && entry.id !== product.id,
    )
    .slice(0, 3);

  return (
    <div className={`${pageShell} py-10 sm:py-12`}>
      <nav className="flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/menu" className="hover:text-ink">
          Menu
        </Link>
        <IconChevronRight size={13} />
        {category ? (
          <>
            <Link href={`/menu?category=${category.id}`} className="hover:text-ink">
              {category.name}
            </Link>
            <IconChevronRight size={13} />
          </>
        ) : null}
        <span className="truncate text-ink-soft">{product.name}</span>
      </nav>

      <div className="mt-7 grid gap-10 lg:grid-cols-[1.32fr_0.68fr] lg:gap-12">
        <div>
          <DishArt
            art={product.art}
            className="aspect-[16/10] w-full rounded-card border border-line"
          />

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted">
            <span className="inline-flex items-center gap-1.5">
              <IconStar size={13} className="text-accent" />
              <span className="tabular-nums text-ink-soft">{product.rating.toFixed(1)}</span>
              <span>from this season&rsquo;s tickets</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconClock size={13} />
              {product.prepMinutes} min at the pass
            </span>
            <span className="inline-flex items-center gap-1.5">
              <IconFlame size={13} />
              <span className="tabular-nums text-ink-soft">{product.sold}</span> preordered so far
            </span>
            {product.badge ? (
              <span className="rounded-full bg-accent-soft px-2.5 py-1 font-semibold text-accent">
                {product.badge}
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <p className="font-display text-2xl tabular-nums">{formatMoney(product.priceCents)}</p>
            <span className="text-sm text-muted">{product.unit}</span>
          </div>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {product.description}
          </p>

          {product.soldOut ? (
            <p className="mt-5 max-w-2xl rounded-card bg-warn-soft px-4 py-3 text-sm text-warn">
              This one sold out on the last batch. It is on the board again for tomorrow — join the
              preorder and we will cook it fresh, or pick something else from{" "}
              {category ? category.name.toLowerCase() : "the menu"}.
            </p>
          ) : (
            <p className="mt-5 max-w-2xl rounded-card bg-sand px-4 py-3 text-sm text-ink-soft">
              Everything here is cooked after preorder closes at 15:00. Pick your sambal level and
              portion on the right, and we box it for your slot.
            </p>
          )}

          {companions.length > 0 ? (
            <section className="mt-10 border-t border-line pt-7">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                Goes well with
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {companions.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/menu/${entry.slug}`}
                    className="group flex items-center gap-3 rounded-card border border-line bg-shell p-3 transition hover:border-ink/20"
                  >
                    <DishArt
                      art={entry.art}
                      className="size-14 shrink-0 rounded-card border border-line"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold group-hover:text-accent">
                        {entry.name}
                      </span>
                      <span className="mt-0.5 block text-xs tabular-nums text-muted">
                        {formatMoney(entry.priceCents)} · {entry.unit}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <p className="mt-8 text-xs text-muted">
            Questions about this dish? Call the kitchen on {shop.phone} — we answer between batches.
          </p>
        </div>

        <div>
          <ItemPicker product={product} />
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Sold out, closed kitchen, or a dish you cannot find? Tell us in the order note and we
            check the walk-in before the wok goes on.
          </p>
        </div>
      </div>
    </div>
  );
}
