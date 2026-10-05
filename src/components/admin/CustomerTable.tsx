"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { setUserRoleAction, type AdminState } from "@/actions/admin";
import { useCart } from "@/components/AppProviders";
import { IconSpinner } from "@/components/Icons";
import { card, field } from "@/components/ui";
import { formatDay, formatMoney } from "@/lib/money";
import type { Order, PublicUser } from "@/lib/types";

const changeRole = async (_prev: AdminState, formData: FormData): Promise<AdminState> =>
  setUserRoleAction(formData);

function SaveRoleButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-card border border-line bg-shell px-3 py-1.5 text-xs font-semibold transition hover:border-ink/30 hover:bg-sand disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? <IconSpinner size={13} /> : null}
      {pending ? "Saving" : "Save role"}
    </button>
  );
}

function RoleCell({ user }: { user: PublicUser }) {
  const [state, formAction] = useActionState(changeRole, {});
  const [role, setRole] = useState(user.role);
  const { notify } = useCart();

  useEffect(() => {
    if (state.error) {
      setRole(user.role);
      notify({ title: "Role unchanged", body: state.error, tone: "warn" });
    } else if (state.notice) {
      notify({ title: state.notice, tone: "ok" });
    }
  }, [state, notify, user.role]);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={user.id} />
      <select
        name="role"
        value={role}
        onChange={(event) => setRole(event.target.value as PublicUser["role"])}
        className={`${field} w-28 py-1.5 text-xs`}
        aria-label={`Role for ${user.username}`}
      >
        <option value="customer">Customer</option>
        <option value="admin">Admin</option>
      </select>
      <SaveRoleButton />
    </form>
  );
}

export function CustomerTable({ users, orders }: { users: PublicUser[]; orders: Order[] }) {
  const stats = new Map<string, { count: number; paidCents: number }>();
  for (const order of orders) {
    if (!order.userId) continue;
    const entry = stats.get(order.userId) ?? { count: 0, paidCents: 0 };
    entry.count += 1;
    if (order.paymentStatus === "paid") entry.paidCents += order.totalCents;
    stats.set(order.userId, entry);
  }

  const admins = users.filter((user) => user.role === "admin").length;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        <span className="font-semibold text-ink tabular-nums">{users.length}</span> accounts ·{" "}
        <span className="font-semibold text-ink tabular-nums">{admins}</span> admins ·{" "}
        <span className="font-semibold text-ink tabular-nums">{users.length - admins}</span>{" "}
        customers
      </p>

      <div className={`${card} overflow-x-auto`}>
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Account
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Contact
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Member since
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Orders
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Paid
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((user) => {
              const entry = stats.get(user.id) ?? { count: 0, paidCents: 0 };
              return (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <span className="block font-semibold">{user.username}</span>
                    <span className="block text-xs text-muted">{user.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block text-xs">{user.email || "No email"}</span>
                    <span className="block text-xs text-muted">{user.phone || "No phone"}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{formatDay(user.createdAt)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{entry.count}</td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {formatMoney(entry.paidCents)}
                  </td>
                  <td className="px-4 py-3">
                    <RoleCell user={user} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted">
        Order counts only include preorders placed while signed in. The last admin cannot be demoted.
      </p>
    </div>
  );
}
