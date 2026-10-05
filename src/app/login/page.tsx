import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/AuthForms";
import { Countdown } from "@/components/Countdown";
import { DishArt } from "@/components/DishArt";
import { IconClock, IconMail, IconPhone, IconPin, IconShield } from "@/components/Icons";
import { Logo } from "@/components/Logo";
import { card, pageShell } from "@/components/ui";
import { shop } from "@/data/shop";
import { currentUser } from "@/lib/auth";
import { closesAt } from "@/lib/slots";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next;
  const user = await currentUser();

  if (user) redirect(next ?? "/orders");

  const settings = await getSettings();
  const closesAtIso = closesAt().toISOString();

  return (
    <div className={`${pageShell} py-12 lg:py-16`}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
        <div className="max-w-xl">
          <LoginForm next={next} />
          <p className="mt-5 text-sm text-muted">
            No account yet?{" "}
            <Link href="/register" className="font-semibold text-accent hover:underline">
              Create one
            </Link>{" "}
            — it takes a phone number and a password.
          </p>
        </div>

        <section className={`${card} p-6 sm:p-7`}>
          <Logo size={34} subtitle href={null} />
          <h2 className="mt-5 font-display text-xl">Order in the morning, collect inside your slot</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Yanti starts the wok at seven. We braise and skewer only what was preordered, so the
            batch closes at {shop.preorderClosesAt}:00 and the pans stay honest after that.
          </p>

          <div className="mt-6 flex items-start gap-4">
            <DishArt art="stew" className="h-24 w-24 shrink-0 rounded-card border border-line" />
            <div className="min-w-0 text-sm text-ink-soft">
              <p className="font-semibold text-ink">Beef rendang, cooked dry</p>
              <p className="mt-1 text-muted">
                Four hours on low heat, no shortcut. 480 grams, serves two with rice.
              </p>
              <p className="mt-2 font-semibold tabular-nums">$18.50</p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
            <div className="flex items-start gap-3">
              <IconPin size={16} className="mt-0.5 shrink-0 text-muted" />
              <div>
                <dt className="font-semibold">Pickup</dt>
                <dd className="text-muted">{settings.pickupAddress}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IconPhone size={16} className="mt-0.5 shrink-0 text-muted" />
              <div>
                <dt className="font-semibold">Kitchen line</dt>
                <dd className="text-muted">
                  {shop.phone} · WhatsApp {shop.whatsapp}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IconMail size={16} className="mt-0.5 shrink-0 text-muted" />
              <div>
                <dt className="font-semibold">Orders inbox</dt>
                <dd className="text-muted">{shop.emailOrders}</dd>
              </div>
            </div>
          </dl>

          <div className="mt-6 border-t border-line pt-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              <IconClock size={14} />
              Opening hours
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {shop.openingHours.map((entry) => (
                <li key={entry.days} className="flex justify-between gap-4">
                  <span className="text-ink-soft">{entry.days}</span>
                  <span className="text-muted">{entry.hours}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">
              Current batch takes orders until <Countdown closesAt={closesAtIso} compact />.
            </p>
          </div>

          <p className="mt-6 flex items-start gap-2 border-t border-line pt-5 text-sm text-muted">
            <IconShield size={16} className="mt-0.5 shrink-0 text-sea" />
            <span>
              Admin accounts land on the kitchen dashboard at{" "}
              <Link href="/admin" className="font-semibold text-ink hover:underline">
                /admin
              </Link>{" "}
              — the order queue, the payment marks and the daily counts.
            </span>
          </p>
        </section>
      </div>
    </div>
  );
}
