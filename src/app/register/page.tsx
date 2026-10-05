import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/AuthForms";
import { DishArt } from "@/components/DishArt";
import { IconBag, IconCheck, IconReceipt, IconUser } from "@/components/Icons";
import { card, pageShell } from "@/components/ui";
import { shop } from "@/data/shop";
import { currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Create an account" };

const benefits = [
  {
    icon: IconReceipt,
    title: "Order history with invoice numbers",
    body: "Every preorder, its batch slot, what was paid and what is still open — on one page, in date order.",
  },
  {
    icon: IconUser,
    title: "Saved contact details",
    body: "Name, phone and email are prefilled at checkout. Change them here and the kitchen sees the new ones.",
  },
  {
    icon: IconBag,
    title: "Reorder in two taps",
    body: "Open a past preorder, send the same dishes to the cart, pick a slot. Nothing retyped.",
  },
];

export default async function RegisterPage() {
  const user = await currentUser();
  if (user) redirect("/account");

  return (
    <div className={`${pageShell} py-12 lg:py-16`}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
        <div className="max-w-xl">
          <RegisterForm />
          <p className="mt-5 text-sm text-muted">
            Already order here?{" "}
            <Link href="/login" className="font-semibold text-accent hover:underline">
              Sign in
            </Link>
            .
          </p>
        </div>

        <aside className="lg:pt-4">
          <div className="flex items-start gap-4">
            <DishArt art="fritter" className="h-24 w-24 shrink-0 rounded-card border border-line" />
            <p className="text-sm text-ink-soft">
              The kitchen at {shop.street} cooks two menus: Indonesian from Yanti&apos;s side, island
              food from the Bonaire side. Accounts are for people who order here more than once.
            </p>
          </div>

          <h2 className="mt-8 font-display text-xl">What the account gives you</h2>
          <ul className="mt-4 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit.title} className={`${card} flex items-start gap-3.5 p-4`}>
                <span className="grid size-9 shrink-0 place-items-center rounded-card bg-accent-soft text-accent">
                  <benefit.icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold">{benefit.title}</p>
                  <p className="mt-1 text-sm text-muted">{benefit.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-6 flex items-start gap-2 text-sm text-muted">
            <IconCheck size={16} className="mt-0.5 shrink-0 text-ok" />
            <span>
              One account, no order minimum. Preorder closes at {shop.preorderClosesAt}:00 for the
              same evening batch.
            </span>
          </p>
        </aside>
      </div>
    </div>
  );
}
