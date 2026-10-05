import type { Metadata } from "next";
import { CartView } from "@/components/CartView";
import { pageShell } from "@/components/ui";
import { getSettings } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Check the dishes, quantities and kitchen notes before you pick a batch slot.",
};

export default async function CartPage() {
  const settings = await getSettings();

  return (
    <div className={`${pageShell} py-10`}>
      <CartView freeDeliveryFromCents={settings.freeDeliveryFromCents} />
    </div>
  );
}
