import { shop } from "@/data/shop";
import type { Fulfilment } from "@/lib/types";

const AST_OFFSET_MS = -4 * 60 * 60 * 1000; // Bonaire is UTC-4 all year.

export type Slot = {
  id: string;
  label: string;
  kind: Fulfilment;
  serviceDate: string;
};

function astNow(now: Date): Date {
  return new Date(now.getTime() + AST_OFFSET_MS);
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** The day the kitchen cooks for: today before the cut-off, otherwise the next open day. */
export function serviceDate(now = new Date()): string {
  const ast = astNow(now);
  const day = new Date(
    Date.UTC(ast.getUTCFullYear(), ast.getUTCMonth(), ast.getUTCDate(), 12, 0, 0),
  );
  if (ast.getUTCHours() >= shop.preorderClosesAt) day.setUTCDate(day.getUTCDate() + 1);
  while (day.getUTCDay() === 1 || day.getUTCDay() === 2) {
    day.setUTCDate(day.getUTCDate() + 1);
  }
  return isoDate(day);
}

/** When the current batch stops taking orders. */
export function closesAt(now = new Date()): Date {
  const ast = astNow(now);
  const cutoff = new Date(
    Date.UTC(ast.getUTCFullYear(), ast.getUTCMonth(), ast.getUTCDate(), shop.preorderClosesAt, 0, 0),
  );
  if (ast.getTime() >= cutoff.getTime()) cutoff.setUTCDate(cutoff.getUTCDate() + 1);
  while (cutoff.getUTCDay() === 1 || cutoff.getUTCDay() === 2) {
    cutoff.setUTCDate(cutoff.getUTCDate() + 1);
  }
  return new Date(cutoff.getTime() - AST_OFFSET_MS);
}

export function msUntilClose(now = new Date()): number {
  return Math.max(0, closesAt(now).getTime() - now.getTime());
}

export function listSlots(now = new Date()): Slot[] {
  const day = serviceDate(now);
  const weekday = new Date(`${day}T12:00:00Z`).getUTCDay();
  const weekend = weekday === 0 || weekday === 6;
  const first = weekend ? 12 * 60 : 17 * 60;
  const slots: Slot[] = [];

  for (let minutes = first; minutes <= 20 * 60 + 30; minutes += 30) {
    const from = clock(minutes);
    const to = clock(minutes + 30);
    slots.push({
      id: `pickup-${minutes}`,
      kind: "pickup",
      serviceDate: day,
      label: `${from} – ${to}`,
    });
  }

  for (let minutes = first + 30; minutes <= 20 * 60 + 30; minutes += 30) {
    const from = clock(minutes);
    const to = clock(minutes + 30);
    slots.push({
      id: `delivery-${minutes}`,
      kind: "delivery",
      serviceDate: day,
      label: `${from} – ${to}`,
    });
  }

  return slots;
}

export function findSlot(slotId: string, now = new Date()): Slot | undefined {
  return listSlots(now).find((slot) => slot.id === slotId);
}

function clock(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
