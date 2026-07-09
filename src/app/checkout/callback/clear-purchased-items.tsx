"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { clearBuyNowItem } from "@/lib/buy-now";

export default function ClearPurchasedItems({ isBuyNow }: { isBuyNow: boolean }) {
  const { clear } = useCart();

  useEffect(() => {
    if (isBuyNow) {
      clearBuyNowItem();
    } else {
      clear();
    }
    // Only ever run once, right after a confirmed successful payment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
