import { CustomerTable } from "@/components/admin/CustomerTable";
import { toPublicUser } from "@/lib/auth";
import { listOrders, listUsers } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const [accounts, orders] = await Promise.all([listUsers(), listOrders()]);
  // Password hashes stay on the server: only the public fields reach the browser.
  const users = accounts.map(toPublicUser);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl">Customers</h1>
        <p className="mt-1 text-sm text-muted">
          Accounts on the shop. Admins can open this desk and change the menu.
        </p>
      </header>

      <CustomerTable users={users} orders={orders} />
    </div>
  );
}
