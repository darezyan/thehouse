import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-2xl font-semibold tracking-wide uppercase">Privacy Policy</h1>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="font-medium uppercase">Information We Collect</h2>
          <p className="mt-2 text-muted-foreground">
            When you place an order, we collect information such as your name,
            phone number, delivery address, and email address in order to fulfil
            and deliver your order. Payment details are collected and processed
            directly by Flutterwave; we do not see or store your card information.
          </p>
        </section>

        <section>
          <h2 className="font-medium uppercase">How We Use Your Information</h2>
          <p className="mt-2 text-muted-foreground">
            We use your information solely to process orders, arrange delivery,
            communicate order updates, and respond to enquiries. We do not sell or
            rent your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="font-medium uppercase">Third Parties</h2>
          <p className="mt-2 text-muted-foreground">
            We share order information with third parties only where necessary to
            fulfil your order, such as our payment processor (Flutterwave) and
            delivery couriers.
          </p>
        </section>

        <section>
          <h2 className="font-medium uppercase">Data Retention</h2>
          <p className="mt-2 text-muted-foreground">
            We retain order information for as long as necessary for accounting,
            legal, and customer service purposes.
          </p>
        </section>

        <section>
          <h2 className="font-medium uppercase">Your Rights</h2>
          <p className="mt-2 text-muted-foreground">
            You may request access to, correction of, or deletion of your personal
            information at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="font-medium uppercase">Contact</h2>
          <p className="mt-2 text-muted-foreground">
            For any privacy-related questions or requests, email{" "}
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
