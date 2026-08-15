"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/nimda")) {
    return null;
  }

  return (
    <footer className="border-t border-(--border) bg-(--brand-cream) px-5 py-8 text-sm text-(--foreground)">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-muted-foreground">
          &copy; {new Date().getFullYear()} The House. All rights reserved.
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 uppercase tracking-wide">
          <Link href="/contact" className="hover:text-(--brand-gold)">
            Contact
          </Link>
          <Link href="/refund-policy" className="hover:text-(--brand-gold)">
            Refund Policy
          </Link>
          <Link href="/terms" className="hover:text-(--brand-gold)">
            Terms &amp; Conditions
          </Link>
          <Link href="/privacy-policy" className="hover:text-(--brand-gold)">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
