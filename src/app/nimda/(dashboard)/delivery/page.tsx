import { supabaseAdmin } from "@/lib/supabase-admin";
import { DEFAULT_DELIVERY_FEES } from "@/lib/delivery";
import DeliveryForm from "./delivery-form";

export const revalidate = 0;

export default async function AdminDeliveryPage() {
  const { data } = await supabaseAdmin
    .from("delivery_settings")
    .select("lagos_fee, other_states_fee")
    .eq("id", 1)
    .single();

  const fees = data
    ? { lagosFee: Number(data.lagos_fee), otherStatesFee: Number(data.other_states_fee) }
    : DEFAULT_DELIVERY_FEES;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-semibold tracking-wide uppercase">Delivery</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        These fees are applied automatically at checkout based on the customer&apos;s state —
        Lagos gets the Lagos fee, every other state gets the other fee.
      </p>
      <DeliveryForm lagosFee={fees.lagosFee} otherStatesFee={fees.otherStatesFee} />
    </div>
  );
}
