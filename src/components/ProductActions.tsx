"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { setBuyNowItem } from "@/lib/buy-now";
import {
  PRODUCT_SIZES,
  PRODUCT_COLOR_SWATCHES,
  totalStock,
  getDiscountedPrice,
  type Product,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ProductActions({
  product,
  onColorSelect,
}: {
  product: Product;
  onColorSelect?: (color: string) => void;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const sizesWithStock = PRODUCT_SIZES.filter(
    (s) => (product.size_quantities[s] ?? 0) > 0
  );
  const [size, setSize] = useState(sizesWithStock[0] ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const available = product.size_quantities[size as (typeof PRODUCT_SIZES)[number]] ?? 0;
  const outOfStock = totalStock(product.size_quantities) === 0;
  const price = getDiscountedPrice(product.price, product.discount_percent);

  function currentItem() {
    return {
      productId: product.id,
      name: product.name,
      price,
      image_url: product.image_urls[0] ?? "",
      size,
      color: color || undefined,
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

  if (outOfStock) {
    return <p className="text-sm font-medium text-muted-foreground uppercase">Out of stock</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium">Size</p>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_SIZES.map((s) => {
            const stock = product.size_quantities[s] ?? 0;
            if (stock === 0) return null;
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s);
                  setQuantity(1);
                }}
                className={cn(
                  "min-w-11 rounded-md border px-3 py-2 text-sm transition",
                  s === size
                    ? "border-(--brand-gold) bg-(--brand-gold) text-white"
                    : "border-border hover:border-(--brand-gold)/50"
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {product.colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Color{color ? `: ${color}` : ""}</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                onClick={() => {
                  setColor(c);
                  onColorSelect?.(c);
                }}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition",
                  c === color ? "border-(--brand-gold)" : "border-border"
                )}
                style={{ backgroundColor: PRODUCT_COLOR_SWATCHES[c] ?? "#cccccc" }}
              />
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
            onClick={() => setQuantity((q) => Math.min(available, q + 1))}
            className="flex h-10 w-10 items-center justify-center text-lg hover:bg-muted disabled:opacity-30"
            disabled={quantity >= available}
          >
            +
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{available} in stock</p>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          size="lg"
          variant="outline"
          className="flex-1 py-4 text-sm"
          onClick={handleAddToCart}
        >
          {added ? "Added ✓" : "Add to Cart"}
        </Button>
        <Button size="lg" className="flex-1 py-4 text-sm" onClick={handleBuyNow}>
          Buy Now
        </Button>
      </div>
    </div>
  );
}
