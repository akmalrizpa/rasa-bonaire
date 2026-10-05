import { NextResponse } from "next/server";
import { getOrderByRef } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const order = await getOrderByRef(ref);

  if (!order) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({
    ref: order.ref,
    status: order.status,
    paymentStatus: order.paymentStatus,
    updatedAt: order.updatedAt,
    slot: order.slot,
    events: order.events.map((event) => ({ at: event.at, label: event.label })),
  });
}
