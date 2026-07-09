"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useBuyNowItem } from "@/lib/buy-now";
import {
  NIGERIAN_STATES,
  checkoutSchema,
  deliveryFeeForState,
  type CheckoutFormValues,
} from "@/lib/checkout";
import type { DeliveryFees } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import { initiateCheckoutAction } from "@/app/checkout/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

type FieldErrors = Partial<Record<keyof CheckoutFormValues, string>>;

export default function CheckoutForm({ deliveryFees }: { deliveryFees: DeliveryFees }) {
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("buyNow") === "1";
  const { items: cartItems } = useCart();
  const buyNowItem = useBuyNowItem();

  const items = useMemo(
    () => (isBuyNow ? (buyNowItem ? [buyNowItem] : []) : cartItems),
    [isBuyNow, buyNowItem, cartItems]
  );
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    town: "",
    state: "",
    notes: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryFee = useMemo(
    () => deliveryFeeForState(form.state, deliveryFees),
    [form.state, deliveryFees]
  );
  const total = subtotal + deliveryFee;

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof CheckoutFormValues;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    if (items.length === 0) {
      setError("There's nothing to order.");
      return;
    }

    setSubmitting(true);

    const { error: initError, redirectUrl } = await initiateCheckoutAction(
      result.data,
      items,
      isBuyNow
    );

    if (initError || !redirectUrl) {
      setError(initError ?? "Something went wrong placing your order. Please try again.");
      setSubmitting(false);
      return;
    }

    // Cart/buy-now item are only cleared once /checkout/callback confirms
    // payment succeeded, not here — the customer hasn't paid yet.
    window.location.href = redirectUrl;
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
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              Delivery details
            </h2>

            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && (
                <p className="text-sm text-destructive">{fieldErrors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                aria-invalid={!!fieldErrors.phone}
              />
              {fieldErrors.phone && (
                <p className="text-sm text-destructive">{fieldErrors.phone}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address">Delivery address</Label>
              <Textarea
                id="address"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                aria-invalid={!!fieldErrors.address}
              />
              {fieldErrors.address && (
                <p className="text-sm text-destructive">{fieldErrors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="town">Town</Label>
                <Input
                  id="town"
                  value={form.town}
                  onChange={(e) => update("town", e.target.value)}
                  aria-invalid={!!fieldErrors.town}
                />
                {fieldErrors.town && (
                  <p className="text-sm text-destructive">{fieldErrors.town}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <select
                  id="state"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  aria-invalid={!!fieldErrors.state}
                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
                >
                  <option value="" disabled>
                    Select state
                  </option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {fieldErrors.state && (
                  <p className="text-sm text-destructive">{fieldErrors.state}</p>
                )}
              </div>
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
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Delivery</span>
                <span>
                  {form.state ? formatPrice(deliveryFee) : "Select a state"}
                </span>
              </div>
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
