"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { endSession, currentUser, startSession } from "@/lib/auth";
import { newUserId } from "@/lib/ids";
import { hashPassword, verifyPassword } from "@/lib/passwords";
import { findUserByUsername, insertUser, updateUser } from "@/lib/store";

export type AuthState = { error?: string; notice?: string };

const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function throttled(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

function safeNext(value: unknown): string | null {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!username || !password) return { error: "Fill in your username and password." };
  if (throttled(`login:${username}`)) {
    return { error: "Too many attempts. Wait five minutes and try again." };
  }

  const user = await findUserByUsername(username);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "That username and password do not match our records." };
  }

  await startSession(user);
  redirect(next ?? (user.role === "admin" ? "/admin" : "/orders"));
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { error: "Username: 3–20 characters, letters, numbers or underscore." };
  }
  if (name.length < 2) return { error: "We need a name on the account." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { error: "That email address is not complete." };
  }
  if (phone.replace(/\D/g, "").length < 7) {
    return { error: "A phone number helps us reach you about pickups." };
  }
  if (password.length < 6) return { error: "Password needs at least six characters." };
  if (throttled(`register:${username}`)) {
    return { error: "Too many sign-ups from here. Try again in five minutes." };
  }

  const existing = await findUserByUsername(username);
  if (existing) return { error: "That username is taken." };

  const user = {
    id: newUserId(),
    username,
    name,
    email,
    phone,
    role: "customer" as const,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  await insertUser(user);
  await startSession(user);
  redirect("/orders");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/");
}

export async function updateProfileAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const user = await currentUser();
  if (!user) redirect("/login?next=%2Faccount");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (name.length < 2) return { error: "Name is too short." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { error: "That email address is not complete." };
  }

  await updateUser(user.id, { name, email, phone });
  revalidatePath("/account");
  return { notice: "Saved. The kitchen sees the new details on your next order." };
}
