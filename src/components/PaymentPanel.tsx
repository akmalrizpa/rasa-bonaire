"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { failPaymentAction, payOrderAction } from "@/actions/orders";
import { useCart } from "@/components/AppProviders";
import {
  IconBank,
  IconBox,
  IconCheck,
  IconClock,
  IconInfo,
  IconQr,
  IconReceipt,
  IconShield,
  IconSpinner,
  IconWallet,
} from "@/components/Icons";
import { PaymentPill } from "@/components/StatusPill";
import { btnOutline, btnPrimary, btnQuiet, card, pill } from "@/components/ui";
import { shop } from "@/data/shop";
import { formatMoney } from "@/lib/money";
import type { Order } from "@/lib/types";

const WINDOW_MS = 15 * 60 * 1000;
const COUNTER_ADDRESS = "Kaya Grandi 24, Kralendijk";

export function PaymentPanel({ order }: { order: Order }) {
  const expiresAt = useMemo(
    () => new Date(order.createdAt).getTime() + WINDOW_MS,
    [order.createdAt],
  );
  const remaining = useCountdown(expiresAt);
  const expired = remaining <= 0;

  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <section>
        <header className="border-b border-line pb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Step 2 of 2 · Payment
          </p>
          <h1 className="mt-1.5 font-display text-3xl">Pay for {order.ref}</h1>
          <p className="mt-2 text-sm text-muted">
            The kitchen holds your slot for 15 minutes. After that the dishes go back into the pool.
          </p>
        </header>

        <div className="mt-6">
          {expired ? <ExpiredPanel order={order} /> : <MethodPanel order={order} remaining={remaining} />}
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-32 lg:h-fit">
        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Order
            </span>
            <PaymentPill status={order.paymentStatus} />
          </div>
          <p className="mt-2 font-display text-2xl tracking-tight">{order.ref}</p>

          <dl className="mt-4 space-y-2.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Batch slot</dt>
              <dd className="text-right font-medium">{order.slot}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">
                {order.fulfilment === "pickup" ? "Collect at" : "Deliver to"}
              </dt>
              <dd className="max-w-[60%] text-right font-medium">
                {order.fulfilment === "pickup" ? COUNTER_ADDRESS : order.address}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Dishes</dt>
              <dd className="font-medium">{itemCount}</dd>
            </div>
            {order.discountCents > 0 ? (
              <div className="flex justify-between gap-4 text-ok">
                <dt>Discount {order.promoCode ? `(${order.promoCode})` : ""}</dt>
                <dd className="font-medium tabular-nums">−{formatMoney(order.discountCents)}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-sm text-muted">Total due</span>
            <span className="font-display text-3xl tabular-nums">{formatMoney(order.totalCents)}</span>
          </div>

          {expired ? (
            <p className="mt-4 rounded-card bg-warn-soft px-3.5 py-3 text-xs font-medium text-warn">
              The 15 minute window ran out. Your cart is still in this browser, so you can start a
              new order without retyping anything.
            </p>
          ) : (
            <form action={payOrderAction} className="mt-5">
              <input type="hidden" name="ref" value={order.ref} />
              <PaidButton />
            </form>
          )}

          <form action={failPaymentAction} className="mt-2">
            <input type="hidden" name="ref" value={order.ref} />
            <button type="submit" className={`${btnQuiet} w-full`}>
              Something went wrong, retry
            </button>
          </form>
        </div>

        <div className={`${card} p-4`}>
          <p className="flex items-start gap-2 text-[11px] text-muted">
            <IconShield size={14} className="mt-0.5 shrink-0 text-sea" />
            Test gateway. Nothing is charged, no card data is stored, and the confirm button only
            flips a row in the demo database.
          </p>
        </div>
      </aside>
    </div>
  );
}

function MethodPanel({ order, remaining }: { order: Order; remaining: number }) {
  const method = order.paymentMethod;
  const title =
    method === "qris"
      ? "Scan the QRIS code"
      : method === "bank_transfer"
        ? "Transfer to the virtual account"
        : method === "ewallet"
          ? "Pay from Rasa Pay"
          : "Pay at the counter";

  return (
    <div className={`${card} overflow-hidden`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="font-display text-xl">{title}</h2>
          <p className="text-xs text-muted">
            {method === "cash"
              ? "Nothing to scan. Bring the exact total if you can."
              : "The code below is generated from this order and is not tied to any real account."}
          </p>
        </div>
        <span className={`${pill} bg-sand text-ink-soft`}>
          <IconClock size={13} />
          <Clock remaining={remaining} />
        </span>
      </div>

      {method === "qris" ? <QrisPanel order={order} /> : null}
      {method === "bank_transfer" ? <BankPanel order={order} /> : null}
      {method === "ewallet" ? <WalletPanel order={order} /> : null}
      {method === "cash" ? <CashPanel order={order} /> : null}
    </div>
  );
}

function QrisPanel({ order }: { order: Order }) {
  const cells = useMemo(() => buildQrMatrix(order.ref), [order.ref]);
  const payload = `rasabonaire://pay/${order.ref}?amount=${order.totalCents}&cur=USD&m=qris`;

  return (
    <div className="grid gap-6 p-5 sm:grid-cols-[auto_minmax(0,1fr)]">
      <div className="rounded-card border border-line bg-shell p-3">
        <svg
          viewBox="0 0 21 21"
          className="h-52 w-52"
          shapeRendering="crispEdges"
          role="img"
          aria-label={`QRIS code for order ${order.ref}`}
        >
          <rect width="21" height="21" fill="#ffffff" />
          {cells.map((filled, index) =>
            filled ? (
              <rect
                key={index}
                x={index % 21}
                y={Math.floor(index / 21)}
                width="1"
                height="1"
                fill="#191713"
              />
            ) : null,
          )}
        </svg>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Payload</p>
        <p className="mt-1.5 break-all rounded-card bg-sand px-3 py-2 font-mono text-[11px] text-ink-soft">
          {payload}
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Merchant</dt>
            <dd className="font-medium">Rasa Bonaire B.V.</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Amount</dt>
            <dd className="font-medium tabular-nums">{formatMoney(order.totalCents)}</dd>
          </div>
        </dl>
        <p className="mt-4 flex items-start gap-2 text-xs text-muted">
          <IconInfo size={14} className="mt-0.5 shrink-0" />
          Open your banking app, scan, then press “I have paid” below. Nothing in this shop
          removes money from anyone.
        </p>
      </div>
    </div>
  );
}

function BankPanel({ order }: { order: Order }) {
  const { notify } = useCart();
  const account = virtualAccount(order.ref);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(account);
      notify({ title: "Account number copied", body: account, tone: "ok" });
    } catch {
      notify({
        title: "Copy did not work",
        body: `Select it by hand: ${account}`,
        tone: "warn",
      });
    }
  };

  return (
    <div className="p-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-card border border-line bg-sand p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Virtual account</p>
          <p className="mt-1.5 font-mono text-lg tracking-wide">{account}</p>
          <p className="mt-1 text-xs text-muted">Rasa Bonaire B.V. · Maduro &amp; Curiel, Bonaire</p>
        </div>
        <div className="rounded-card border border-line bg-sand p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Amount</p>
          <p className="mt-1.5 font-display text-2xl tabular-nums">
            {formatMoney(order.totalCents)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Reference {order.ref}. Use it in the transfer description.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={copy} className={btnOutline}>
          <IconBank size={16} /> Copy account number
        </button>
        <p className="text-xs text-muted">
          Transfers are matched by hand, usually within an hour during kitchen hours.
        </p>
      </div>

      <ol className="mt-5 space-y-2 border-t border-line pt-4 text-xs text-muted">
        <li>1. Open your bank app and start a transfer to the account above.</li>
        <li>2. Keep the amount exact, including the cents.</li>
        <li>3. Put {order.ref} in the description so the counter can find it.</li>
      </ol>
    </div>
  );
}

function WalletPanel({ order }: { order: Order }) {
  const { notify } = useCart();
  const [checking, setChecking] = useState(true);
  const [paid, setPaid] = useState(false);
  const balance = useMemo(
    () => order.totalCents + 500 + (hash(order.ref) % 4200),
    [order.ref, order.totalCents],
  );

  useEffect(() => {
    const timer = setTimeout(() => setChecking(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-5">
      <div className="mx-auto w-full max-w-sm rounded-card border border-line bg-sand p-5">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <IconWallet size={16} className="text-accent" /> Rasa Pay
          </span>
          <span className={`${pill} bg-shell text-muted`}>demo wallet</span>
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Balance
        </p>
        <p className="font-display text-3xl tabular-nums">{formatMoney(balance)}</p>

        <div className="mt-5 space-y-2.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Paying</span>
            <span className="font-semibold tabular-nums">{formatMoney(order.totalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Left after</span>
            <span className="tabular-nums">{formatMoney(balance - order.totalCents)}</span>
          </div>
        </div>

        {checking ? (
          <p className="mt-5 flex items-center gap-2 rounded-card bg-shell px-3.5 py-3 text-xs font-medium text-muted">
            <IconSpinner size={15} /> Checking your balance…
          </p>
        ) : paid ? (
          <p className="mt-5 flex items-center gap-2 rounded-card bg-ok-soft px-3.5 py-3 text-xs font-medium text-ok">
            <IconCheck size={15} /> Wallet says yes. Confirm below to finish.
          </p>
        ) : (
          <button
            type="button"
            onClick={() => {
              setPaid(true);
              notify({
                title: "Rasa Pay approved",
                body: `${formatMoney(order.totalCents)} held for ${order.ref}.`,
                tone: "ok",
              });
            }}
            className={`${btnPrimary} mt-5 w-full`}
          >
            Confirm in Rasa Pay
          </button>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-muted">
        The wallet is a stand-in. The balance is generated for this demo order only.
      </p>
    </div>
  );
}

function CashPanel({ order }: { order: Order }) {
  return (
    <div className="p-5">
      <div className="rounded-card border border-line bg-sand p-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <IconBox size={17} className="text-accent" /> Pay when you collect
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          The order is reserved. Come to {COUNTER_ADDRESS} inside your slot and pay at the counter.
          Cash and cards both work there.
        </p>
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Bring</dt>
            <dd className="font-display text-xl tabular-nums">{formatMoney(order.totalCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Slot</dt>
            <dd className="font-medium">{order.slot}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Name on the order</dt>
            <dd className="font-medium">{order.customerName}</dd>
          </div>
        </dl>
      </div>
      <p className="mt-4 text-xs text-muted">
        We keep the warmer on for 30 minutes after your window. After that the food goes to the
        staff table.
      </p>
    </div>
  );
}

function ExpiredPanel({ order }: { order: Order }) {
  return (
    <div className={`${card} p-6`}>
      <p className="flex items-center gap-2 text-sm font-semibold text-warn">
        <IconClock size={17} /> The payment window closed
      </p>
      <p className="mt-3 max-w-lg text-sm text-ink-soft">
        Order {order.ref} was created more than 15 minutes ago and the payment step timed out. Your
        cart is still saved in this browser, so nothing has to be typed again — open the menu, check
        the cart, and place the preorder once more.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/cart" className={btnPrimary}>
          <IconReceipt size={16} /> Back to the cart
        </Link>
        <Link href="/menu" className={btnOutline}>
          Open the menu
        </Link>
      </div>
      <p className="mt-4 text-xs text-muted">
        If the food was already cooked for you, call the kitchen on {shop.phone} and ask for Yanti.
        We will sort it out at the counter.
      </p>
    </div>
  );
}

function PaidButton() {
  const [pending, setPending] = useState(false);
  return (
    <button
      type="submit"
      onClick={() => setPending(true)}
      disabled={pending}
      className={`${btnPrimary} w-full py-3.5`}
    >
      {pending ? (
        <>
          <IconSpinner size={16} /> Confirming with the kitchen…
        </>
      ) : (
        <>
          <IconQr size={16} /> I have paid
        </>
      )}
    </button>
  );
}

function Clock({ remaining }: { remaining: number }) {
  const total = Math.max(0, Math.floor(remaining / 1000));
  const minutes = String(Math.floor(total / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return <span className="tabular-nums">{minutes}:{seconds}</span>;
}

function useCountdown(target: number): number {
  const [remaining, setRemaining] = useState(() => target - Date.now());

  useEffect(() => {
    setRemaining(target - Date.now());
    const timer = setInterval(() => setRemaining(target - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  return remaining;
}

/** Small deterministic hash so the QR grid and the account number never change for one ref. */
function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function virtualAccount(ref: string): string {
  const digits = String(hash(ref) % 100000000).padStart(8, "0");
  return `8808 ${digits.slice(0, 4)} ${digits.slice(4)}`;
}

/**
 * A 21x21 matrix that looks like a QR code: three finder squares, the timing
 * lines, then a deterministic pattern from the order ref. It is decoration, not
 * a scannable payload.
 */
function buildQrMatrix(ref: string): boolean[] {
  const size = 21;
  const cells = new Array<boolean>(size * size).fill(false);
  const set = (x: number, y: number, value: boolean) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    cells[y * size + x] = value;
  };
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9);

  let state = hash(ref) || 1;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (inFinder(x, y)) continue;
      state = (Math.imul(state, 1103515245) + 12345) >>> 0;
      set(x, y, (state >>> 16) % 100 < 44);
    }
  }

  for (let i = 0; i < size; i += 1) {
    if (!inFinder(i, 6)) set(i, 6, i % 2 === 0);
    if (!inFinder(6, i)) set(6, i, i % 2 === 0);
  }

  const finder = (left: number, top: number) => {
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const edge = x === 0 || y === 0 || x === 6 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        set(left + x, top + y, edge || core);
      }
    }
    for (let y = -1; y <= 7; y += 1) {
      for (let x = -1; x <= 7; x += 1) {
        if (x >= 0 && x <= 6 && y >= 0 && y <= 6) continue;
        set(left + x, top + y, false);
      }
    }
  };

  finder(0, 0);
  finder(size - 7, 0);
  finder(0, size - 7);

  return cells;
}
