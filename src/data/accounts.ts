import type { Settings, User } from "@/lib/types";

export const DEFAULT_SETTINGS: Settings = {
  storeOpen: true,
  announcement:
    "Preorder for tonight closes at 15:00. Free delivery in Kralendijk from $35.",
  deliveryFeeCents: 350,
  freeDeliveryFromCents: 3500,
  pickupAddress: "Kaya Grandi 24, Kralendijk",
  prepNote:
    "We cook after preorder closes, so nothing sits under a lamp. Your batch slot is the pickup window, not the cooking time.",
};

/** Demo logins. Every account uses its own username as password. */
export const accountSeeds: Pick<User, "username" | "name" | "email" | "phone" | "role">[] = [
  {
    username: "admin",
    name: "Yanti Rodrigues",
    email: "dapur@rasabonaire.com",
    phone: "+599 717 0240",
    role: "admin",
  },
  {
    username: "user",
    name: "Marisol Croes",
    email: "marisol@example.com",
    phone: "+599 780 1122",
    role: "customer",
  },
  {
    username: "daan",
    name: "Daan Winklaar",
    email: "daan@example.com",
    phone: "+599 780 3344",
    role: "customer",
  },
  {
    username: "sofie",
    name: "Sofie Bakker",
    email: "sofie@example.com",
    phone: "+599 780 5566",
    role: "customer",
  },
];
