import { OrdersBoard } from "@/components/admin/OrdersBoard";
import { listOrders } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl">Order board</h1>
        <p className="mt-1 text-sm text-muted">
          Every preorder, newest first. Move an order along as the kitchen works through it.
        </p>
      </header>

      <OrdersBoard orders={orders} />
    </div>
  );
}
