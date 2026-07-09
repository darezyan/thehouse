import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { totalStock, type Product } from "@/lib/types";

export const revalidate = 0;

export default async function AdminHomePage() {
  const [{ data: products }, { count: orderCount }, { count: pendingCount }] = await Promise.all([
    supabaseAdmin.from("products").select("size_quantities").returns<Pick<Product, "size_quantities">[]>(),
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const productCount = products?.length ?? 0;
  const outOfStockCount = (products ?? []).filter((p) => totalStock(p.size_quantities) === 0).length;

  const stats = [
    { label: "Products", value: productCount, href: "/nimda/products" },
    { label: "Out of stock", value: outOfStockCount, href: "/nimda/products" },
    { label: "Orders", value: orderCount ?? 0, href: "/nimda/orders" },
    { label: "Pending orders", value: pendingCount ?? 0, href: "/nimda/orders" },
  ];

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold tracking-wide uppercase">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="block border border-black/10 bg-white px-5 py-6 text-center hover:border-(--brand-gold)"
          >
            <p className="text-3xl font-semibold">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
