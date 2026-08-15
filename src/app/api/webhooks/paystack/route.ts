import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyTransaction, verifyWebhookSignature } from "@/lib/paystack";
import { decrementStockForOrder } from "@/lib/inventory";

// Backstop for the /checkout/callback verification: if a customer closes
// their browser right after paying and never returns to the callback page,
// this webhook still confirms the payment and marks the order paid.
export async function POST(request: NextRequest) {
  // Signature verification needs the exact raw body, so read it as text
  // before any JSON parsing.
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");
  if (!verifyWebhookSignature(signature, rawBody)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const reference: string | undefined = payload?.data?.reference;

  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, total, payment_status")
    .eq("payment_ref", reference)
    .single();

  if (!order || order.payment_status === "paid") {
    return NextResponse.json({ received: true });
  }

  try {
    // Never trust the webhook payload's amount/status directly — re-verify
    // against Paystack's API using the reference.
    const verified = await verifyTransaction(reference);
    const amountMatches = Math.abs(verified.amount - Number(order.total)) < 1;
    const isValid =
      verified.status === "success" &&
      verified.reference === reference &&
      verified.currency === "NGN" &&
      amountMatches;

    if (isValid) {
      // Same once-only guard as the callback page: only decrement stock on
      // the update that actually flips pending -> paid, so a payment
      // confirmed by both the webhook and the callback page never gets its
      // stock decremented twice.
      const { data: updated } = await supabaseAdmin
        .from("orders")
        .update({ payment_status: "paid", paystack_transaction_id: String(verified.id) })
        .eq("id", order.id)
        .neq("payment_status", "paid")
        .select("id")
        .maybeSingle();

      if (updated) {
        await decrementStockForOrder(order.id);
      }
    }
  } catch {
    // The callback page is the primary confirmation path; swallow verify
    // errors here so Paystack doesn't retry-storm a broken webhook call.
  }

  return NextResponse.json({ received: true });
}
