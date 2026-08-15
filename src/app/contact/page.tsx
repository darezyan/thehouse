import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="text-2xl font-semibold tracking-wide uppercase">Contact Us</h1>
      <p className="mt-4 text-muted-foreground">
        Have a question about an order, sizing, or anything else? Reach out and
        we&apos;ll get back to you as soon as we can.
      </p>

      <div className="mt-8 space-y-2">
        <p>
          <span className="font-medium">Email: </span>
          <a href="mailto:memoriqr6@gmail.com" className="text-(--brand-gold) hover:underline">
            memoriqr6@gmail.com
          </a>
        </p>
        <p>
          <span className="font-medium">Instagram: </span>
          <a
            href="https://www.instagram.com/thehouse.pg?igsh=Zm4wMDB2MWVwZmps"
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--brand-gold) hover:underline"
          >
            @thehouse.pg
          </a>
        </p>
        <p>
          <span className="font-medium">TikTok: </span>
          <a
            href="https://www.tiktok.com/@house.pg?_r=1&_t=ZS-97qbxbDjXph"
            target="_blank"
            rel="noopener noreferrer"
            className="text-(--brand-gold) hover:underline"
          >
            @house.pg
          </a>
        </p>
      </div>
    </div>
  );
}
