"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useBuyNowItem, clearBuyNowItem } from "@/lib/buy-now";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function CheckoutForm() {
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("buyNow") === "1";
  const { items: cartItems, clear: clearCart } = useCart();
  const buyNowItem = useBuyNowItem();

  const items = useMemo(
    () => (isBuyNow ? (buyNowItem ? [buyNowItem] : []) : cartItems),
    [isBuyNow, buyNowItem, cartItems]
  );
  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.phone || !form.address || !form.city) {
      setError("Please fill in all required delivery details.");
      return;
    }
    if (items.length === 0) {
      setError("There's nothing to order.");
      return;
    }

    setSubmitting(true);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: form.name,
        phone: form.phone,
        address: form.address,
        city: form.city,
        notes: form.notes || null,
        total,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      setError("Something went wrong placing your order. Please try again.");
      setSubmitting(false);
      return;
    }

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.name,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.price,
      }))
    );

    if (itemsError) {
      setError("Something went wrong placing your order. Please try again.");
      setSubmitting(false);
      return;
    }

    if (isBuyNow) {
      clearBuyNowItem();
    } else {
      clearCart();
    }
    setOrderId(order.id);
    setSubmitting(false);
  }

  if (orderId) {
    return (
      <div
        className="-mt-16 flex min-h-screen items-center justify-center bg-cover bg-center px-5 pt-16"
        style={{ backgroundImage: "url('/brand/banner.jpg')" }}
      >
        <div className="mx-auto w-full max-w-md bg-(--brand-cream)/95 px-8 py-14 text-center shadow-xl">
          <h1 className="text-2xl font-semibold tracking-wide uppercase">Order placed</h1>
          <p className="mt-2 text-muted-foreground">
            Thanks, {form.name.split(" ")[0]}. We&apos;ll deliver to {form.address},{" "}
            {form.city}. Your order reference is{" "}
            <span className="font-mono text-foreground">
              {orderId.slice(0, 8)}
            </span>
            .
          </p>
          <Button className="mt-6 h-11 px-6" nativeButton={false} render={<Link href="/shop">Continue shopping</Link>} />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className="-mt-16 flex min-h-screen items-center justify-center bg-cover bg-center px-5 pt-16"
        style={{ backgroundImage: "url('/brand/banner.jpg')" }}
      >
        <div className="mx-auto w-full max-w-md bg-(--brand-cream)/95 px-8 py-14 text-center shadow-xl">
          <h1 className="text-2xl font-semibold tracking-wide uppercase">
            Nothing to check out
          </h1>
          <p className="mt-2 text-muted-foreground">Your cart is empty.</p>
          <Button className="mt-6 h-11 px-6" nativeButton={false} render={<Link href="/shop">Go to shop</Link>} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="-mt-16 min-h-screen bg-cover bg-center px-5 pt-24 pb-16"
      style={{ backgroundImage: "url('/brand/banner.jpg')" }}
    >
      <div className="mx-auto max-w-3xl bg-(--brand-cream)/95 px-6 py-10 shadow-xl sm:px-10">
        <h1 className="mb-8 text-2xl font-semibold tracking-wide uppercase">Checkout</h1>

        <div className="grid gap-10 sm:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              Delivery details
            </h2>

            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Delivery address</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Landmark, delivery instructions, etc."
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="h-12 w-full text-sm"
              disabled={submitting}
            >
              {submitting ? "Placing order..." : `Place order · ${formatPrice(total)}`}
            </Button>
          </form>

          <div>
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">
              Order summary
            </h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex items-center gap-3"
                >
                  <div className="h-16 w-14 shrink-0 overflow-hidden bg-muted">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground">
                      Size {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between text-base font-medium">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
