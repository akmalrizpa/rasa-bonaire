"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveSettingsAction, type AdminState } from "@/actions/admin";
import { IconCheck, IconSpinner } from "@/components/Icons";
import { card, field } from "@/components/ui";
import type { Settings } from "@/lib/types";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-card bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <IconSpinner size={15} /> : null}
      {pending ? "Saving" : "Save settings"}
    </button>
  );
}

function Cell({
  label: text,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{text}</span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction] = useActionState<AdminState, FormData>(saveSettingsAction, {});

  return (
    <form action={formAction} className={`${card} space-y-5 p-4 sm:p-5`}>
      {state.notice ? (
        <p className="flex items-center gap-2 rounded-card bg-ok-soft px-3.5 py-2.5 text-sm font-semibold text-ok">
          <IconCheck size={16} />
          {state.notice}
        </p>
      ) : null}

      {state.error ? (
        <p className="rounded-card bg-accent-soft px-3.5 py-2.5 text-sm font-semibold text-accent">
          {state.error}
        </p>
      ) : null}

      <label className="flex cursor-pointer items-start gap-3 rounded-card border border-line px-4 py-3">
        <input
          type="checkbox"
          name="storeOpen"
          defaultChecked={settings.storeOpen}
          className="mt-0.5 size-4 accent-accent"
        />
        <span>
          <span className="block text-sm font-semibold">Kitchen open for preorders</span>
          <span className="mt-0.5 block text-xs text-muted">
            Switch this off and the shop shows the closed note instead of the preorder flow.
          </span>
        </span>
      </label>

      <Cell
        label="Announcement"
        hint="One line in the black bar above the menu. Keep it under twenty words."
      >
        <input name="announcement" defaultValue={settings.announcement} className={field} />
      </Cell>

      <div className="grid gap-4 sm:grid-cols-2">
        <Cell label="Delivery fee $" hint="Used when the delivery zone has no own fee.">
          <input
            name="deliveryFeeDollars"
            inputMode="decimal"
            defaultValue={(settings.deliveryFeeCents / 100).toFixed(2)}
            className={`${field} text-right tabular-nums`}
          />
        </Cell>
        <Cell label="Free delivery from $" hint="Set 0 to charge delivery on every order.">
          <input
            name="freeDeliveryFromDollars"
            inputMode="decimal"
            defaultValue={(settings.freeDeliveryFromCents / 100).toFixed(2)}
            className={`${field} text-right tabular-nums`}
          />
        </Cell>
      </div>

      <Cell label="Pickup address">
        <input name="pickupAddress" defaultValue={settings.pickupAddress} className={field} />
      </Cell>

      <Cell label="Prep note" hint="Shown on the order confirmation and the pay page.">
        <textarea name="prepNote" defaultValue={settings.prepNote} rows={3} className={field} />
      </Cell>

      <div className="flex justify-end border-t border-line pt-4">
        <SaveButton />
      </div>
    </form>
  );
}
