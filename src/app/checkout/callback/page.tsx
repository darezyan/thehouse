import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyTransaction } from "@/lib/flutterwave";
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

async function resolveOutcome(
  txRef: string | undefined,
  transactionId: string | undefined
): Promise<Outcome> {
  if (!txRef) {
    return {
      success: false,
      message: "We couldn't find that payment. If you were charged, contact us with your bank reference.",
    };
  }

  const isBuyNow = txRef.includes("-buynow-");

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, customer_name, total, payment_status")
    .eq("payment_ref", txRef)
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

  if (!transactionId) {
    // No transaction id at all means Flutterwave never processed a charge
    // attempt (e.g. the customer navigated away before paying). The redirect
    // `status` query param itself is not trustworthy for a final decision —
    // Flutterwave's own docs say to always verify via the API instead, which
    // is why that's the only thing checked below.
    await supabaseAdmin.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
    return { success: false, message: "Your payment wasn't completed. You can try again." };
  }

  try {
    const verified = await verifyTransaction(transactionId);
    const amountMatches = Math.abs(verified.amount - Number(order.total)) < 1;
    const isValid =
      verified.status === "successful" &&
      verified.txRef === txRef &&
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
      .update({ payment_status: "paid", flw_transaction_id: transactionId })
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
  searchParams: Promise<{ status?: string; tx_ref?: string; transaction_id?: string }>;
}) {
  const { tx_ref, transaction_id } = await searchParams;
  const outcome = await resolveOutcome(tx_ref, transaction_id);

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
