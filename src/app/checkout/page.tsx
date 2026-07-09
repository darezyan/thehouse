import { Suspense } from "react";
import CheckoutForm from "@/components/CheckoutForm";
import { getDeliveryFees } from "@/lib/delivery";

export const revalidate = 0;

export default async function CheckoutPage() {
  const deliveryFees = await getDeliveryFees();

  return (
    <Suspense>
      <CheckoutForm deliveryFees={deliveryFees} />
    </Suspense>
  );
}
