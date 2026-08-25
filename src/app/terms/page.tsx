import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-2xl font-semibold tracking-wide uppercase">
        Terms &amp; Conditions
      </h1>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="font-medium uppercase">Overview</h2>
          <p className="mt-2 text-muted-foreground">
            By accessing and placing an order with The House, you confirm that you
            are in agreement with and bound by these terms and conditions.
          </p>
        </section>

        <section>
          <h2 className="font-medium uppercase">Products &amp; Pricing</h2>
          <p className="mt-2 text-muted-foreground">
            We make every effort to display our products and prices as accurately
            as possible. Prices are listed in Nigerian Naira (NGN) and are subject
            to change without notice. We reserve the right to limit quantities and
            refuse or cancel any order.
          </p>
        </section>

        <section>
          <h2 className="font-medium uppercase">Payment</h2>
          <p className="mt-2 text-muted-foreground">
            Payments are processed securely through Flutterwave. We do not store your
            card details on our servers.
          </p>
        </section>

        <section>
          <h2 className="font-medium uppercase">Delivery</h2>
          <p className="mt-2 text-muted-foreground">
            Delivery timelines provided at checkout are estimates. We are not
            liable for delays caused by circumstances outside our control, such as
            courier delays.
          </p>
        </section>

        <section>
          <h2 className="font-medium uppercase">Returns &amp; Refunds</h2>
          <p className="mt-2 text-muted-foreground">
            Returns, exchanges, and refunds are governed by our{" "}
            <a href="/refund-policy" className="text-(--brand-gold) hover:underline">
              Refund Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-medium uppercase">Changes to These Terms</h2>
          <p className="mt-2 text-muted-foreground">
            We may update these terms from time to time. Continued use of the site
            after changes are posted constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="font-medium uppercase">Contact</h2>
          <p className="mt-2 text-muted-foreground">
            Questions about these terms can be sent to{" "}
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
