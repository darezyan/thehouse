"use server";

import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { initiatePayment } from "@/lib/flutterwave";
import { checkoutSchema, deliveryFeeForState, type CheckoutFormValues } from "@/lib/checkout";
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

  const data = result.data;
  const deliveryFee = deliveryFeeForState(data.state);
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
      quantity: item.quantity,
      unit_price: item.price,
    }))
  );

  if (itemsError) {
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
