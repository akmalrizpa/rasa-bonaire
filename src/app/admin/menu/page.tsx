import { MenuEditor } from "@/components/admin/MenuEditor";
import { listCategories, listProducts } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = { title: "Menu" };

export default async function AdminMenuPage() {
  const [products, categories] = await Promise.all([listProducts(), listCategories()]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl">Menu</h1>
        <p className="mt-1 text-sm text-muted">
          Price, prep time and availability. Changes go live on the shop menu right away.
        </p>
      </header>

      <MenuEditor products={products} categories={categories} />
    </div>
  );
}
