import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";
import { findUserById } from "@/lib/store";
import type { PublicUser, User } from "@/lib/types";

const COOKIE_NAME = "rb_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function secret(): string {
  return process.env.SESSION_SECRET ?? "rasa-bonaire-dev-secret-change-me";
}

type Payload = { sub: string; exp: number };

function sign(payload: Payload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

function readToken(token: string): Payload | null {
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const given = Buffer.from(mac);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    if (!payload.sub || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

export async function startSession(user: User): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, sign({ sub: user.id, exp: Date.now() + MAX_AGE_SECONDS * 1000 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

export async function currentUser(): Promise<PublicUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = readToken(token);
  if (!payload) return null;
  const user = await findUserById(payload.sub);
  return user ? toPublicUser(user) : null;
}

export async function requireUser(nextPath?: string): Promise<PublicUser> {
  const user = await currentUser();
  if (!user) {
    redirect(nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : "/login");
  }
  return user;
}

export async function requireAdmin(nextPath = "/admin"): Promise<PublicUser> {
  const user = await currentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  if (user.role !== "admin") redirect("/account?denied=1");
  return user;
}
