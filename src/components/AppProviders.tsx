"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { IconCheck, IconClose, IconInfo } from "@/components/Icons";

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  unit: string;
  priceCents: number;
  qty: number;
  optionIds: string[];
  optionLabels: string[];
  note?: string;
  art: string;
};

export type CartLineInput = Omit<CartItem, "key" | "qty"> & { qty?: number };

export type Toast = {
  id: string;
  title: string;
  body?: string;
  tone?: "ok" | "info" | "warn";
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotalCents: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (line: CartLineInput, options?: { flyFrom?: HTMLElement | null; silent?: boolean }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  toasts: Toast[];
  notify: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "rasa.cart.v1";

export function makeLineKey(productId: string, optionIds: string[], note?: string): string {
  return [productId, [...optionIds].sort().join("+"), (note ?? "").trim().toLowerCase()].join("|");
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* a broken cart should never block the menu */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full or blocked: the cart still works for this session */
    }
  }, [items, ready]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((current) => [...current.slice(-2), { ...toast, id }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), 4200),
      );
    },
    [dismiss],
  );

  const flyToCart = useCallback((from: HTMLElement) => {
    const target = document.getElementById("cart-button");
    if (!target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const start = from.getBoundingClientRect();
    const end = target.getBoundingClientRect();
    const dot = document.createElement("span");
    dot.style.cssText = `position:fixed;left:${start.left + start.width / 2 - 7}px;top:${start.top + start.height / 2 - 7}px;width:14px;height:14px;border-radius:9999px;background:#bc3a24;z-index:80;pointer-events:none;box-shadow:0 6px 16px -6px rgba(188,58,36,.9)`;
    document.body.appendChild(dot);

    const dx = end.left + end.width / 2 - (start.left + start.width / 2);
    const dy = end.top + end.height / 2 - (start.top + start.height / 2);
    const animation = dot.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.55}px,${dy * 0.15 - 60}px) scale(1.15)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px,${dy}px) scale(.4)`, opacity: 0.2 },
      ],
      { duration: 620, easing: "cubic-bezier(.4,.1,.6,1)" },
    );
    animation.onfinish = () => dot.remove();
  }, []);

  const add = useCallback<CartContextValue["add"]>(
    (line, options) => {
      const qty = line.qty ?? 1;
      const key = makeLineKey(line.productId, line.optionIds, line.note);
      setItems((current) => {
        const index = current.findIndex((item) => item.key === key);
        if (index >= 0) {
          const next = [...current];
          next[index] = { ...next[index], qty: Math.min(20, next[index].qty + qty) };
          return next;
        }
        return [...current, { ...line, key, qty: Math.min(20, qty) }];
      });

      if (options?.flyFrom) flyToCart(options.flyFrom);
      if (!options?.silent) {
        notify({
          title: `${line.name} added`,
          body: line.optionLabels.length ? line.optionLabels.join(" · ") : "Ready in your cart.",
          tone: "ok",
        });
      }
    },
    [flyToCart, notify],
  );

  const setQty = useCallback((key: string, qty: number) => {
    setItems((current) =>
      qty <= 0
        ? current.filter((item) => item.key !== key)
        : current.map((item) => (item.key === key ? { ...item, qty: Math.min(20, qty) } : item)),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotalCents = items.reduce((sum, item) => sum + item.qty * item.priceCents, 0);
    return {
      items,
      ready,
      count,
      subtotalCents,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      add,
      setQty,
      remove,
      clear,
      toasts,
      notify,
      dismiss,
    };
  }, [items, ready, drawerOpen, add, setQty, remove, clear, toasts, notify, dismiss]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart has to be used inside AppProviders");
  return context;
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[70] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:items-end">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-rise pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border border-line bg-shell px-4 py-3 shadow-pop"
          role="status"
        >
          <span
            className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
              toast.tone === "ok" ? "bg-ok-soft text-ok" : "bg-accent-soft text-accent"
            }`}
          >
            {toast.tone === "ok" ? <IconCheck size={14} /> : <IconInfo size={14} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">{toast.title}</span>
            {toast.body ? <span className="mt-0.5 block text-xs text-muted">{toast.body}</span> : null}
          </span>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="rounded-full p-1 text-muted transition hover:bg-sand hover:text-ink"
            aria-label="Dismiss"
          >
            <IconClose size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
