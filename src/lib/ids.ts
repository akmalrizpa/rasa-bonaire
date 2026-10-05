import { randomBytes } from "node:crypto";

const REF_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function orderRef(): string {
  const bytes = randomBytes(5);
  let out = "";
  for (const byte of bytes) out += REF_ALPHABET[byte % REF_ALPHABET.length];
  return `RB-${out}`;
}

export function randomId(prefix: string): string {
  return `${prefix}-${randomBytes(6).toString("hex")}`;
}

export function invoiceNumber(createdAt: string, index: number): string {
  const year = new Date(createdAt).getFullYear();
  return `INV-${year}-${String(index).padStart(5, "0")}`;
}

export function newUserId(): string {
  return randomId("u");
}
