export type Role = "admin" | "customer";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "cooking"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export type PaymentMethod = "qris" | "bank_transfer" | "ewallet" | "cash";

export type Fulfilment = "pickup" | "delivery";

export type Option = {
  id: string;
  label: string;
  extraCents: number;
};

export type OptionGroup = {
  id: string;
  label: string;
  help?: string;
  kind: "single" | "multi";
  required: boolean;
  max?: number;
  defaultOptionId?: string;
  options: Option[];
};

export type Category = {
  id: string;
  name: string;
  blurb: string;
  sort: number;
};

export type Product = {
  id: string;
  slug: string;
  categoryId: string;
  name: string;
  description: string;
  priceCents: number;
  unit: string;
  art: string;
  badge?: string;
  prepMinutes: number;
  rating: number;
  sold: number;
  soldOut: boolean;
  active: boolean;
  optionGroups: OptionGroup[];
};

/** What the browser sends us. Never trusted: totals are recalculated on the server. */
export type CartLine = {
  productId: string;
  qty: number;
  optionIds: string[];
  note?: string;
};

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  unit: string;
  unitPriceCents: number;
  qty: number;
  optionLabels: string[];
  note?: string;
};

export type OrderEvent = {
  at: string;
  kind: "status" | "payment" | "note";
  label: string;
};

export type Order = {
  id: string;
  ref: string;
  userId: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  fulfilment: Fulfilment;
  address: string;
  zone: string;
  note: string;
  slot: string;
  serviceDate: string;
  items: OrderItem[];
  subtotalCents: number;
  deliveryCents: number;
  discountCents: number;
  totalCents: number;
  promoCode: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  status: OrderStatus;
  invoiceNo: string | null;
  createdAt: string;
  updatedAt: string;
  events: OrderEvent[];
};

export type User = {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
};

export type PublicUser = Omit<User, "passwordHash">;

export type Settings = {
  storeOpen: boolean;
  announcement: string;
  deliveryFeeCents: number;
  freeDeliveryFromCents: number;
  pickupAddress: string;
  prepNote: string;
};

export type StoreStats = {
  ordersToday: number;
  revenueTodayCents: number;
  openOrders: number;
  averageTicketCents: number;
  topItems: { name: string; qty: number }[];
  week: { label: string; cents: number }[];
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "cooking",
  "ready",
  "completed",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Waiting for payment",
  confirmed: "Confirmed, in the queue",
  cooking: "Cooking now",
  ready: "Ready for pickup",
  completed: "Handed over",
  cancelled: "Cancelled",
};
