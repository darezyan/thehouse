"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, setQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div
        className="-mt-16 flex min-h-screen items-center justify-center bg-cover bg-center px-5 pt-16"
        style={{ backgroundImage: "url('/brand/banner.jpg')" }}
      >
        <div className="mx-auto w-full max-w-md bg-white/95 px-8 py-14 text-center shadow-xl">
          <h1 className="text-2xl font-semibold tracking-wide uppercase">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">
            Looks like you haven&apos;t added anything yet.
          </p>
          <Button className="mt-6 h-11 px-6" nativeButton={false} render={<Link href="/shop">Continue shopping</Link>} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="-mt-16 min-h-screen bg-cover bg-center px-5 pt-24 pb-16"
      style={{ backgroundImage: "url('/brand/banner.jpg')" }}
    >
      <div className="mx-auto max-w-3xl bg-white/95 px-6 py-10 shadow-xl sm:px-10">
      <h1 className="mb-8 text-2xl font-semibold tracking-wide uppercase">Your Cart</h1>

      <div className="space-y-6">
        {items.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="flex gap-4">
            <div className="h-28 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Size {item.size}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center rounded-md border border-border">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() =>
                      setQuantity(item.productId, item.size, item.quantity - 1)
                    }
                    className="flex h-8 w-8 items-center justify-center hover:bg-muted"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() =>
                      setQuantity(item.productId, item.size, item.quantity + 1)
                    }
                    className="flex h-8 w-8 items-center justify-center hover:bg-muted"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.size)}
                  className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

        <Separator className="my-8" />

        <div className="flex items-center justify-between text-base font-medium">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        <Button className="mt-6 h-12 w-full text-sm" nativeButton={false} render={<Link href="/checkout">Checkout</Link>} />
      </div>
    </div>
  );
}
