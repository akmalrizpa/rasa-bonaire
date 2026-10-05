import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { DishArt } from "@/components/DishArt";
import { IconArrowRight, IconBike, IconClock, IconFlame, IconPin, IconStar } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import { btnOutline, btnPrimary, pageShell, sectionTitle } from "@/components/ui";
import { reviews, shop, story } from "@/data/shop";
import { formatDay, formatMoney } from "@/lib/money";
import { closesAt, listSlots, serviceDate } from "@/lib/slots";
import { getSettings, listCategories, listProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

const steps = [
  {
    time: "07:00",
    title: "The sambal is ground",
    body: "Yanti lights the back burner and grinds chilli, shallot and shrimp paste before the island heat arrives. Peanut sauce goes on straight after.",
  },
  {
    time: "15:00",
    title: "Preorder closes",
    body: "This is the line that decides the day. We count plates, weigh the rendang and buy the rest of the vegetables for exactly that many orders.",
  },
  {
    time: "16:30",
    title: "The wok goes on",
    body: "Noodles, rice and fritters are cooked in one run each, in the order the slots come in, so nothing waits under a lamp.",
  },
  {
    time: "17:00",
    title: "First pickups",
    body: "Your slot starts. Give the name on the order at Kaya Grandi 24, and it is packed, still steaming, ready to take.",
  },
];

export default async function HomePage() {
  const [categories, products, settings] = await Promise.all([
    listCategories(),
    listProducts(),
    getSettings(),
  ]);

  const onMenu = products.filter((product) => product.active);
  const bySold = [...onMenu].sort((a, b) => b.sold - a.sold);
  const featured = bySold.slice(0, 3);
  const mostPreordered = bySold.slice(0, 6);
  const bonaireDishes = onMenu.filter((product) => product.categoryId === "bonaire").slice(0, 4);

  const pickupSlots = listSlots()
    .filter((slot) => slot.kind === "pickup")
    .slice(0, 4);
  const firstPickup = pickupSlots[0]?.label.split(" – ")[0] ?? "17:00";
  const nextService = formatDay(serviceDate());
  const closesIso = closesAt().toISOString();
  const closeClock = `${String(shop.preorderClosesAt).padStart(2, "0")}:00`;
  const kralendijkFee = shop.serviceZones.find((zone) => zone.id === "kralendijk")?.feeCents ?? 0;

  return (
    <div className="pb-4">
      <section className={`${pageShell} pt-12 sm:pt-16`}>
        <div className="grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-14">
          <div className="lg:pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Preorder · {shop.street}, Kralendijk
            </p>
            <h1 className="mt-5 max-w-xl font-display text-4xl leading-[1.08] sm:text-5xl">
              Order in the morning. Collect it warm in your slot.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
              We are a batch kitchen, not a counter with a warmer. You order before{" "}
              {closeClock}, that gives us the count, and everything — rendang, sate, keshi yena,
              pastechi — is cooked after the books close and boxed for your slot. Nothing sits
              around waiting for a customer.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/menu" className={btnPrimary}>
                See tonight&rsquo;s menu
                <IconArrowRight size={16} />
              </Link>
              <Link href="/about" className={btnOutline}>
                How preorder works
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-card border border-line bg-shell px-4 py-3.5">
              <IconClock size={17} className="text-accent" />
              <span className="text-sm text-ink-soft">
                Preorder for the next batch closes in
              </span>
              <Countdown closesAt={closesIso} />
              <span className="text-xs text-muted">
                {nextService}, {closeClock} island time
              </span>
            </div>

            <dl className="mt-8 grid gap-5 border-t border-line pt-6 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  On the menu
                </dt>
                <dd className="mt-1.5 font-display text-2xl tabular-nums">
                  {onMenu.length} dishes
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Pickup
                </dt>
                <dd className="mt-1.5 font-display text-2xl tabular-nums">
                  from {firstPickup}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Free delivery
                </dt>
                <dd className="mt-1.5 font-display text-2xl tabular-nums">
                  over {formatMoney(settings.freeDeliveryFromCents)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted">
              Otherwise delivery in Kralendijk centre costs {formatMoney(kralendijkFee)}. Hato and
              Rincon are a little more, the fee shows at checkout.
            </p>
          </div>

          <aside className="lg:pt-16">
            <div className="rounded-card border border-line bg-shell p-6 shadow-lift">
              <div className="flex items-start justify-between gap-4 border-b border-line pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    Next batch cooks
                  </p>
                  <p className="mt-1.5 font-display text-2xl">{nextService}</p>
                  <p className="mt-1 text-xs text-muted">
                    Preorder closes {closeClock}, we start cooking at 16:30.
                  </p>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                  <IconFlame size={20} />
                </span>
              </div>

              <div className="pt-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  First pickup windows
                </p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {pickupSlots.slice(0, 4).map((slot) => (
                    <li
                      key={slot.id}
                      className="rounded-card border border-line bg-sand/60 px-3 py-2 text-sm tabular-nums text-ink-soft"
                    >
                      {slot.label}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted">
                  Weekdays start at 17:00, weekends at 12:00. Slots are 30 minutes and you pick one
                  at checkout.
                </p>
              </div>

              <div className="mt-6 -mb-1 flex items-end gap-3 border-t border-line pt-6">
                {featured.map((product, index) => (
                  <Link
                    key={product.id}
                    href={`/menu/${product.slug}`}
                    className={`min-w-0 flex-1 transition hover:-translate-y-0.5 ${
                      index === 0 ? "translate-y-2" : index === 1 ? "-translate-y-2" : "translate-y-4"
                    }`}
                  >
                    <span className="relative block">
                      <DishArt
                        art={product.art}
                        className="aspect-square w-full rounded-card border border-line"
                      />
                      {index === 1 ? (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-0 top-1 flex justify-center gap-1"
                        >
                          <span className="animate-steam h-6 w-0.5 rounded-full bg-muted/40" />
                          <span className="animate-steam h-9 w-0.5 rounded-full bg-muted/30 [animation-delay:0.7s]" />
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-2.5 block truncate text-xs font-semibold">
                      {product.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] tabular-nums text-muted">
                      {formatMoney(product.priceCents)} {product.unit}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className={`${pageShell} mt-14`}>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/menu?category=${category.id}`}
              className="rounded-full border border-line bg-shell px-4 py-2 text-xs font-semibold text-ink-soft transition hover:border-ink/25 hover:text-ink"
            >
              {category.name}
              <span className="ml-2 tabular-nums text-muted">
                {onMenu.filter((product) => product.categoryId === category.id).length}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className={`${pageShell} mt-16`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className={sectionTitle}>Most preordered</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Counted from the tickets we have cooked this season, not from what we feel like
              pushing.
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-dark"
          >
            Full menu
            <IconArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mostPreordered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              categoryName={categories.find((category) => category.id === product.categoryId)?.name}
            />
          ))}
        </div>
      </section>

      <section className={`${pageShell} mt-20`}>
        <div className="grid gap-10 lg:grid-cols-[0.42fr_0.58fr] lg:gap-14">
          <div className="lg:pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Bonaire kitchen
            </p>
            <h2 className={`${sectionTitle} mt-3`}>{story.heading}</h2>
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-ink-soft">
              <IconPin size={16} className="text-accent" />
              {shop.street}, {shop.city}
            </p>
          </div>

          <div>
            {story.body.map((paragraph, index) => (
              <p
                key={paragraph.slice(0, 24)}
                className={`text-sm leading-relaxed text-ink-soft ${index === 0 ? "" : "mt-4"}`}
              >
                {paragraph}
              </p>
            ))}
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {bonaireDishes.map((product) => (
                <Link
                  key={product.id}
                  href={`/menu/${product.slug}`}
                  className="group flex gap-3 rounded-card border border-line bg-shell p-3 transition hover:border-ink/20"
                >
                  <DishArt
                    art={product.art}
                    className="size-16 shrink-0 rounded-card border border-line"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold group-hover:text-accent">
                      {product.name}
                    </span>
                    <span className="mt-1 block text-xs text-muted">{product.unit}</span>
                    <span className="mt-1.5 block text-sm font-semibold tabular-nums">
                      {formatMoney(product.priceCents)}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={`${pageShell} mt-20`}>
        <div className="grid gap-10 lg:grid-cols-[0.36fr_0.64fr] lg:gap-14">
          <div>
            <h2 className={sectionTitle}>How a preorder runs</h2>
            <p className="mt-3 max-w-sm text-sm text-muted">
              One batch a day, on the clock. Miss the 15:00 cut-off and your order joins the next
              open day — we do not keep cooked food overnight.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-card bg-sea-soft px-3.5 py-2.5 text-xs font-medium text-sea">
              <IconBike size={15} />
              Delivery runs 30 minutes behind the first pickup, in Kralendijk only.
            </div>
          </div>

          <ol className="border-l border-line">
            {steps.map((step) => (
              <li key={step.time} className="relative pb-9 pl-7 last:pb-0">
                <span className="absolute -left-[7px] top-1.5 size-3.5 rounded-full border-2 border-sand bg-accent" />
                <p className="font-display text-lg tabular-nums text-accent">{step.time}</p>
                <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${pageShell} mt-20`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className={sectionTitle}>What people say after pickup</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <IconStar size={13} className="text-accent" />
            Three of the notes pinned above the pass.
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <blockquote
              key={review.name}
              className={`rounded-card border border-line bg-shell p-6 ${
                index === 1 ? "lg:mt-6" : ""
              }`}
            >
              <p className="text-sm leading-relaxed text-ink-soft">&ldquo;{review.text}&rdquo;</p>
              <footer className="mt-5 border-t border-line pt-4">
                <p className="text-sm font-semibold">{review.name}</p>
                <p className="text-xs text-muted">{review.place}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className={`${pageShell} mt-20`}>
        <div className="grid gap-8 rounded-card border border-line bg-ink px-7 py-10 text-sand lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <div>
            <h2 className="font-display text-2xl text-sand sm:text-3xl">
              The 15:00 cut-off decides what we cook tonight.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-sand/75">
              Pick your dishes, choose a slot, pay online or at the counter. We open the list at
              {` `}
              {nextService} and start the first wok at 16:30.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-card bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark"
              >
                Start a preorder
                <IconArrowRight size={16} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-card border border-sand/25 px-4 py-2.5 text-sm font-semibold text-sand transition hover:bg-sand/10"
              >
                Visit the kitchen
              </Link>
            </div>
          </div>

          <div className="lg:border-l lg:border-sand/15 lg:pl-10">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sand/60">
              Kitchen hours
            </p>
            <ul className="mt-4 space-y-3">
              {shop.openingHours.map((row) => (
                <li key={row.days} className="flex flex-col border-b border-sand/10 pb-3 last:border-0">
                  <span className="text-sm font-semibold">{row.days}</span>
                  <span className="text-sm tabular-nums text-sand/70">{row.hours}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-sand/60">
              {shop.phone} · {shop.emailOrders}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
