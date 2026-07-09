import { supabase } from "./supabase";

export type DeliveryFees = {
  lagosFee: number;
  otherStatesFee: number;
};

export const DEFAULT_DELIVERY_FEES: DeliveryFees = {
  lagosFee: 5000,
  otherStatesFee: 10000,
};

export async function getDeliveryFees(): Promise<DeliveryFees> {
  const { data, error } = await supabase
    .from("delivery_settings")
    .select("lagos_fee, other_states_fee")
    .eq("id", 1)
    .single();

  if (error || !data) {
    console.error("Failed to load delivery settings:", error?.message);
    return DEFAULT_DELIVERY_FEES;
  }

  return {
    lagosFee: Number(data.lagos_fee),
    otherStatesFee: Number(data.other_states_fee),
  };
}
