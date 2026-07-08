"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { setBuyNowItem } from "@/lib/buy-now";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function currentItem() {
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      size,
      quantity,
    };
  }

  function handleAddToCart() {
    addItem(currentItem());
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    setBuyNowItem(currentItem());
    router.push("/checkout?buyNow=1");
  }

  return (
    <div className="space-y-6">
      {product.sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Size</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={cn(
                  "min-w-11 rounded-md border px-3 py-2 text-sm transition",
                  s === size
                    ? "border-(--brand-gold) bg-(--brand-gold) text-white"
                    : "border-border hover:border-(--brand-gold)/50"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium">Quantity</p>
        <div className="flex w-fit items-center rounded-md border border-border">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center text-lg hover:bg-muted disabled:opacity-30"
            disabled={quantity <= 1}
          >
            −
          </button>
          <span className="w-10 text-center text-sm tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => q + 1)}
            className="flex h-10 w-10 items-center justify-center text-lg hover:bg-muted"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          size="lg"
          variant="outline"
          className="h-12 flex-1 text-sm"
          onClick={handleAddToCart}
        >
          {added ? "Added ✓" : "Add to Cart"}
        </Button>
        <Button size="lg" className="h-12 flex-1 text-sm" onClick={handleBuyNow}>
          Buy Now
        </Button>
      </div>
    </div>
  );
}
