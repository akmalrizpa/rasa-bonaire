"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { randomId } from "@/lib/ids";
import {
  createProduct,
  getOrderByRef,
  listProducts,
  listUsers,
  saveSettings,
  updateOrder,
  updateProduct,
  updateUser,
} from "@/lib/store";
import { ORDER_STATUS_LABEL, type OrderStatus, type Product, type Role } from "@/lib/types";

export type AdminState = { error?: string; notice?: string };

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "cooking",
  "ready",
  "completed",
  "cancelled",
];

function isStatus(value: string): value is OrderStatus {
  return (STATUSES as string[]).includes(value);
}

/** Dollars in a form field to integer cents. Null when the field is not a number. */
function toCents(value: unknown): number | null {
  const raw = String(value ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const cents = Math.round(Number(raw) * 100);
  return Number.isFinite(cents) && cents >= 0 ? cents : null;
}

function toMinutes(value: unknown): number {
  const minutes = Math.round(Number(value));
  return Number.isFinite(minutes) && minutes > 0 ? Math.min(600, minutes) : 10;
}

function has(formData: FormData, key: string): boolean {
  return formData.get(key) !== null;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Wraps a database write so a broken connection surfaces as a form error
 *  instead of crashing the admin page. Nothing is reported as saved when it
 *  was not. */
async function guarded(run: () => Promise<AdminState>): Promise<AdminState> {
  try {
    return await run();
  } catch (error) {
    console.error("[admin] Database write failed:", error);
    return {
      error:
        "The database did not accept that change, so it was not saved. Try again in a minute — and check /api/health if it keeps failing.",
    };
  }
}

export async function setOrderStatusAction(formData: FormData): Promise<AdminState> {
  await requireAdmin();

  const ref = String(formData.get("ref") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!ref || !isStatus(status)) return { error: "That status change did not come through." };

  const order = await getOrderByRef(ref);
  if (!order) return { error: `${ref} is not in the book any more.` };

  const now = new Date().toISOString();
  const cashOnPickup =
    status === "completed" && order.paymentMethod === "cash" && order.paymentStatus !== "paid";

  return guarded(async () => {
    await updateOrder(ref, {
      status,
      events: [
        ...order.events,
        { at: now, kind: "status", label: note || ORDER_STATUS_LABEL[status] },
      ],
      ...(cashOnPickup
        ? { paymentStatus: "paid" as const, paidAt: order.paidAt ?? now }
        : {}),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/orders/${ref}`);

    return { notice: `${ref}: ${ORDER_STATUS_LABEL[status]}` };
  });
}

export async function updateDishAction(formData: FormData): Promise<AdminState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "No dish id in that form." };

  const existing = (await listProducts()).find((product) => product.id === id);
  if (!existing) return { error: "That dish is not on the menu." };

  const priceCents = toCents(formData.get("priceDollars"));
  if (priceCents === null) return { error: "Price has to be a number, like 16.50." };

  const name = has(formData, "name") ? String(formData.get("name")).trim() : existing.name;
  if (name.length < 2) return { error: "The dish needs a name." };

  const badge = has(formData, "badge") ? String(formData.get("badge")).trim() : existing.badge ?? "";

  return guarded(async () => {
    await updateProduct(id, {
      name,
      description: has(formData, "description")
        ? String(formData.get("description")).trim()
        : existing.description,
      badge: badge || undefined,
      priceCents,
      prepMinutes: toMinutes(formData.get("prepMinutes")),
      soldOut: formData.get("soldOut") === "on",
      active: formData.get("active") === "on",
    });

    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath(`/menu/${existing.slug}`);

    return { notice: `${name} saved.` };
  });
}

export async function createDishAction(formData: FormData): Promise<AdminState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Give the dish a name." };

  const slug = slugify(String(formData.get("slug") ?? "")) || slugify(name);
  if (!slug) return { error: "Slug: letters and numbers, dashes between words." };

  const categoryId = String(formData.get("categoryId") ?? "").trim();
  if (!categoryId) return { error: "Pick a category for the dish." };

  const priceCents = toCents(formData.get("priceDollars"));
  if (priceCents === null) return { error: "Price has to be a number, like 16.50." };

  const products = await listProducts();
  if (products.some((product) => product.slug === slug)) {
    return { error: `/menu/${slug} is already taken. Pick another slug.` };
  }

  const product: Product = {
    id: randomId("p"),
    slug,
    categoryId,
    name,
    description: String(formData.get("description") ?? "").trim(),
    priceCents,
    unit: String(formData.get("unit") ?? "").trim() || "per portion",
    art: String(formData.get("art") ?? "plate").trim() || "plate",
    badge: undefined,
    prepMinutes: toMinutes(formData.get("prepMinutes")),
    rating: 4.7,
    sold: 0,
    soldOut: false,
    active: true,
    optionGroups: [],
  };

  return guarded(async () => {
    await createProduct(product);

    revalidatePath("/admin/menu");
    revalidatePath("/menu");

    return { notice: `${name} is on the menu with no variants.` };
  });
}

export async function saveSettingsAction(
  _prev: AdminState,
  formData: FormData,
): Promise<AdminState> {
  await requireAdmin();

  const deliveryFeeCents = toCents(formData.get("deliveryFeeDollars"));
  const freeDeliveryFromCents = toCents(formData.get("freeDeliveryFromDollars"));
  if (deliveryFeeCents === null || freeDeliveryFromCents === null) {
    return { error: "Delivery fees have to be numbers, like 3.50 or 0." };
  }

  return guarded(async () => {
    await saveSettings({
      storeOpen: formData.get("storeOpen") === "on",
      announcement: String(formData.get("announcement") ?? "").trim(),
      deliveryFeeCents,
      freeDeliveryFromCents,
      pickupAddress: String(formData.get("pickupAddress") ?? "").trim(),
      prepNote: String(formData.get("prepNote") ?? "").trim(),
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");

    return { notice: "Saved. The shop pages use this on the next load." };
  });
}

export async function setUserRoleAction(formData: FormData): Promise<AdminState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  if (!id || (role !== "admin" && role !== "customer")) {
    return { error: "Pick a role from the list." };
  }

  const users = await listUsers();
  const target = users.find((user) => user.id === id);
  if (!target) return { error: "That account is gone." };

  const admins = users.filter((user) => user.role === "admin");
  if (target.role === "admin" && role === "customer" && admins.length <= 1) {
    return { error: `${target.username} is the only admin. Promote someone else first.` };
  }

  return guarded(async () => {
    await updateUser(id, { role });
    revalidatePath("/admin/customers");

    return { notice: `${target.username} is now ${role === "admin" ? "an admin" : "a customer"}.` };
  });
}
