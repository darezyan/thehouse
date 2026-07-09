"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/require-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

// One-way: an order can only move pending -> delivered, never back.
export async function markOrderDeliveredAction(orderId: string) {
  await requireAdminAction();

  await supabaseAdmin
    .from("orders")
    .update({ status: "delivered" })
    .eq("id", orderId)
    .eq("status", "pending");

  revalidatePath("/nimda/orders");
}
