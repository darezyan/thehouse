"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/require-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type DeliveryFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

const deliveryFeesSchema = z.object({
  lagosFee: z.coerce.number().min(0, "Enter a valid fee"),
  otherStatesFee: z.coerce.number().min(0, "Enter a valid fee"),
});

export async function updateDeliveryFeesAction(
  _prevState: DeliveryFormState,
  formData: FormData
): Promise<DeliveryFormState> {
  await requireAdminAction();

  const result = deliveryFeesSchema.safeParse({
    lagosFee: formData.get("lagosFee"),
    otherStatesFee: formData.get("otherStatesFee"),
  });

  if (!result.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const { error } = await supabaseAdmin
    .from("delivery_settings")
    .update({
      lagos_fee: result.data.lagosFee,
      other_states_fee: result.data.otherStatesFee,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return { error: "Something went wrong saving delivery fees. Please try again." };
  }

  revalidatePath("/nimda/delivery");
  return { success: true };
}
