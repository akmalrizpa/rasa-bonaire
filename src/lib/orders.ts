import { randomId, orderRef } from "@/lib/ids";
import { priceCart, cartTotals } from "@/lib/pricing";
import { findSlot, serviceDate } from "@/lib/slots";
import { getSettings, listProducts } from "@/lib/store";
import type {
  CartLine,
  Fulfilment,
  Order,
  PaymentMethod,
  PublicUser,
} from "@/lib/types";

export type OrderInput = {
  lines: CartLine[];
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  fulfilment: Fulfilment;
  zone: string;
  address: string;
  note: string;
  slot: string;
  promoCode: string | null;
  paymentMethod: PaymentMethod;
};

export type BuildOrderResult = { ok: true; order: Order } | { ok: false; error: string };

const PAYMENT_METHODS: PaymentMethod[] = ["qris", "bank_transfer", "ewallet", "cash"];

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function buildOrder(input: OrderInput, user: PublicUser | null): Promise<BuildOrderResult> {
  const lines = Array.isArray(input?.lines) ? input.lines.slice(0, 30) : [];
  if (lines.length === 0) return { ok: false, error: "Your cart is empty." };

  const customerName = text(input.customerName, 80);
  const customerPhone = text(input.customerPhone, 30);
  const customerEmail = text(input.customerEmail, 120);
  const address = text(input.address, 200);
  const note = text(input.note, 400);
  const zone = text(input.zone, 40);
  const fulfilment: Fulfilment = input.fulfilment === "delivery" ? "delivery" : "pickup";
  const paymentMethod = PAYMENT_METHODS.includes(input.paymentMethod) ? input.paymentMethod : "qris";

  if (customerName.length < 2) return { ok: false, error: "We need a name for the order." };
  if (customerPhone.replace(/\D/g, "").length < 7) {
    return { ok: false, error: "That phone number looks too short. We call when the food is ready." };
  }
  if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(customerEmail)) {
    return { ok: false, error: "That email address is not complete." };
  }
  if (fulfilment === "delivery" && address.length < 6) {
    return { ok: false, error: "Delivery needs a street and house number." };
  }
  if (fulfilment === "delivery" && !zone) {
    return { ok: false, error: "Pick the delivery zone so we know the right fee." };
  }

  const slot = findSlot(input.slot);
  if (!slot || slot.kind !== fulfilment) {
    return { ok: false, error: "That time slot is no longer available. Pick another one." };
  }

  const [products, settings] = await Promise.all([listProducts(), getSettings()]);
  if (!settings.storeOpen) {
    return {
      ok: false,
      error: "The kitchen is closed for today. Preorders reopen with the next batch.",
    };
  }
  const priced = priceCart(lines, products);
  if (priced.length === 0) {
    return { ok: false, error: "Nothing in the cart is available right now." };
  }
  if (priced.some((line) => line.product.soldOut)) {
    const soldOut = priced.find((line) => line.product.soldOut);
    return { ok: false, error: `${soldOut?.product.name} sold out. Take it out and try again.` };
  }

  const totals = cartTotals({
    lines: priced,
    fulfilment,
    zoneId: zone,
    promoCode: input.promoCode,
    settings,
  });

  const now = new Date().toISOString();
  const order: Order = {
    id: randomId("o"),
    ref: orderRef(),
    userId: user?.id ?? null,
    customerName,
    customerPhone,
    customerEmail,
    fulfilment,
    address: fulfilment === "delivery" ? address : "",
    zone: fulfilment === "delivery" ? zone : "",
    note,
    slot: slot.label,
    serviceDate: slot.serviceDate || serviceDate(),
    items: priced.map((line) => ({
      productId: line.product.id,
      slug: line.product.slug,
      name: line.product.name,
      unit: line.product.unit,
      unitPriceCents: line.unitPriceCents,
      qty: line.qty,
      optionLabels: line.optionLabels,
      note: line.note,
    })),
    subtotalCents: totals.subtotalCents,
    deliveryCents: totals.deliveryCents,
    discountCents: totals.discountCents,
    totalCents: totals.totalCents,
    promoCode: totals.promo?.code ?? null,
    paymentMethod,
    paymentStatus: "unpaid",
    paidAt: null,
    status: "pending",
    invoiceNo: null,
    createdAt: now,
    updatedAt: now,
    events: [{ at: now, kind: "status", label: "Preorder placed, waiting for payment" }],
  };

  return { ok: true, order };
}
