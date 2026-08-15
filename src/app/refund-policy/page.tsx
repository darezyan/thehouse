import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
};

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-2xl font-semibold tracking-wide uppercase">Refund Policy</h1>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="font-medium uppercase">Order Cancellations</h2>
          <p className="mt-2 text-muted-foreground">
            Because most items are made or reserved to order, we&apos;re only able to
            cancel an order if it hasn&apos;t yet been processed. Contact us as soon as
            possible after placing your order if you need to cancel.
          </p>
        </section>

        <section>
          <h2 className="font-medium uppercase">Returns &amp; Exchanges</h2>
          <p className="mt-2 text-muted-foreground">
            If an item arrives damaged, defective, or incorrect, contact us within 48
            hours of delivery with your order number and photos of the item. We&apos;ll
            arrange a replacement or exchange at no extra cost.
          </p>
          <p className="mt-2 text-muted-foreground">
            We do not accept returns or exchanges for change of mind, incorrect size
            selection, or general dissatisfaction, unless the item is faulty.
          </p>
        </section>

        <section>
          <h2 className="font-medium uppercase">Refunds</h2>
          <p className="mt-2 text-muted-foreground">
            Where a refund is approved, it will be issued to your original payment
            method within 7–14 business days. Delivery fees are non-refundable
            except where the order was cancelled before dispatch or the item was
            faulty.
          </p>
        </section>

        <section>
          <h2 className="font-medium uppercase">Contact</h2>
          <p className="mt-2 text-muted-foreground">
            For any refund or return request, email us at{" "}
            <a href="mailto:memoriqr6@gmail.com" className="text-(--brand-gold) hover:underline">
              memoriqr6@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
