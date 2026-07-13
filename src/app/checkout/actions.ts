"use server";

import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { initiatePayment } from "@/lib/flutterwave";
import { checkoutSchema, deliveryFeeForState, type CheckoutFormValues } from "@/lib/checkout";
import { DEFAULT_DELIVERY_FEES } from "@/lib/delivery";
import type { CartItem } from "@/lib/types";

export async function initiateCheckoutAction(
  values: CheckoutFormValues,
  items: CartItem[],
  isBuyNow: boolean
): Promise<{ error?: string; redirectUrl?: string }> {
  const result = checkoutSchema.safeParse(values);
  if (!result.success) {
    return { error: "Please check your delivery details and try again." };
  }
  if (!items.length) {
    return { error: "There's nothing to order." };
  }

  // A cart persists in the browser indefinitely, so it can reference a
  // product that's since been deleted from admin — inserting an order_item
  // for it would violate the products FK, so catch it early with a clear
  // message instead of a generic failure.
  const productIds = [...new Set(items.map((i) => i.productId))];
  const { data: existingProducts } = await supabaseAdmin
    .from("products")
    .select("id")
    .in("id", productIds);
  const existingIds = new Set((existingProducts ?? []).map((p) => p.id));
  const missingNames = [
    ...new Set(
      items.filter((i) => !existingIds.has(i.productId)).map((i) => i.name)
    ),
  ];
  if (missingNames.length > 0) {
    const verb = missingNames.length === 1 ? "no longer exists" : "no longer exist";
    return {
      error: `${missingNames.join(", ")} ${verb}. Please remove ${missingNames.length === 1 ? "it" : "them"} from your cart and try again.`,
    };
  }

  const data = result.data;

  // Never trust a client-supplied fee — re-fetch the current rates server-side.
  const { data: settings } = await supabaseAdmin
    .from("delivery_settings")
    .select("lagos_fee, other_states_fee")
    .eq("id", 1)
    .single();
  const deliveryFees = settings
    ? { lagosFee: Number(settings.lagos_fee), otherStatesFee: Number(settings.other_states_fee) }
    : DEFAULT_DELIVERY_FEES;

  const deliveryFee = deliveryFeeForState(data.state, deliveryFees);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + deliveryFee;
  // The "buynow"/"cart" marker lets /checkout/callback know whether to clear
  // just the buy-now item or the whole cart once payment is confirmed.
  const txRef = `thehouse-${isBuyNow ? "buynow" : "cart"}-${randomUUID()}`;

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.town,
      state: data.state,
      delivery_fee: deliveryFee,
      notes: data.notes || null,
      total,
      payment_ref: txRef,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: "Something went wrong placing your order. Please try again." };
  }

  const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      size: item.size,
      color: item.color ?? null,
      quantity: item.quantity,
      unit_price: item.price,
    }))
  );

  if (itemsError) {
    // Don't leave a total-but-no-items order sitting in the DB forever.
    await supabaseAdmin.from("orders").delete().eq("id", order.id);
    return { error: "Something went wrong placing your order. Please try again." };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  try {
    const link = await initiatePayment({
      txRef,
      amount: total,
      redirectUrl: `${baseUrl}/checkout/callback`,
      customerEmail: data.email,
      customerPhone: data.phone,
      customerName: data.name,
    });
    return { redirectUrl: link };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Failed to start payment. Please try again.",
    };
  }
}
