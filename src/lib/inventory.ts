import "server-only";
import { supabaseAdmin } from "./supabase-admin";

export async function decrementStockForOrder(orderId: string): Promise<void> {
  const { data: items } = await supabaseAdmin
    .from("order_items")
    .select("product_id, size, quantity")
    .eq("order_id", orderId);

  if (!items) return;

  for (const item of items) {
    if (!item.product_id || !item.size) continue;
    await supabaseAdmin.rpc("decrement_size_stock", {
      p_product_id: item.product_id,
      p_size: item.size,
      p_quantity: item.quantity,
    });
  }
}
