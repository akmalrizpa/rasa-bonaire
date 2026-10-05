import { pill } from "@/components/ui";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

const statusTone: Record<OrderStatus, string> = {
  pending: "bg-warn-soft text-warn",
  confirmed: "bg-sea-soft text-sea",
  cooking: "bg-accent-soft text-accent",
  ready: "bg-ok-soft text-ok",
  completed: "bg-sand text-ink-soft",
  cancelled: "bg-sand text-muted",
};

const statusText: Record<OrderStatus, string> = {
  pending: "Unpaid",
  confirmed: "In the queue",
  cooking: "Cooking",
  ready: "Ready",
  completed: "Handed over",
  cancelled: "Cancelled",
};

const paymentTone: Record<PaymentStatus, string> = {
  unpaid: "bg-warn-soft text-warn",
  paid: "bg-ok-soft text-ok",
  failed: "bg-accent-soft text-accent",
  refunded: "bg-sand text-muted",
};

const paymentText: Record<PaymentStatus, string> = {
  unpaid: "Awaiting payment",
  paid: "Paid",
  failed: "Payment failed",
  refunded: "Refunded",
};

export function StatusPill({ status, live = false }: { status: OrderStatus; live?: boolean }) {
  return (
    <span className={`${pill} ${statusTone[status]}`}>
      {live && status === "cooking" ? (
        <span className="size-1.5 animate-ping rounded-full bg-accent" />
      ) : null}
      {statusText[status]}
    </span>
  );
}

export function PaymentPill({ status }: { status: PaymentStatus }) {
  return <span className={`${pill} ${paymentTone[status]}`}>{paymentText[status]}</span>;
}
