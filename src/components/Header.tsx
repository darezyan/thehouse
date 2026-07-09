"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/nimda")) {
    return null;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex items-start justify-between px-5 py-4">
      <div className="relative">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
          className="text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
        >
          {open ? (
            <X size={28} strokeWidth={2.75} />
          ) : (
            <Menu size={28} strokeWidth={2.75} />
          )}
        </button>

        {open && (
          <nav className="absolute top-10 left-0 flex w-56 flex-col gap-4 bg-(--brand-cream) px-6 py-6 text-lg font-semibold tracking-wide text-black uppercase shadow-xl">
            <Link href="/" onClick={() => setOpen(false)}>
              Home
            </Link>
            <Link href="/shop" onClick={() => setOpen(false)}>
              Shop
            </Link>
            <Link href="/cart" onClick={() => setOpen(false)}>
              Cart
            </Link>
          </nav>
        )}
      </div>

      <Link
        href="/cart"
        aria-label="Cart"
        className="relative text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
      >
        <ShoppingBag size={26} strokeWidth={2.75} />
        {count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--brand-gold) px-1 text-[10px] font-medium text-white">
            {count}
          </span>
        )}
      </Link>
    </header>
  );
}
