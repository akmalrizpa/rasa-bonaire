import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { accountSeeds, DEFAULT_SETTINGS } from "@/data/accounts";
import { categories as catalogCategories, products as catalogProducts } from "@/data/catalog";
import { randomId } from "@/lib/ids";
import { hashPassword } from "@/lib/passwords";
import type {
  Category,
  Order,
  OrderEvent,
  OrderStatus,
  Product,
  Settings,
  StoreStats,
  User,
} from "@/lib/types";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const hasDatabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

let client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

function fail(message: string, error: unknown): never {
  const detail = error instanceof Error ? error.message : String(error);
  throw new Error(
    `${message} (${detail}). If this is a Supabase project, make sure you ran supabase/schema.sql in the SQL editor.`,
  );
}

/* ------------------------------- demo store ------------------------------- */

type Memory = {
  categories: Category[];
  products: Product[];
  orders: Order[];
  users: User[];
  settings: Settings;
};

const globalCache = globalThis as unknown as { __rasaMemory?: Memory };

function memory(): Memory {
  if (!globalCache.__rasaMemory) {
    const now = new Date().toISOString();
    globalCache.__rasaMemory = {
      categories: structuredClone(catalogCategories),
      products: structuredClone(catalogProducts),
      orders: [],
      users: accountSeeds.map((seed) => ({
        // Ids have to be derived, not random: on Vercel every serverless instance
        // seeds its own memory, and a random id would log the same person out
        // whenever the next request lands somewhere else.
        id: `u-${seed.username}`,
        username: seed.username,
        name: seed.name,
        email: seed.email,
        phone: seed.phone,
        role: seed.role,
        passwordHash: hashPassword(seed.username),
        createdAt: now,
      })),
      settings: { ...DEFAULT_SETTINGS },
    };
  }
  return globalCache.__rasaMemory;
}

/* ------------------------------ row mapping ------------------------------- */

function toProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    categoryId: String(row.category_id),
    name: String(row.name),
    description: String(row.description ?? ""),
    priceCents: Number(row.price_cents),
    unit: String(row.unit ?? ""),
    art: String(row.art ?? "plate"),
    badge: row.badge ? String(row.badge) : undefined,
    prepMinutes: Number(row.prep_minutes ?? 10),
    rating: Number(row.rating ?? 4.5),
    sold: Number(row.sold ?? 0),
    soldOut: Boolean(row.sold_out),
    active: row.is_active === undefined ? true : Boolean(row.is_active),
    optionGroups: (row.option_groups as Product["optionGroups"]) ?? [],
  };
}

function productRow(product: Product) {
  return {
    id: product.id,
    slug: product.slug,
    category_id: product.categoryId,
    name: product.name,
    description: product.description,
    price_cents: product.priceCents,
    unit: product.unit,
    art: product.art,
    badge: product.badge ?? null,
    prep_minutes: product.prepMinutes,
    rating: product.rating,
    sold: product.sold,
    sold_out: product.soldOut,
    is_active: product.active,
    option_groups: product.optionGroups,
  };
}

function toOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    ref: String(row.ref),
    userId: row.user_id ? String(row.user_id) : null,
    customerName: String(row.customer_name),
    customerPhone: String(row.customer_phone ?? ""),
    customerEmail: String(row.customer_email ?? ""),
    fulfilment: row.fulfilment === "delivery" ? "delivery" : "pickup",
    address: String(row.address ?? ""),
    zone: String(row.zone ?? ""),
    note: String(row.note ?? ""),
    slot: String(row.slot ?? ""),
    serviceDate: String(row.service_date ?? ""),
    items: (row.items as Order["items"]) ?? [],
    subtotalCents: Number(row.subtotal_cents),
    deliveryCents: Number(row.delivery_cents),
    discountCents: Number(row.discount_cents),
    totalCents: Number(row.total_cents),
    promoCode: row.promo_code ? String(row.promo_code) : null,
    paymentMethod: (row.payment_method as Order["paymentMethod"]) ?? "qris",
    paymentStatus: (row.payment_status as Order["paymentStatus"]) ?? "unpaid",
    paidAt: row.paid_at ? String(row.paid_at) : null,
    status: (row.status as OrderStatus) ?? "pending",
    invoiceNo: row.invoice_no ? String(row.invoice_no) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    events: (row.events as OrderEvent[]) ?? [],
  };
}

function orderRow(order: Order) {
  return {
    id: order.id,
    ref: order.ref,
    user_id: order.userId,
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_email: order.customerEmail,
    fulfilment: order.fulfilment,
    address: order.address,
    zone: order.zone,
    note: order.note,
    slot: order.slot,
    service_date: order.serviceDate,
    items: order.items,
    subtotal_cents: order.subtotalCents,
    delivery_cents: order.deliveryCents,
    discount_cents: order.discountCents,
    total_cents: order.totalCents,
    promo_code: order.promoCode,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    paid_at: order.paidAt,
    status: order.status,
    invoice_no: order.invoiceNo,
    created_at: order.createdAt,
    updated_at: order.updatedAt,
    events: order.events,
  };
}

function toUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    username: String(row.username),
    name: String(row.name),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    role: row.role === "admin" ? "admin" : "customer",
    passwordHash: String(row.password_hash),
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function toSettings(row: Record<string, unknown>): Settings {
  return {
    storeOpen: Boolean(row.store_open),
    announcement: String(row.announcement ?? ""),
    deliveryFeeCents: Number(row.delivery_fee_cents ?? DEFAULT_SETTINGS.deliveryFeeCents),
    freeDeliveryFromCents: Number(
      row.free_delivery_from_cents ?? DEFAULT_SETTINGS.freeDeliveryFromCents,
    ),
    pickupAddress: String(row.pickup_address ?? DEFAULT_SETTINGS.pickupAddress),
    prepNote: String(row.prep_note ?? DEFAULT_SETTINGS.prepNote),
  };
}

/* -------------------------------- seeding --------------------------------- */

let seedPromise: Promise<void> | null = null;

async function seedDatabase(): Promise<void> {
  const supabase = db();

  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true });
  if (error) fail("Could not read the products table", error);
  if (count && count > 0) return;

  const { error: categoryError } = await supabase.from("categories").upsert(
    catalogCategories.map((category) => ({
      id: category.id,
      name: category.name,
      blurb: category.blurb,
      sort: category.sort,
    })),
    { onConflict: "id" },
  );
  if (categoryError) fail("Could not seed categories", categoryError);

  const { error: productError } = await supabase
    .from("products")
    .upsert(catalogProducts.map(productRow), { onConflict: "id" });
  if (productError) fail("Could not seed the menu", productError);

  const { count: userCount, error: userCountError } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true });
  if (userCountError) fail("Could not read the users table", userCountError);

  if (!userCount) {
    const now = new Date().toISOString();
    const { error: userError } = await supabase.from("users").insert(
      accountSeeds.map((seed) => ({
        id: randomId("u"),
        username: seed.username,
        name: seed.name,
        email: seed.email,
        phone: seed.phone,
        role: seed.role,
        password_hash: hashPassword(seed.username),
        created_at: now,
      })),
    );
    if (userError) fail("Could not seed demo accounts", userError);
  }

  const { error: settingsError } = await supabase
    .from("settings")
    .upsert({ key: "store", value: DEFAULT_SETTINGS }, { onConflict: "key" });
  if (settingsError) fail("Could not seed settings", settingsError);
}

async function ensureSeeded(): Promise<void> {
  if (!hasDatabase) return;
  seedPromise ??= seedDatabase().catch((error) => {
    seedPromise = null;
    throw error;
  });
  return seedPromise;
}

/* ------------------------------- categories ------------------------------- */

export async function listCategories(): Promise<Category[]> {
  if (!hasDatabase) {
    return [...memory().categories].sort((a, b) => a.sort - b.sort);
  }
  await ensureSeeded();
  const { data, error } = await db().from("categories").select("*").order("sort");
  if (error) fail("Could not load categories", error);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    blurb: String(row.blurb ?? ""),
    sort: Number(row.sort ?? 0),
  }));
}

/* -------------------------------- products -------------------------------- */

export async function listProducts(): Promise<Product[]> {
  if (!hasDatabase) return [...memory().products];
  await ensureSeeded();
  const { data, error } = await db().from("products").select("*").order("name");
  if (error) fail("Could not load the menu", error);
  return (data ?? []).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasDatabase) return memory().products.find((product) => product.slug === slug) ?? null;
  await ensureSeeded();
  const { data, error } = await db().from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) fail("Could not load that dish", error);
  return data ? toProduct(data) : null;
}

export async function updateProduct(id: string, patch: Partial<Product>): Promise<void> {
  if (!hasDatabase) {
    const products = memory().products;
    const index = products.findIndex((product) => product.id === id);
    if (index >= 0) products[index] = { ...products[index], ...patch };
    return;
  }
  await ensureSeeded();
  const current = await db().from("products").select("*").eq("id", id).maybeSingle();
  if (current.error) fail("Could not load that dish", current.error);
  if (!current.data) return;
  const merged: Product = { ...toProduct(current.data), ...patch };
  const { error } = await db().from("products").update(productRow(merged)).eq("id", id);
  if (error) fail("Could not save the dish", error);
}

export async function createProduct(product: Product): Promise<void> {
  if (!hasDatabase) {
    memory().products.unshift(product);
    return;
  }
  await ensureSeeded();
  const { error } = await db().from("products").insert(productRow(product));
  if (error) fail("Could not create the dish", error);
}

/* --------------------------------- orders --------------------------------- */

export async function insertOrder(order: Order): Promise<void> {
  if (!hasDatabase) {
    memory().orders.unshift(order);
    return;
  }
  await ensureSeeded();
  const { error } = await db().from("orders").insert(orderRow(order));
  if (error) fail("Could not save the order", error);
}

export async function getOrderByRef(ref: string): Promise<Order | null> {
  if (!hasDatabase) return memory().orders.find((order) => order.ref === ref) ?? null;
  await ensureSeeded();
  const { data, error } = await db().from("orders").select("*").eq("ref", ref).maybeSingle();
  if (error) fail("Could not load that order", error);
  return data ? toOrder(data) : null;
}

export async function listOrders(filter?: {
  userId?: string;
  status?: OrderStatus;
  limit?: number;
}): Promise<Order[]> {
  if (!hasDatabase) {
    let orders = [...memory().orders];
    if (filter?.userId) orders = orders.filter((order) => order.userId === filter.userId);
    if (filter?.status) orders = orders.filter((order) => order.status === filter.status);
    orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return filter?.limit ? orders.slice(0, filter.limit) : orders;
  }

  await ensureSeeded();
  let query = db().from("orders").select("*").order("created_at", { ascending: false });
  if (filter?.userId) query = query.eq("user_id", filter.userId);
  if (filter?.status) query = query.eq("status", filter.status);
  if (filter?.limit) query = query.limit(filter.limit);
  const { data, error } = await query;
  if (error) fail("Could not load orders", error);
  return (data ?? []).map(toOrder);
}

export async function updateOrder(ref: string, patch: Partial<Order>): Promise<Order | null> {
  const existing = await getOrderByRef(ref);
  if (!existing) return null;
  const merged: Order = { ...existing, ...patch, updatedAt: new Date().toISOString() };

  if (!hasDatabase) {
    const orders = memory().orders;
    const index = orders.findIndex((order) => order.ref === ref);
    orders[index] = merged;
    return merged;
  }

  const { error } = await db()
    .from("orders")
    .update({
      payment_status: merged.paymentStatus,
      paid_at: merged.paidAt,
      status: merged.status,
      invoice_no: merged.invoiceNo,
      events: merged.events,
      updated_at: merged.updatedAt,
    })
    .eq("ref", ref);
  if (error) fail("Could not update the order", error);
  return merged;
}

export async function countOrders(): Promise<number> {
  if (!hasDatabase) return memory().orders.length;
  await ensureSeeded();
  const { count, error } = await db().from("orders").select("id", { count: "exact", head: true });
  if (error) fail("Could not count orders", error);
  return count ?? 0;
}

/* ---------------------------------- users --------------------------------- */

export async function findUserByUsername(username: string): Promise<User | null> {
  const clean = username.trim().toLowerCase();
  if (!hasDatabase) {
    return memory().users.find((user) => user.username.toLowerCase() === clean) ?? null;
  }
  await ensureSeeded();
  const { data, error } = await db().from("users").select("*").ilike("username", clean).maybeSingle();
  if (error) fail("Could not check that username", error);
  return data ? toUser(data) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  if (!hasDatabase) return memory().users.find((user) => user.id === id) ?? null;
  await ensureSeeded();
  const { data, error } = await db().from("users").select("*").eq("id", id).maybeSingle();
  if (error) fail("Could not load that account", error);
  return data ? toUser(data) : null;
}

export async function listUsers(): Promise<User[]> {
  if (!hasDatabase) return [...memory().users].sort((a, b) => a.username.localeCompare(b.username));
  await ensureSeeded();
  const { data, error } = await db().from("users").select("*").order("username");
  if (error) fail("Could not load accounts", error);
  return (data ?? []).map(toUser);
}

export async function insertUser(user: User): Promise<void> {
  if (!hasDatabase) {
    memory().users.push(user);
    return;
  }
  await ensureSeeded();
  const { error } = await db().from("users").insert({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    password_hash: user.passwordHash,
    created_at: user.createdAt,
  });
  if (error) fail("Could not create that account", error);
}

export async function updateUser(id: string, patch: Partial<User>): Promise<void> {
  if (!hasDatabase) {
    const users = memory().users;
    const index = users.findIndex((user) => user.id === id);
    if (index >= 0) users[index] = { ...users[index], ...patch };
    return;
  }
  await ensureSeeded();
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (patch.role !== undefined) row.role = patch.role;
  if (patch.passwordHash !== undefined) row.password_hash = patch.passwordHash;
  const { error } = await db().from("users").update(row).eq("id", id);
  if (error) fail("Could not update that account", error);
}

/* -------------------------------- settings -------------------------------- */

export async function getSettings(): Promise<Settings> {
  if (!hasDatabase) return { ...memory().settings };
  await ensureSeeded();
  const { data, error } = await db().from("settings").select("*").eq("key", "store").maybeSingle();
  if (error) fail("Could not load settings", error);
  return data ? toSettings(data.value as Record<string, unknown>) : { ...DEFAULT_SETTINGS };
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const merged = { ...(await getSettings()), ...patch };
  if (!hasDatabase) {
    memory().settings = merged;
    return merged;
  }
  const { error } = await db()
    .from("settings")
    .upsert({ key: "store", value: merged }, { onConflict: "key" });
  if (error) fail("Could not save settings", error);
  return merged;
}

/* --------------------------------- reports -------------------------------- */

export async function getStats(): Promise<StoreStats> {
  const orders = await listOrders();
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);

  const today = orders.filter((order) => order.createdAt.slice(0, 10) === todayKey);
  const paid = orders.filter((order) => order.paymentStatus === "paid");
  const open = orders.filter(
    (order) => !["completed", "cancelled"].includes(order.status) && order.paymentStatus === "paid",
  );

  const itemCounts = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items) {
      itemCounts.set(item.name, (itemCounts.get(item.name) ?? 0) + item.qty);
    }
  }

  const week: { label: string; cents: number }[] = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - offset);
    const key = day.toISOString().slice(0, 10);
    week.push({
      label: new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(day),
      cents: paid
        .filter((order) => order.createdAt.slice(0, 10) === key)
        .reduce((sum, order) => sum + order.totalCents, 0),
    });
  }

  const revenueTodayCents = today
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.totalCents, 0);

  return {
    ordersToday: today.length,
    revenueTodayCents,
    openOrders: open.length,
    averageTicketCents: paid.length
      ? Math.round(paid.reduce((sum, order) => sum + order.totalCents, 0) / paid.length)
      : 0,
    topItems: [...itemCounts.entries()]
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5),
    week,
  };
}
