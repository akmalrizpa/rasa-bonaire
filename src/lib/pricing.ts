import { shop } from "@/data/shop";
import type { CartLine, Fulfilment, Product, Settings } from "@/lib/types";

export type PricedLine = {
  product: Product;
  qty: number;
  unitPriceCents: number;
  optionLabels: string[];
  note?: string;
  lineTotalCents: number;
};

export type LinePricing =
  | { ok: true; unitPriceCents: number; optionLabels: string[] }
  | { ok: false; error: string };

export function priceLine(product: Product, optionIds: string[], qty: number): LinePricing {
  if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
    return { ok: false, error: "Quantity has to be between 1 and 20." };
  }

  let extraCents = 0;
  const optionLabels: string[] = [];

  for (const group of product.optionGroups) {
    const chosen = group.options.filter((option) => optionIds.includes(option.id));

    if (group.kind === "single" && chosen.length > 1) {
      return { ok: false, error: `Pick only one option for ${group.label.toLowerCase()}.` };
    }
    if (group.required && chosen.length === 0) {
      return { ok: false, error: `${group.label} is required.` };
    }
    if (group.kind === "multi" && group.max && chosen.length > group.max) {
      return { ok: false, error: `${group.label}: ${group.max} extras is the limit.` };
    }

    for (const option of chosen) {
      extraCents += option.extraCents;
      optionLabels.push(option.label);
    }
  }

  return { ok: true, unitPriceCents: product.priceCents + extraCents, optionLabels };
}

export function priceCart(lines: CartLine[], products: Product[]): PricedLine[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  const priced: PricedLine[] = [];

  for (const line of lines) {
    const product = byId.get(line.productId);
    if (!product || !product.active) continue;
    const result = priceLine(product, line.optionIds ?? [], line.qty);
    if (!result.ok) continue;
    priced.push({
      product,
      qty: line.qty,
      unitPriceCents: result.unitPriceCents,
      optionLabels: result.optionLabels,
      note: line.note?.slice(0, 200),
      lineTotalCents: result.unitPriceCents * line.qty,
    });
  }

  return priced;
}

export type Promo = {
  code: string;
  kind: "percent" | "amount";
  value: number;
  minSubtotalCents: number;
  label: string;
};

export const promos: Promo[] = [
  {
    code: "RASA10",
    kind: "percent",
    value: 10,
    minSubtotalCents: 2000,
    label: "10% off, first preorder",
  },
  {
    code: "PICKUP5",
    kind: "amount",
    value: 500,
    minSubtotalCents: 3000,
    label: "$5 off orders over $30",
  },
];

export function resolvePromo(
  code: string | null | undefined,
  subtotalCents: number,
): { promo: Promo | null; discountCents: number; message: string } {
  const clean = (code ?? "").trim().toUpperCase();
  if (!clean) return { promo: null, discountCents: 0, message: "" };

  const promo = promos.find((entry) => entry.code === clean);
  if (!promo) return { promo: null, discountCents: 0, message: `Code ${clean} is not one we use.` };
  if (subtotalCents < promo.minSubtotalCents) {
    return {
      promo: null,
      discountCents: 0,
      message: `${clean} needs a subtotal of $${(promo.minSubtotalCents / 100).toFixed(2)}.`,
    };
  }

  const discountCents =
    promo.kind === "percent"
      ? Math.round((subtotalCents * promo.value) / 100)
      : Math.min(promo.value, subtotalCents);

  return { promo, discountCents, message: `${promo.code} applied — ${promo.label}.` };
}

export function deliveryFeeCents(zoneId: string, settings: Settings, subtotalCents: number): number {
  if (subtotalCents >= settings.freeDeliveryFromCents) return 0;
  const zone = shop.serviceZones.find((entry) => entry.id === zoneId);
  return zone ? zone.feeCents : settings.deliveryFeeCents;
}

export type Totals = {
  subtotalCents: number;
  deliveryCents: number;
  discountCents: number;
  totalCents: number;
  promo: Promo | null;
  promoMessage: string;
};

export function cartTotals(input: {
  lines: PricedLine[];
  fulfilment: Fulfilment;
  zoneId: string;
  promoCode: string | null | undefined;
  settings: Settings;
}): Totals {
  const subtotalCents = input.lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  const { promo, discountCents, message } = resolvePromo(input.promoCode, subtotalCents);
  const deliveryCents =
    input.fulfilment === "delivery" && subtotalCents > 0
      ? deliveryFeeCents(input.zoneId, input.settings, subtotalCents)
      : 0;

  return {
    subtotalCents,
    deliveryCents,
    discountCents,
    totalCents: Math.max(0, subtotalCents + deliveryCents - discountCents),
    promo,
    promoMessage: message,
  };
}

export function cartCount(lines: { qty: number }[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}
