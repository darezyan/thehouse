import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { formatPrice } from "@/lib/format";
import { PRODUCT_SIZES, totalStock, type Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "./actions";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Product[]>();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-wide uppercase">Products</h1>
        <Button className="h-10 px-5 text-sm" nativeButton={false} render={<Link href="/nimda/products/new">Add product</Link>} />
      </div>

      <div className="overflow-x-auto border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs tracking-wide text-muted-foreground uppercase">
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Qty per size</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((product) => (
              <tr key={product.id} className="border-b border-black/5 last:border-0">
                <td className="px-4 py-3">
                  <img src={product.image_url} alt="" className="h-14 w-12 object-cover" />
                </td>
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3">{formatPrice(product.price)}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {PRODUCT_SIZES.map((s) => `${s}:${product.size_quantities[s] ?? 0}`).join("  ")}
                </td>
                <td className="px-4 py-3">
                  {totalStock(product.size_quantities) > 0 ? (
                    <span className="text-xs font-medium tracking-wide text-green-700 uppercase">
                      In stock
                    </span>
                  ) : (
                    <span className="text-xs font-medium tracking-wide text-destructive uppercase">
                      Out of stock
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/nimda/products/${product.id}/edit`}
                      className="text-sm font-medium underline underline-offset-2"
                    >
                      Edit
                    </Link>
                    <form action={deleteProductAction.bind(null, product.id)}>
                      <button
                        type="submit"
                        className="text-sm font-medium text-destructive underline underline-offset-2"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {(products ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
