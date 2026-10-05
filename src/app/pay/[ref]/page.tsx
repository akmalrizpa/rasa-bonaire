import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PaymentPanel } from "@/components/PaymentPanel";
import { pageShell } from "@/components/ui";
import { getOrderByRef } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment",
  description: "Finish the preorder so the kitchen can put your dish in the batch.",
};

export default async function PayPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const order = await getOrderByRef(ref);
  if (!order) notFound();
  if (order.paymentStatus === "paid") redirect(`/orders/${ref}`);

  return (
    <div className={`${pageShell} py-10`}>
      <PaymentPanel order={order} />
    </div>
  );
}
