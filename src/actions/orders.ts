"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { invoiceNumber } from "@/lib/ids";
import { buildOrder, type OrderInput } from "@/lib/orders";
import { cartCount } from "@/lib/pricing";
import { countOrders, getOrderByRef, insertOrder, updateOrder } from "@/lib/store";
import type { CartLine, Fulfilment, PaymentMethod } from "@/lib/types";

export type CheckoutState = { error?: string };

const recentOrders = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ORDERS = 6;

function tooManyOrders(key: string): boolean {
  const now = Date.now();
  const stamps = (recentOrders.get(key) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  stamps.push(now);
  recentOrders.set(key, stamps);
  return stamps.length > MAX_ORDERS;
}

function parseLines(raw: unknown): CartLine[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function placeOrderAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const lines = parseLines(formData.get("cart"));
  if (cartCount(lines) === 0) {
    return { error: "Your cart is empty. Add something from the menu first." };
  }

  const user = await currentUser();
  const phoneKey = String(formData.get("customerPhone") ?? "").replace(/\D/g, "").slice(-9);
  if (tooManyOrders(phoneKey || "anonymous")) {
    return {
      error: "That is a lot of preorders in one go. Call the kitchen on +599 717 0240 and we sort it out.",
    };
  }

  const input: OrderInput = {
    lines,
    customerName: String(formData.get("customerName") ?? ""),
    customerPhone: String(formData.get("customerPhone") ?? ""),
    customerEmail: String(formData.get("customerEmail") ?? ""),
    fulfilment: (String(formData.get("fulfilment") ?? "pickup") as Fulfilment) ?? "pickup",
    zone: String(formData.get("zone") ?? ""),
    address: String(formData.get("address") ?? ""),
    note: String(formData.get("note") ?? ""),
    slot: String(formData.get("slot") ?? ""),
    promoCode: String(formData.get("promoCode") ?? "") || null,
    paymentMethod: String(formData.get("paymentMethod") ?? "qris") as PaymentMethod,
  };

  const result = await buildOrder(input, user);
  if (!result.ok) return { error: result.error };

  try {
    await insertOrder(result.order);
  } catch (error) {
    // The database is configured but unreachable (or the schema is missing).
    // Fail honestly: the order was NOT saved, so never pretend it was.
    console.error("[orders] Could not save the order:", error);
    return {
      error:
        "We could not save your order just now and nothing was charged. Please try again in a minute, or call the kitchen on +599 717 0240 and we take the order by phone.",
    };
  }
  revalidatePath("/admin/orders");
  redirect(`/pay/${result.order.ref}`);
}

export async function payOrderAction(formData: FormData): Promise<void> {
  const ref = String(formData.get("ref") ?? "");
  const order = await getOrderByRef(ref);
  if (!order) redirect("/orders");

  if (order.paymentStatus !== "paid") {
    const now = new Date().toISOString();
    const sequence = (await countOrders()) + 1;
    await updateOrder(ref, {
      paymentStatus: "paid",
      paidAt: now,
      status: "confirmed",
      invoiceNo: order.invoiceNo ?? invoiceNumber(order.createdAt, sequence),
      events: [
        ...order.events,
        { at: now, kind: "payment", label: `Payment received (${order.paymentMethod.replace("_", " ")})` },
        { at: now, kind: "status", label: "Confirmed by the kitchen" },
      ],
    });
  }

  revalidatePath(`/orders/${ref}`);
  revalidatePath("/admin/orders");
  redirect(`/orders/${ref}?paid=1`);
}

export async function failPaymentAction(formData: FormData): Promise<void> {
  const ref = String(formData.get("ref") ?? "");
  const order = await getOrderByRef(ref);
  if (!order) redirect("/orders");

  const now = new Date().toISOString();
  await updateOrder(ref, {
    paymentStatus: "failed",
    events: [...order.events, { at: now, kind: "payment", label: "Payment failed at the provider" }],
  });

  revalidatePath(`/pay/${ref}`);
  revalidatePath("/admin/orders");
}
