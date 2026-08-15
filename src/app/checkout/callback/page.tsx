import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyTransaction } from "@/lib/paystack";
import { decrementStockForOrder } from "@/lib/inventory";
import { Button } from "@/components/ui/button";
import ClearPurchasedItems from "./clear-purchased-items";

export const revalidate = 0;

type Outcome = {
  success: boolean;
  message?: string;
  orderId?: string;
  customerName?: string;
  isBuyNow?: boolean;
};

async function resolveOutcome(reference: string | undefined): Promise<Outcome> {
  if (!reference) {
    return {
      success: false,
      message: "We couldn't find that payment. If you were charged, contact us with your bank reference.",
    };
  }

  const isBuyNow = reference.includes("-buynow-");

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, customer_name, total, payment_status")
    .eq("payment_ref", reference)
    .single();

  if (!order) {
    return {
      success: false,
      message: "We couldn't find that order. If you were charged, contact us with your bank reference.",
    };
  }

  if (order.payment_status === "paid") {
    return { success: true, orderId: order.id, customerName: order.customer_name, isBuyNow };
  }

  try {
    // The redirect itself is not trustworthy for a final decision — Paystack's
    // own docs say to always verify via the API instead, which is why that's
    // the only thing checked below.
    const verified = await verifyTransaction(reference);
    const amountMatches = Math.abs(verified.amount - Number(order.total)) < 1;
    const isValid =
      verified.status === "success" &&
      verified.reference === reference &&
      verified.currency === "NGN" &&
      amountMatches;

    if (!isValid) {
      await supabaseAdmin.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
      return {
        success: false,
        message: "We couldn't confirm this payment. Please try again or contact us.",
      };
    }

    // Only decrement stock on the update that actually flips pending -> paid.
    // The webhook can independently mark the same order paid; the `.neq`
    // guard means whichever of the two runs first "wins" the row (Postgres
    // serializes concurrent updates to the same row), and the other gets
    // back no row, so stock never gets decremented twice for one order.
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

    return { success: true, orderId: order.id, customerName: order.customer_name, isBuyNow };
  } catch {
    return {
      success: false,
      message: "We couldn't confirm this payment. Please try again or contact us.",
    };
  }
}

export default async function CheckoutCallbackPage({
  searchParams,
}: {
  // Paystack appends both `reference` and `trxref` (same value) to the
  // callback_url; accept either.
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const { reference, trxref } = await searchParams;
  const outcome = await resolveOutcome(reference ?? trxref);

  return (
    <div
      className="-mt-16 flex min-h-screen items-center justify-center bg-cover bg-center px-5 pt-16"
      style={{ backgroundImage: "url('/brand/banner.jpg')" }}
    >
      <div className="mx-auto w-full max-w-md bg-(--brand-cream)/95 px-8 py-14 text-center shadow-xl">
        {outcome.success ? (
          <>
            <ClearPurchasedItems isBuyNow={outcome.isBuyNow ?? false} />
            <h1 className="text-2xl font-semibold tracking-wide uppercase">Payment successful</h1>
            <p className="mt-2 text-muted-foreground">
              Thanks for your order{outcome.customerName ? `, ${outcome.customerName.split(" ")[0]}` : ""}!
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-wide uppercase">
              Payment not completed
            </h1>
            <p className="mt-2 text-muted-foreground">{outcome.message}</p>
          </>
        )}

        <Button
          className="mt-6 h-11 px-6"
          nativeButton={false}
          render={
            <Link href={outcome.success ? "/shop" : "/checkout"}>
              {outcome.success ? "Continue shopping" : "Back to checkout"}
            </Link>
          }
        />
      </div>
    </div>
  );
}
