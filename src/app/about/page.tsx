import Link from "next/link";
import { IconChevronDown, IconClock, IconClose, IconMail, IconPhone, IconPin } from "@/components/Icons";
import { btnOutline, btnPrimary, pageShell, sectionTitle } from "@/components/ui";
import { faqs, shop, story } from "@/data/shop";
import { listSlots, serviceDate } from "@/lib/slots";
import { formatDay } from "@/lib/money";

export const dynamic = "force-dynamic";

const timeline = [
  {
    time: "07:00",
    title: "Mise en place",
    body: "Sambal is ground, peanut sauce is cooked down, chicken for the sate goes into the marinade for the next day.",
  },
  {
    time: "09:00",
    title: "Market run",
    body: "Vegetables, tempeh and cheese for keshi yena. What we buy tomorrow depends on what was ordered today.",
  },
  {
    time: "15:00",
    title: "Preorder closes",
    body: "The list is printed. Every ticket becomes a plate, and the count is final.",
  },
  {
    time: "16:30",
    title: "Cooking, in one run",
    body: "Wok, charcoal grill and oven, batch by batch. Nothing is fried twice and nothing waits under a lamp.",
  },
  {
    time: "17:00",
    title: "Pickups and delivery",
    body: "First pickup window opens on Kaya Grandi. Delivery leaves half an hour later for Kralendijk addresses.",
  },
];

const refusals = [
  {
    title: "No freezer",
    body: "If it was not ordered, it is not cooked. We would rather run out of rendang at 19:00 than reheat Tuesday's from a container.",
  },
  {
    title: "No delivery driver circling the island",
    body: "Delivery stays inside Kralendijk. Once the route goes past Hato it stops being thirty minutes and starts being an hour.",
  },
  {
    title: "No walk-in orders while a batch is cooking",
    body: "Between 16:30 and 19:00 the pass is full. If you walk in without a preorder we will cook for you after the batch goes out.",
  },
];

export default function AboutPage() {
  const nextService = formatDay(serviceDate());
  const pickupSlots = listSlots()
    .filter((slot) => slot.kind === "pickup")
    .slice(0, 3);

  return (
    <div className={`${pageShell} py-12 sm:py-14`}>
      <div className="grid gap-10 lg:grid-cols-[0.46fr_0.54fr] lg:gap-14">
        <div className="lg:pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Two kitchens, one address
          </p>
          <h1 className="mt-4 font-display text-3xl leading-tight sm:text-4xl">{story.heading}</h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/menu" className={btnPrimary}>
              See tonight&rsquo;s menu
            </Link>
            <Link href="/menu?category=bonaire" className={btnOutline}>
              The Bonaire side
            </Link>
          </div>
        </div>

        <div className="lg:pt-8">
          {story.body.map((paragraph, index) => (
            <p
              key={paragraph.slice(0, 24)}
              className={`text-sm leading-relaxed text-ink-soft ${index === 0 ? "" : "mt-4"}`}
            >
              {paragraph}
            </p>
          ))}
          <dl className="mt-8 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Next batch cooks
              </dt>
              <dd className="mt-1.5 font-display text-xl">{nextService}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                First windows
              </dt>
              <dd className="mt-1.5 text-sm tabular-nums text-ink-soft">
                {pickupSlots.map((slot) => slot.label).join(" · ")}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="mt-20">
        <div className="grid gap-10 lg:grid-cols-[0.34fr_0.66fr] lg:gap-14">
          <div>
            <h2 className={sectionTitle}>A day at Kaya Grandi 24</h2>
            <p className="mt-3 max-w-sm text-sm text-muted">
              Told from the kitchen side, because that is where the cut-off actually bites. Weekdays
              open at 17:00, weekends already at noon.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-card bg-sea-soft px-3.5 py-2.5 text-xs font-medium text-sea">
              <IconClock size={15} />
              Closed Mondays and Tuesdays: shopping, prep and a day off for the wok.
            </p>
          </div>

          <ol className="border-l border-line">
            {timeline.map((step) => (
              <li key={step.time} className="relative pb-8 pl-7 last:pb-0">
                <span className="absolute -left-[7px] top-1.5 size-3.5 rounded-full border-2 border-sand bg-ink" />
                <p className="font-display text-lg tabular-nums">{step.time}</p>
                <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-20">
        <div className="grid gap-8 lg:grid-cols-[0.4fr_0.6fr] lg:gap-14">
          <div>
            <h2 className={sectionTitle}>What we do not do</h2>
            <p className="mt-3 max-w-sm text-sm text-muted">
              Three rules, and they cost us orders every week.
            </p>
          </div>

          <ul className="space-y-4">
            {refusals.map((rule) => (
              <li
                key={rule.title}
                className="flex gap-4 rounded-card border border-line bg-shell p-5"
              >
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                  <IconClose size={14} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{rule.title}</span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-muted">{rule.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-20">
        <div className="grid gap-8 lg:grid-cols-[0.34fr_0.66fr] lg:gap-14">
          <div>
            <h2 className={sectionTitle}>Questions we get at the counter</h2>
            <p className="mt-3 max-w-sm text-sm text-muted">
              If yours is not here, call {shop.phone} between 16:00 and 20:00 and you will get the
              kitchen, not a call centre.
            </p>
          </div>

          <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-shell">
            {faqs.map((faq) => (
              <details key={faq.q} className="group px-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <IconChevronDown
                    size={17}
                    className="shrink-0 text-muted transition group-open:rotate-180"
                  />
                </summary>
                <p className="pb-5 pr-8 text-sm leading-relaxed text-muted">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-20">
        <div className="grid gap-8 rounded-card border border-line bg-shell p-7 lg:grid-cols-2 lg:p-9">
          <div>
            <h2 className="font-display text-2xl">Find the kitchen</h2>
            <ul className="mt-5 space-y-3 text-sm text-ink-soft">
              <li className="flex items-center gap-2.5">
                <IconPin size={17} className="text-accent" />
                {shop.street}, {shop.city}
              </li>
              <li className="flex items-center gap-2.5">
                <IconPhone size={17} className="text-accent" />
                <a href={`tel:${shop.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                  {shop.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <IconMail size={17} className="text-accent" />
                <a href={`mailto:${shop.emailOrders}`} className="hover:text-accent">
                  {shop.emailOrders}
                </a>
              </li>
            </ul>
            <p className="mt-5 max-w-md text-xs leading-relaxed text-muted">
              Orders and questions both land with the same two people. Payments on this site run in
              test mode — no card is charged and no money moves, cash at the counter is the only
              money we actually take today.
            </p>
          </div>

          <div className="lg:border-l lg:border-line lg:pl-9">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Kitchen hours
            </p>
            <ul className="mt-4 space-y-3">
              {shop.openingHours.map((row) => (
                <li
                  key={row.days}
                  className="flex flex-col border-b border-line pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-semibold">{row.days}</span>
                  <span className="text-sm tabular-nums text-muted">{row.hours}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs text-muted">
              Preorder for the same evening closes at 15:00. After that the next open day takes the
              order.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
