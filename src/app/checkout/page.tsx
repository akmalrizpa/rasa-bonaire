import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";
import { pageShell } from "@/components/ui";
import { currentUser } from "@/lib/auth";
import { listSlots } from "@/lib/slots";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Pick your batch slot, tell us where to send it, and pay for the preorder.",
};

export default async function CheckoutPage() {
  const [user, settings, slots] = await Promise.all([currentUser(), getSettings(), listSlots()]);

  return (
    <div className={`${pageShell} py-10`}>
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl">Checkout</h1>
        <p className="mt-3 text-sm text-muted">
          We cook one batch a day and preorder closes at 15:00. Your slot is when the food is ready
          at Kaya Grandi 24, not when we start cooking.
        </p>
      </header>

      <div className="mt-9">
        <CheckoutForm user={user} settings={settings} slots={slots} />
      </div>
    </div>
  );
}
